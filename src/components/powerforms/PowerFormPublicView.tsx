import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  PenTool, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Calculator, 
  Eye, 
  Download, 
  Send,
  Building,
  User,
  Mail,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { DocumentField, Envelope, Recipient } from '../../types/signflow';
import { evaluateFormula, evaluateConditionalVisibility, formatFieldValue } from '../../utils/fieldFormulas';
import { generateFullSha256, formatTimestamp, generateUUID } from '../../utils/cryptoUtils';
import { CustomSignatureModal } from '../signatures/CustomSignatureModal';

interface PowerFormPublicViewProps {
  powerFormId?: string;
  onExit?: () => void;
}

export const PowerFormPublicView: React.FC<PowerFormPublicViewProps> = ({
  powerFormId,
  onExit
}) => {
  const { envelopes, updateEnvelope, setActiveView, setActiveEnvelopeId, openCertificateView, notify } = useSignFlow();

  // Find target template/envelope
  const targetEnvelope = envelopes.find(e => e.id === powerFormId) || envelopes[0];

  const [step, setStep] = useState<'intake' | 'form' | 'success'>('intake');
  
  // Signer Identity
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [signerCompany, setSignerCompany] = useState('');
  const [agreedToElectronicConsent, setAgreedToElectronicConsent] = useState(false);

  // Live Field Values state
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  
  // Missing required fields validation highlight state
  const [missingFieldIds, setMissingFieldIds] = useState<string[]>([]);
  const [isSignatureMissing, setIsSignatureMissing] = useState(false);

  // Signature modal state
  const [showSigModal, setShowSigModal] = useState(false);
  const [activeSignatureFieldId, setActiveSignatureFieldId] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // Execution receipt state
  const [finalSealHash, setFinalSealHash] = useState<string>('');
  const [executionTimestamp, setExecutionTimestamp] = useState<string>('');

  // Initialize fields with default sample values
  useEffect(() => {
    if (!targetEnvelope) return;
    const initial: Record<string, any> = {};
    targetEnvelope.fields.forEach(f => {
      if (f.defaultValue) initial[f.id] = f.defaultValue;
      else if (f.type === 'number') initial[f.id] = '1';
      else if (f.type === 'checkbox') initial[f.id] = false;
      else if (f.type === 'dropdown' && f.options?.[0]) initial[f.id] = f.options[0];
    });
    setFieldValues(initial);
  }, [targetEnvelope?.id]);

  // Handle Field Value Change and auto-evaluate formulas
  const handleFieldValueChange = (fieldId: string, val: any) => {
    const nextValues = { ...fieldValues, [fieldId]: val };

    // Clear missing highlight if user provides a valid value
    if (val !== undefined && val !== null && String(val).trim() !== '' && val !== false) {
      setMissingFieldIds(prev => prev.filter(id => id !== fieldId));
    }

    // Auto compute calculated fields
    targetEnvelope.fields.forEach(f => {
      if (f.isReadOnlyCalculated || f.type === 'formula' || f.calculationFormula) {
        const formula = f.calculationFormula || f.formulaExpression || '';
        const res = evaluateFormula(formula, nextValues, targetEnvelope.fields);
        if (res.value !== null) {
          nextValues[f.id] = formatFieldValue(res.value, f.numberFormat, f.currency);
        }
      }
    });

    setFieldValues(nextValues);
  };

  const handleStartForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim() || !signerEmail.trim()) {
      notify('error', 'Required Information', 'Please provide your full name and email address.');
      return;
    }
    if (!agreedToElectronicConsent) {
      notify('warning', 'Consent Required', 'Please check the box to agree to electronic business execution.');
      return;
    }

    // Set name into appropriate fields
    const updatedValues = { ...fieldValues };
    targetEnvelope.fields.forEach(f => {
      if (f.type === 'name') updatedValues[f.id] = signerName;
      if (f.type === 'email') updatedValues[f.id] = signerEmail;
      if (f.type === 'date_signed') updatedValues[f.id] = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    });
    setFieldValues(updatedValues);
    setStep('form');
  };

  const handleApplySignature = (sig: any) => {
    const dataUrl = sig.dataUrl || sig.fontText;
    setSignatureData(dataUrl);
    setIsSignatureMissing(false);
    if (activeSignatureFieldId) {
      handleFieldValueChange(activeSignatureFieldId, dataUrl);
      setMissingFieldIds(prev => prev.filter(id => id !== activeSignatureFieldId));
    }
    setShowSigModal(false);
  };

  const handleCompletePowerForm = () => {
    // Validate required fields
    const visibleRequiredUnfilled = targetEnvelope.fields.filter(f => {
      const { isVisible, isRequired } = evaluateConditionalVisibility(f, fieldValues);
      if (!isVisible || !isRequired) return false;
      const val = fieldValues[f.id];
      return val === undefined || val === null || String(val).trim() === '' || (f.type === 'checkbox' && !val);
    });

    if (visibleRequiredUnfilled.length > 0) {
      const missingIds = visibleRequiredUnfilled.map(f => f.id);
      setMissingFieldIds(missingIds);

      // Auto-scroll to first missing field
      setTimeout(() => {
        const firstMissingEl = document.getElementById(`powerform-field-${missingIds[0]}`);
        if (firstMissingEl) {
          firstMissingEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const inputEl = document.getElementById(`powerform-input-${missingIds[0]}`);
          if (inputEl) inputEl.focus();
        }
      }, 50);

      notify(
        'error', 
        'Required Field Missing', 
        `Please complete the highlighted field: "${visibleRequiredUnfilled[0].label}" (${visibleRequiredUnfilled.length} remaining).`
      );
      return;
    }

    if (!signatureData) {
      setIsSignatureMissing(true);
      setTimeout(() => {
        const sigBlock = document.getElementById('powerform-signature-block');
        if (sigBlock) {
          sigBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);

      notify('error', 'Signature Required', 'Please adopt or draw your signature in the highlighted signature box.');
      return;
    }

    const sealHash = generateFullSha256();
    const timestamp = new Date().toISOString();

    setFinalSealHash(sealHash);
    setExecutionTimestamp(timestamp);

    // Update envelope in context
    const updatedEnvelope: Envelope = {
      ...targetEnvelope,
      status: 'completed',
      isLocked: true,
      recipients: targetEnvelope.recipients.map(r => ({
        ...r,
        name: signerName || r.name,
        email: signerEmail || r.email,
        status: 'signed',
        signedAt: timestamp
      })),
      fields: targetEnvelope.fields.map(f => ({
        ...f,
        value: fieldValues[f.id] || f.value
      }))
    };

    updateEnvelope(targetEnvelope.id, updatedEnvelope);
    notify('success', 'Agreement Executed', 'Your PowerForm has been cryptographically sealed and finalized.');
    setStep('success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
            <span>S</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white tracking-tight font-display">SignFlow PowerForms</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                SELF-SERVE INTAKE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {targetEnvelope.title}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit Encrypted Portal</span>
          </div>

          {onExit && (
            <button
              onClick={onExit}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              Exit Portal
            </button>
          )}
        </div>
      </header>

      {/* STEP 1: INTAKE GUEST DETAILS */}
      {step === 'intake' && (
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white font-display tracking-tight">
                {targetEnvelope.title}
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Please provide your contact details to begin this self-serve agreement. You will be able to review, dynamically fill calculated fields, and execute immediately.
              </p>
            </div>

            <form onSubmit={handleStartForm} className="space-y-4 pt-2">
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-slate-300 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Full Legal Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Work Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  placeholder="e.g. s.jenkins@company.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Organization / Company Name (Optional)</span>
                </label>
                <input
                  type="text"
                  value={signerCompany}
                  onChange={(e) => setSignerCompany(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="flex items-start space-x-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToElectronicConsent}
                    onChange={(e) => setAgreedToElectronicConsent(e.target.checked)}
                    className="w-4 h-4 rounded mt-0.5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400 leading-relaxed">
                    I agree to use electronic signatures and records in accordance with the US ESIGN Act and EU eIDAS Regulations. I certify that the information provided is accurate.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Continue to Form & Sign</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </main>
      )}

      {/* STEP 2: INTERACTIVE FORM & CALCULATED FIELDS */}
      {step === 'form' && (
        <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-300">Live Calculated & Conditional Form</p>
                <p className="text-[11px] text-indigo-200/70">Formulas evaluate automatically as you update fields below.</p>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-400 font-mono">
              Signer: <strong className="text-white">{signerName}</strong>
            </div>
          </div>

          {/* Form Fields Card */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white font-display">Agreement Fields & Parameters</h3>
              <p className="text-xs text-slate-400">Fill in the required inputs. Computed fields update in real time.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {targetEnvelope.fields.map(field => {
                const { isVisible, isRequired } = evaluateConditionalVisibility(field, fieldValues);
                if (!isVisible) return null;

                const currentValue = fieldValues[field.id] ?? field.defaultValue ?? '';

                const isMissing = missingFieldIds.includes(field.id);

                return (
                  <div 
                    key={field.id}
                    id={`powerform-field-${field.id}`}
                    className={`space-y-1.5 p-4 rounded-2xl border transition-all ${
                      isMissing
                        ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/60 shadow-lg shadow-rose-950/50 animate-shake'
                        : field.isReadOnlyCalculated || field.type === 'formula'
                          ? 'bg-slate-950 border-emerald-500/30'
                          : 'bg-slate-950/60 border-slate-800 focus-within:border-indigo-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                        {(field.isReadOnlyCalculated || field.type === 'formula') && (
                          <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span className={isMissing ? 'text-rose-300 font-bold' : ''}>{field.label}</span>
                        {isRequired && <span className="text-rose-400 font-bold">*</span>}
                      </label>

                      {isMissing ? (
                        <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-rose-600 text-white flex items-center space-x-1 animate-pulse shadow-sm">
                          <AlertTriangle className="w-3 h-3" />
                          <span>REQUIRED FIELD</span>
                        </span>
                      ) : field.isReadOnlyCalculated ? (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          CALCULATED
                        </span>
                      ) : null}
                    </div>

                    {/* FIELD INPUT CONTROLS */}
                    {field.type === 'dropdown' ? (
                      <select
                        id={`powerform-input-${field.id}`}
                        value={currentValue}
                        onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                        className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none ${
                          isMissing
                            ? 'bg-slate-900 border-2 border-rose-500 text-rose-100 focus:border-rose-400'
                            : 'bg-slate-900 border border-slate-700 text-slate-200 focus:border-indigo-500'
                        }`}
                      >
                        {(field.options || ['Standard Tier', 'Enterprise Tier', 'VIP Tier']).map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <label className="flex items-center space-x-2.5 pt-1 cursor-pointer">
                        <input
                          id={`powerform-input-${field.id}`}
                          type="checkbox"
                          checked={Boolean(currentValue)}
                          onChange={(e) => handleFieldValueChange(field.id, e.target.checked)}
                          className={`w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer ${
                            isMissing ? 'ring-2 ring-rose-500' : ''
                          }`}
                        />
                        <span className={`text-xs ${isMissing ? 'text-rose-300 font-semibold' : 'text-slate-300'}`}>
                          {field.placeholder || 'Yes, I confirm & accept'}
                        </span>
                      </label>
                    ) : field.type === 'signature' ? (
                      <div className="pt-1">
                        {signatureData ? (
                          <div 
                            onClick={() => {
                              setActiveSignatureFieldId(field.id);
                              setShowSigModal(true);
                            }}
                            className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex items-center space-x-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-bold text-emerald-300 font-serif italic">
                                {signerName || 'Signature Attached'}
                              </span>
                            </div>
                            <span className="text-[10px] text-indigo-400 group-hover:underline">Change</span>
                          </div>
                        ) : (
                          <button
                            id={`powerform-input-${field.id}`}
                            type="button"
                            onClick={() => {
                              setActiveSignatureFieldId(field.id);
                              setShowSigModal(true);
                            }}
                            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md ${
                              isMissing
                                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse ring-2 ring-rose-400'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            }`}
                          >
                            <PenTool className="w-3.5 h-3.5" />
                            <span>Click to Sign Here</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <input
                        id={`powerform-input-${field.id}`}
                        type={field.type === 'number' ? 'number' : 'text'}
                        readOnly={field.isReadOnlyCalculated || field.type === 'formula'}
                        value={currentValue}
                        onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                        placeholder={field.placeholder || 'Enter value...'}
                        className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none ${
                          isMissing
                            ? 'bg-slate-900 border-2 border-rose-500 text-white font-medium placeholder-rose-400/60 focus:border-rose-400'
                            : field.isReadOnlyCalculated || field.type === 'formula'
                              ? 'bg-slate-900 border border-emerald-500/40 font-mono text-emerald-300 font-bold text-sm'
                              : 'bg-slate-900 border border-slate-700 text-slate-200 focus:border-indigo-500'
                        }`}
                      />
                    )}

                    {isMissing && (
                      <p className="text-[11px] font-semibold text-rose-400 flex items-center space-x-1 pt-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>Please complete this required field before submitting.</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Signature Block If Not In Fields */}
            {!targetEnvelope.fields.some(f => f.type === 'signature') && (
              <div 
                id="powerform-signature-block"
                className={`p-6 rounded-2xl border transition-all space-y-3 ${
                  isSignatureMissing
                    ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/60 shadow-lg shadow-rose-950/50 animate-shake'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Signatory Execution</h4>
                  {isSignatureMissing && (
                    <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-rose-600 text-white flex items-center space-x-1 animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      <span>SIGNATURE MISSING</span>
                    </span>
                  )}
                </div>

                {signatureData ? (
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-300 font-serif italic">
                        {signerName} (Signed Electronically)
                      </span>
                    </div>
                    <button
                      onClick={() => setShowSigModal(true)}
                      className="text-xs text-indigo-400 hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsSignatureMissing(false);
                      setShowSigModal(true);
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-md transition-all ${
                      isSignatureMissing
                        ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse ring-2 ring-rose-400'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-[1.01]'
                    }`}
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Adopt & Apply Signature</span>
                  </button>
                )}

                {isSignatureMissing && (
                  <p className="text-[11px] font-semibold text-rose-400 flex items-center space-x-1 pt-1 animate-in fade-in">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>You must adopt or apply an electronic signature to finalize this document.</span>
                  </p>
                )}
              </div>
            )}

            {/* Final Execution Button */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('intake')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Back to Details
              </button>

              <button
                type="button"
                onClick={handleCompletePowerForm}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer flex items-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>Complete & Finalize Agreement</span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* STEP 3: SUCCESS & MERKLE COMPLETION RECEIPT */}
      {step === 'success' && (
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-white font-display">
                Agreement Successfully Executed
              </h2>
              <p className="text-xs text-slate-400">
                A cryptographic copy and completion receipt has been anchored to the SHA-256 Merkle ledger.
              </p>
            </div>

            {/* Cryptographic Receipt Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Document Title:</span>
                <span className="text-white font-bold">{targetEnvelope.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Executed Signer:</span>
                <span className="text-emerald-400 font-bold">{signerName} ({signerEmail})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Execution Timestamp:</span>
                <span className="text-slate-300 font-mono text-[11px]">{formatTimestamp(executionTimestamp)}</span>
              </div>
              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                  SHA-256 Merkle Ledger Digest
                </span>
                <p className="font-mono text-[10px] text-emerald-400 break-all bg-slate-900 p-2 rounded-lg border border-slate-800">
                  {finalSealHash}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => openCertificateView(targetEnvelope.id)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>View Completion Certificate</span>
              </button>

              {onExit && (
                <button
                  onClick={onExit}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Close & Return
                </button>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Signature Designer Modal */}
      {showSigModal && (
        <CustomSignatureModal
          isOpen={showSigModal}
          onClose={() => setShowSigModal(false)}
          defaultName={signerName || 'Valued Client'}
          onApplySignature={handleApplySignature}
        />
      )}
    </div>
  );
};
