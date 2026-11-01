import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  PenTool, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  Check, 
  ChevronRight, 
  AlertCircle,
  FileCheck,
  CreditCard,
  Lock,
  Fingerprint,
  KeyRound,
  Calculator,
  Hash,
  ListPlus,
  CheckSquare
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { DocumentField, Recipient } from '../../types/signflow';
import { SignatureModal, SignatureOutput } from './SignatureModal';
import { SignerAIDrawer } from './SignerAIDrawer';
import { PaymentFieldModal } from './PaymentFieldModal';
import { MobileQRModal } from './MobileQRModal';
import { SignSuccessModal } from './SignSuccessModal';
import { SIGNER_LOCALIZATION, SignerLanguage } from '../../utils/signerLocalization';
import { authenticateWithPasskey } from '../../utils/passkeyUtils';
import { evaluateFormula, evaluateConditionalVisibility, formatFieldValue } from '../../utils/fieldFormulas';

export const SigningExperience: React.FC = () => {
  const { 
    activeEnvelope, 
    activeSigningRecipientId,
    submitSignerSignature, 
    setActiveView, 
    closeCertificateView,
    notify 
  } = useSignFlow();

  const [language, setLanguage] = useState<SignerLanguage>('en');
  const t = SIGNER_LOCALIZATION[language];

  const [signerRecipientId, setSignerRecipientId] = useState<string>(
    activeSigningRecipientId || activeEnvelope?.recipients[0]?.id || 'rec-01'
  );

  useEffect(() => {
    if (activeSigningRecipientId) {
      setSignerRecipientId(activeSigningRecipientId);
    } else if (activeEnvelope?.recipients?.[0]?.id) {
      setSignerRecipientId(activeEnvelope.recipients[0].id);
    }
  }, [activeSigningRecipientId, activeEnvelope?.id]);

  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [signatureOutput, setSignatureOutput] = useState<SignatureOutput | null>(null);
  const [missingFieldIds, setMissingFieldIds] = useState<string[]>([]);
  const [isSignatureMissing, setIsSignatureMissing] = useState(false);

  // Initialize and evaluate reactive fields
  useEffect(() => {
    if (!activeEnvelope) return;
    const initial: Record<string, any> = {};
    activeEnvelope.fields.forEach(f => {
      if (f.defaultValue) initial[f.id] = f.defaultValue;
      else if (f.value) initial[f.id] = f.value;
      else if (f.type === 'number') initial[f.id] = '1';
      else if (f.type === 'dropdown' && f.options?.[0]) initial[f.id] = f.options[0];
      else if (f.type === 'checkbox') initial[f.id] = false;
      if (f.fieldName) initial[f.fieldName] = initial[f.id];
    });

    // Compute initial formulas
    activeEnvelope.fields.forEach(f => {
      if (f.isReadOnlyCalculated || f.type === 'formula' || f.calculationFormula) {
        const formula = f.calculationFormula || f.formulaExpression || '';
        const res = evaluateFormula(formula, initial, activeEnvelope.fields);
        if (res.value !== null) {
          initial[f.id] = formatFieldValue(res.value, f.numberFormat, f.currency);
          if (f.fieldName) initial[f.fieldName] = initial[f.id];
        }
      }
    });

    setFieldValues(initial);
  }, [activeEnvelope?.id]);

  const handleFieldValueChange = (fieldId: string, val: any) => {
    // Clear missing highlight on edit
    setMissingFieldIds(prev => prev.filter(id => id !== fieldId));

    const nextValues = { ...fieldValues, [fieldId]: val };
    const matched = activeEnvelope?.fields.find(f => f.id === fieldId);
    if (matched?.fieldName) nextValues[matched.fieldName] = val;

    // Auto compute all calculated formula fields
    activeEnvelope?.fields.forEach(f => {
      if (f.isReadOnlyCalculated || f.type === 'formula' || f.calculationFormula) {
        const formula = f.calculationFormula || f.formulaExpression || '';
        const res = evaluateFormula(formula, nextValues, activeEnvelope.fields);
        if (res.value !== null) {
          const formatted = formatFieldValue(res.value, f.numberFormat, f.currency);
          nextValues[f.id] = formatted;
          if (f.fieldName) nextValues[f.fieldName] = formatted;
        }
      }
    });

    setFieldValues(nextValues);
  };

  // Modals & Drawers
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showAIDrawer, setShowAIDrawer] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMobileQR, setShowMobileQR] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPasskeySigning, setIsPasskeySigning] = useState(false);
  const [passkeyMetadata, setPasskeyMetadata] = useState<any>(null);

  if (!activeEnvelope) {
    return (
      <div className="p-12 text-center text-slate-400">
        <h3 className="text-sm font-semibold text-slate-200">No Envelope Selected for Signing</h3>
      </div>
    );
  }

  const currentRecipient = activeEnvelope.recipients.find(r => r.id === signerRecipientId) || activeEnvelope.recipients[0];
  const isCurrentRecipientAlreadySigned = currentRecipient?.status === 'signed';
  const requiredFields = activeEnvelope.fields.filter(f => f.recipientId === signerRecipientId && f.required);
  const completedFieldsCount = Object.keys(fieldValues).length + (signatureOutput ? 1 : 0);

  const handleFieldClick = (field: DocumentField) => {
    if (field.type === 'signature' || field.type === 'initial') {
      setShowSignatureModal(true);
    } else if (field.type === 'payment') {
      setShowPaymentModal(true);
    }
  };

  const handleAdoptSignature = (sig: SignatureOutput) => {
    setIsSignatureMissing(false);
    setSignatureOutput(sig);
    setFieldValues(prev => ({
      ...prev,
      signature: sig.value
    }));
  };

  const handleQuickPasskeySign = async () => {
    setIsPasskeySigning(true);
    try {
      const auth = await authenticateWithPasskey(
        currentRecipient.name,
        currentRecipient.email,
        doc?.sha256Hash || 'sha256-agreement-merkle'
      );
      setPasskeyMetadata(auth);
      setIsSignatureMissing(false);
      setSignatureOutput({
        type: 'passkey',
        value: auth.svgBadge
      });
      setFieldValues(prev => ({
        ...prev,
        signature: auth.svgBadge
      }));
    } catch (err) {
      console.warn('Passkey sign error:', err);
    } finally {
      setIsPasskeySigning(false);
    }
  };

  const handleConfirmPayment = (details: { last4: string; brand: string; amount: number }) => {
    setFieldValues(prev => ({
      ...prev,
      payment: `Paid $${details.amount} via ${details.brand} ending in ${details.last4}`
    }));
  };

  const handleSubmit = () => {
    if (isCurrentRecipientAlreadySigned) {
      notify('info', 'Already Signed', `${currentRecipient.name} has already executed this agreement.`);
      return;
    }

    // Identify all missing required fields
    const uncompletedIds: string[] = [];
    activeEnvelope.fields
      .filter(f => f.type !== 'signature' && f.type !== 'date_signed' && f.type !== 'stamp')
      .forEach(field => {
        const { isVisible, isRequired } = evaluateConditionalVisibility(field, fieldValues);
        if (isVisible && isRequired && !field.isReadOnlyCalculated && field.type !== 'formula') {
          const val = fieldValues[field.id] ?? field.defaultValue;
          if (val === undefined || val === null || String(val).trim() === '' || (field.type === 'checkbox' && !val)) {
            uncompletedIds.push(field.id);
          }
        }
      });

    const sigMissing = !signatureOutput;
    setMissingFieldIds(uncompletedIds);
    setIsSignatureMissing(sigMissing);

    if (uncompletedIds.length > 0) {
      notify('warning', 'Required Fields Incomplete', `Please fill out all required fields (${uncompletedIds.length} remaining) before submitting.`);
      const firstMissingEl = document.getElementById(`signing-field-${uncompletedIds[0]}`);
      if (firstMissingEl) {
        firstMissingEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const inputEl = document.getElementById(`signing-input-${uncompletedIds[0]}`);
        if (inputEl) (inputEl as HTMLElement).focus();
      }
      return;
    }

    if (sigMissing) {
      notify('warning', 'Signature Required', 'Please adopt or draw your authorized signature before submitting.');
      const sigEl = document.getElementById('signing-signature-block');
      if (sigEl) {
        sigEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setShowSignatureModal(true);
      return;
    }

    const signatureData: Recipient['signatureData'] = {
      type: signatureOutput.type as any,
      value: signatureOutput.value,
      fontFamily: signatureOutput.fontFamily,
      appliedAt: new Date().toISOString(),
      ipAddress: '198.51.100.82',
      deviceFingerprint: navigator.userAgent,
      passkeyDetails: passkeyMetadata ? {
        credentialId: passkeyMetadata.credentialId,
        authenticatorName: passkeyMetadata.authenticatorName,
        hardwareEnclave: passkeyMetadata.hardwareEnclave,
        signatureAlgorithm: passkeyMetadata.signatureAlgorithm,
        authTimestamp: passkeyMetadata.verifiedAt,
        securityLevel: passkeyMetadata.securityLevel
      } : undefined
    };

    submitSignerSignature(activeEnvelope.id, currentRecipient.id, signatureData, fieldValues);
    setShowSuccessModal(true);
  };

  const doc = activeEnvelope.documents[0];

  const requiredActionRecipients = activeEnvelope.recipients.filter(
    r => r.role === 'signer' || r.role === 'approver' || r.role === 'in_person'
  );
  const nextPendingRecipient = activeEnvelope.recipients.find(
    r => (r.role === 'signer' || r.role === 'approver' || r.role === 'in_person') && r.id !== currentRecipient?.id && r.status !== 'signed'
  );
  const areAllSigned = requiredActionRecipients.length > 0 && requiredActionRecipients.every(
    r => r.id === currentRecipient?.id ? true : r.status === 'signed'
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
      {/* Top Guided Signing Bar */}
      <div className="sticky top-0 z-40 h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => {
              closeCertificateView();
              setActiveView('envelopes');
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title="Return to Envelopes"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                {activeEnvelope.title}
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 font-mono shrink-0 whitespace-nowrap">
                Guided Signing
              </span>
            </div>
            
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-[11px] text-slate-400">Signing as:</span>
              <span className="text-xs text-slate-200 font-medium flex items-center space-x-1.5">
                <strong className="text-indigo-400 font-semibold">{currentRecipient.name}</strong>
                <span className="text-[11px] text-slate-400 font-mono">({currentRecipient.email})</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                  {currentRecipient.role.toUpperCase()}
                </span>
              </span>

              {isCurrentRecipientAlreadySigned && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  ✓ Signed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls & Utilities in Logical, Clean Order */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {/* 1. Language Switcher */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SignerLanguage)}
            className="h-9 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 whitespace-nowrap cursor-pointer hover:bg-slate-800 transition-colors"
          >
            <option value="en">🇺🇸 EN</option>
            <option value="es">🇪🇸 ES</option>
            <option value="fr">🇫🇷 FR</option>
            <option value="de">🇩🇪 DE</option>
            <option value="ja">🇯🇵 JA</option>
          </select>

          {/* 2. AI Summary Button */}
          <button
            onClick={() => setShowAIDrawer(true)}
            className="h-9 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap"
            title="Open AI Plain-English Contract TL;DR Summary"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse shrink-0" />
            <span>AI Summary</span>
          </button>

          {/* 3. Passkey Hardware Signing Action */}
          <button
            onClick={handleQuickPasskeySign}
            disabled={isPasskeySigning}
            className="h-9 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-500/40 text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap"
            title="Authenticate with Touch ID / Face ID / Windows Hello"
          >
            <Fingerprint className={`w-3.5 h-3.5 text-purple-400 shrink-0 ${isPasskeySigning ? 'animate-ping' : ''}`} />
            <span>{isPasskeySigning ? 'Scanning...' : 'Passkey (Touch ID)'}</span>
          </button>

          {/* 4. Complete / Submit Button */}
          <button
            onClick={handleSubmit}
            className="h-9 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all hover:scale-105 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <span>Finish & Submit</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Electronic Signature Consent Accepted (ESIGN Act §101)</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <span className="font-mono text-indigo-400 font-semibold">
            {completedFieldsCount} / {Math.max(1, requiredFields.length)} Required Fields Completed
          </span>
        </div>
      </div>

      {/* Main Signable Document Canvas Area */}
      <div className="flex-1 p-6 flex justify-center items-start overflow-y-auto">
        <div className="w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-12 border border-slate-300 relative select-none">
          {/* Document Content */}
          <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-4 font-serif">
            {doc?.pages.map((p) => (
              <div key={p.pageNumber} className="border-b border-slate-200 pb-8 mb-8 last:border-b-0">
                {p.imageUrl ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 flex items-center justify-center p-2 my-2">
                    <img 
                      src={p.imageUrl} 
                      alt={`Page ${p.pageNumber}`} 
                      className="max-w-full max-h-[700px] object-contain rounded-lg"
                    />
                  </div>
                ) : p.content ? (
                  <div className="space-y-4">
                    {p.content.split('\n\n').map((paragraph, idx) => {
                      if (paragraph.startsWith('### ')) {
                        return <h3 key={idx} className="text-base font-sans font-bold text-slate-950 uppercase tracking-tight border-b pb-2">{paragraph.replace('### ', '')}</h3>;
                      }
                      if (paragraph.startsWith('#### ')) {
                        return <h4 key={idx} className="text-xs font-sans font-bold text-slate-900 uppercase mt-3">{paragraph.replace('#### ', '')}</h4>;
                      }
                      if (paragraph.startsWith('- ')) {
                        return (
                          <ul key={idx} className="list-disc list-inside space-y-1 text-slate-700 pl-2">
                            {paragraph.split('\n').map((li, lIdx) => (
                              <li key={lIdx}>{li.replace(/^- /, '')}</li>
                            ))}
                          </ul>
                        );
                      }
                      return <p key={idx} className="text-slate-800 font-sans leading-relaxed text-[12px]">{paragraph}</p>;
                    })}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* Interactive Signing Fields Overlay */}
          <div className="mt-8 pt-6 border-t-2 border-dashed border-indigo-200 space-y-6">
            <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-indigo-900 flex items-center space-x-1.5">
              <PenTool className="w-4 h-4 text-indigo-600" />
              <span>Required Signer Action Items</span>
            </h4>

            {/* Dynamic Calculated & Conditional Fields Grid */}
            {activeEnvelope.fields.filter(f => f.type !== 'signature' && f.type !== 'date_signed' && f.type !== 'stamp').length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Agreement Parameters & Calculations</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Live Formula Evaluation Active ✓</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {activeEnvelope.fields
                    .filter(f => f.type !== 'signature' && f.type !== 'date_signed' && f.type !== 'stamp')
                    .map(field => {
                      const { isVisible, isRequired } = evaluateConditionalVisibility(field, fieldValues);
                      if (!isVisible) return null;

                      const val = fieldValues[field.id] ?? field.defaultValue ?? '';
                      const isCalc = field.isReadOnlyCalculated || field.type === 'formula';
                      const isMissing = missingFieldIds.includes(field.id);

                      return (
                        <div 
                          key={field.id}
                          id={`signing-field-${field.id}`}
                          className={`p-3 rounded-xl border transition-all space-y-1.5 ${
                            isMissing
                              ? 'border-rose-500 ring-2 ring-rose-500/60 bg-rose-50/90 shadow-md animate-shake'
                              : isCalc 
                                ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs' 
                                : 'bg-white border-slate-200 focus-within:border-indigo-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                              {isCalc && <Calculator className="w-3 h-3 text-emerald-600" />}
                              <span>{field.label}</span>
                              {isRequired && <span className="text-rose-500 font-bold">*</span>}
                            </label>

                            <div className="flex items-center space-x-1.5">
                              {isMissing && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 flex items-center">
                                  <AlertCircle className="w-2.5 h-2.5 mr-0.5" /> REQUIRED
                                </span>
                              )}
                              {isCalc && (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  fx
                                </span>
                              )}
                            </div>
                          </div>

                          {field.type === 'dropdown' ? (
                            <select
                              id={`signing-input-${field.id}`}
                              value={val}
                              onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                              className={`w-full px-3 py-1.5 rounded-lg text-xs focus:outline-none ${
                                isMissing
                                  ? 'bg-white border border-rose-400 text-rose-950 font-medium'
                                  : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-indigo-500'
                              }`}
                            >
                              {(field.options || ['Option 1', 'Option 2', 'Option 3']).map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : field.type === 'checkbox' ? (
                            <label className="flex items-center space-x-2 pt-0.5 cursor-pointer">
                              <input
                                id={`signing-input-${field.id}`}
                                type="checkbox"
                                checked={Boolean(val)}
                                onChange={(e) => handleFieldValueChange(field.id, e.target.checked)}
                                className={`w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer ${
                                  isMissing ? 'ring-2 ring-rose-500 ring-offset-1' : ''
                                }`}
                              />
                              <span className={`text-xs ${isMissing ? 'text-rose-900 font-semibold' : 'text-slate-600'}`}>
                                {field.placeholder || 'Confirm & Accept'}
                              </span>
                            </label>
                          ) : (
                            <input
                              id={`signing-input-${field.id}`}
                              type={field.type === 'number' ? 'number' : 'text'}
                              readOnly={isCalc}
                              value={val}
                              onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                              placeholder={field.placeholder || 'Enter value...'}
                              className={`w-full px-3 py-1.5 rounded-lg text-xs focus:outline-none ${
                                isMissing
                                  ? 'bg-white border-2 border-rose-400 text-rose-950 placeholder-rose-300 font-medium'
                                  : isCalc 
                                    ? 'bg-emerald-100/50 border border-emerald-300 font-mono font-bold text-emerald-900 text-sm' 
                                    : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-indigo-500'
                              }`}
                            />
                          )}

                          {isMissing && (
                            <p className="text-[10px] text-rose-600 font-medium">Please provide a value for this required field.</p>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Signature Field */}
              <div
                id="signing-signature-block"
                onClick={() => setShowSignatureModal(true)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSignatureMissing
                    ? 'border-rose-500 ring-4 ring-rose-500/50 bg-rose-50/90 text-rose-950 animate-shake shadow-lg'
                    : signatureOutput
                      ? 'border-emerald-500 border-dashed bg-emerald-50 text-emerald-950'
                      : 'border-indigo-500 border-dashed bg-indigo-50/70 hover:bg-indigo-100 text-indigo-950 shadow-md animate-pulse-slow'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center space-x-1.5">
                    <PenTool className={`w-4 h-4 ${isSignatureMissing ? 'text-rose-600' : 'text-indigo-600'}`} />
                    <span className={isSignatureMissing ? 'text-rose-900 font-bold' : ''}>Authorized Signature</span>
                  </span>
                  {signatureOutput ? (
                    <span className="text-[10px] text-emerald-700 font-mono flex items-center">
                      <Check className="w-3 h-3 mr-0.5" /> Adopted
                    </span>
                  ) : isSignatureMissing ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold animate-bounce flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" /> Signature Required
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-600 text-white font-bold animate-bounce">
                      Click to Sign
                    </span>
                  )}
                </div>

                <div className={`mt-3 h-16 flex items-center justify-center bg-white rounded-lg border shadow-inner ${
                  isSignatureMissing ? 'border-rose-300' : 'border-slate-200'
                }`}>
                  {signatureOutput ? (
                    signatureOutput.type === 'type' ? (
                      <span className={`text-2xl text-blue-900 ${signatureOutput.fontFamily === 'Dancing Script' ? 'signature-font-dancing' : 'signature-font-greatvibes'}`}>
                        {signatureOutput.value}
                      </span>
                    ) : (
                      <img src={signatureOutput.value} alt="Signature" className="max-h-12" />
                    )
                  ) : isSignatureMissing ? (
                    <span className="text-xs text-rose-600 font-semibold italic flex items-center">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" /> Click here to adopt or draw signature
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Click here to sign with Draw, Type or Upload</span>
                  )}
                </div>

                {isSignatureMissing && (
                  <p className="text-[10px] text-rose-600 font-medium text-center mt-2">
                    Authorized signature is required before you can finish & submit.
                  </p>
                )}
              </div>

              {/* Date Signed Field */}
              <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-700">Date Signed</span>
                <div className="mt-3 h-16 flex items-center justify-center bg-white rounded-lg border border-slate-200 font-mono text-sm font-bold text-slate-800">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Payment Field if required */}
            {activeEnvelope.requiresPayment && (
              <div
                onClick={() => setShowPaymentModal(true)}
                className={`p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  fieldValues.payment
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-purple-500 bg-purple-50 hover:bg-purple-100'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-purple-950">
                  <span className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>Contract Retainer Fee: ${activeEnvelope.totalPaymentAmount?.toLocaleString()}</span>
                  </span>
                  {fieldValues.payment ? (
                    <span className="text-[10px] text-emerald-700 font-mono flex items-center font-bold">
                      <Check className="w-3 h-3 mr-0.5" /> Authorized
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-600 text-white font-bold">
                      Provide Payment
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-2">
                  {fieldValues.payment || 'Click to provide secure card details to authorize escrow payment upon signing.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals & AI Drawer */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onAdoptSignature={handleAdoptSignature}
        signerName={currentRecipient.name}
      />

      <SignerAIDrawer
        isOpen={showAIDrawer}
        onClose={() => setShowAIDrawer(false)}
        documentTitle={activeEnvelope.title}
        documentContent={doc?.pages.map(p => p.content).join('\n') || ''}
      />

      <PaymentFieldModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirmPayment={handleConfirmPayment}
        amount={activeEnvelope.totalPaymentAmount || 12500}
      />

      <MobileQRModal
        isOpen={showMobileQR}
        onClose={() => setShowMobileQR(false)}
        envelopeTitle={activeEnvelope.title}
      />

      <SignSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        envelopeTitle={activeEnvelope.title}
        envelopeId={activeEnvelope.id}
        signedRecipient={currentRecipient}
        allSigned={areAllSigned}
        nextRecipient={nextPendingRecipient}
      />
    </div>
  );
};
