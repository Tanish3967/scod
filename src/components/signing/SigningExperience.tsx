import React, { useState } from 'react';
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
  Lock
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { DocumentField, Recipient } from '../../types/signflow';
import { SignatureModal, SignatureOutput } from './SignatureModal';
import { SignerAIDrawer } from './SignerAIDrawer';
import { PaymentFieldModal } from './PaymentFieldModal';
import { MobileQRModal } from './MobileQRModal';
import { SignSuccessModal } from './SignSuccessModal';
import { SIGNER_LOCALIZATION, SignerLanguage } from '../../utils/signerLocalization';

export const SigningExperience: React.FC = () => {
  const { activeEnvelope, submitSignerSignature, setActiveView } = useSignFlow();

  const [language, setLanguage] = useState<SignerLanguage>('en');
  const t = SIGNER_LOCALIZATION[language];

  const [signerRecipientId, setSignerRecipientId] = useState<string>(
    activeEnvelope?.recipients[0]?.id || 'rec-01'
  );

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [signatureOutput, setSignatureOutput] = useState<SignatureOutput | null>(null);

  // Modals & Drawers
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showAIDrawer, setShowAIDrawer] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMobileQR, setShowMobileQR] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!activeEnvelope) {
    return (
      <div className="p-12 text-center text-slate-400">
        <h3 className="text-sm font-semibold text-slate-200">No Envelope Selected for Signing</h3>
      </div>
    );
  }

  const currentRecipient = activeEnvelope.recipients.find(r => r.id === signerRecipientId) || activeEnvelope.recipients[0];
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
    setSignatureOutput(sig);
    setFieldValues(prev => ({
      ...prev,
      signature: sig.value
    }));
  };

  const handleConfirmPayment = (details: { last4: string; brand: string; amount: number }) => {
    setFieldValues(prev => ({
      ...prev,
      payment: `Paid $${details.amount} via ${details.brand} ending in ${details.last4}`
    }));
  };

  const handleSubmit = () => {
    const signatureData: Recipient['signatureData'] = signatureOutput ? {
      type: signatureOutput.type,
      value: signatureOutput.value,
      fontFamily: signatureOutput.fontFamily,
      appliedAt: new Date().toISOString(),
      ipAddress: '198.51.100.82',
      deviceFingerprint: navigator.userAgent
    } : {
      type: 'draw',
      value: currentRecipient.name,
      appliedAt: new Date().toISOString(),
      ipAddress: '198.51.100.82',
      deviceFingerprint: navigator.userAgent
    };

    submitSignerSignature(activeEnvelope.id, currentRecipient.id, signatureData, fieldValues);
    setShowSuccessModal(true);
  };

  const doc = activeEnvelope.documents[0];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
      {/* Top Guided Signing Bar */}
      <div className="sticky top-0 z-40 h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                {activeEnvelope.title}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-mono">
                Guided Signing
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Signing as: <strong className="text-indigo-400">{currentRecipient.name}</strong> ({currentRecipient.email})
            </p>
          </div>
        </div>

        {/* Action Controls & Stepper */}
        <div className="flex items-center space-x-2.5">
          {/* Language Switcher */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SignerLanguage)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="en">🇺🇸 EN</option>
            <option value="es">🇪🇸 ES</option>
            <option value="fr">🇫🇷 FR</option>
            <option value="de">🇩🇪 DE</option>
            <option value="ja">🇯🇵 JA</option>
          </select>

          {/* AI Plain-English TL;DR Drawer Button */}
          <button
            onClick={() => setShowAIDrawer(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>{t.signerAiSummary}</span>
          </button>

          {/* Next Field / Complete Button */}
          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all hover:scale-[1.02]"
          >
            <Check className="w-4 h-4" />
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
                <div className="space-y-4">
                  {p.content.split('\n\n').map((paragraph, idx) => {
                    if (paragraph.startsWith('### ')) {
                      return <h3 key={idx} className="text-base font-sans font-bold text-slate-950 uppercase tracking-tight border-b pb-2">{paragraph.replace('### ', '')}</h3>;
                    }
                    if (paragraph.startsWith('#### ')) {
                      return <h4 key={idx} className="text-xs font-sans font-bold text-slate-900 uppercase mt-3">{paragraph.replace('#### ', '')}</h4>;
                    }
                    return <p key={idx} className="text-slate-800 font-sans leading-relaxed text-[12px]">{paragraph}</p>;
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Signing Fields Overlay */}
          <div className="mt-8 pt-6 border-t-2 border-dashed border-indigo-200 space-y-6">
            <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-indigo-900 flex items-center space-x-1.5">
              <PenTool className="w-4 h-4 text-indigo-600" />
              <span>Required Signer Action Items</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Signature Field */}
              <div
                onClick={() => setShowSignatureModal(true)}
                className={`p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  signatureOutput
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                    : 'border-indigo-500 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-950 shadow-md animate-pulse-slow'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center space-x-1.5">
                    <PenTool className="w-4 h-4 text-indigo-600" />
                    <span>Authorized Signature</span>
                  </span>
                  {signatureOutput ? (
                    <span className="text-[10px] text-emerald-700 font-mono flex items-center">
                      <Check className="w-3 h-3 mr-0.5" /> Adopted
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-600 text-white font-bold animate-bounce">
                      Click to Sign
                    </span>
                  )}
                </div>

                <div className="mt-3 h-16 flex items-center justify-center bg-white rounded-lg border border-slate-200 shadow-inner">
                  {signatureOutput ? (
                    signatureOutput.type === 'type' ? (
                      <span className={`text-2xl text-blue-900 ${signatureOutput.fontFamily === 'Dancing Script' ? 'signature-font-dancing' : 'signature-font-greatvibes'}`}>
                        {signatureOutput.value}
                      </span>
                    ) : (
                      <img src={signatureOutput.value} alt="Signature" className="max-h-12" />
                    )
                  ) : (
                    <span className="text-xs text-slate-400 italic">Click here to sign with Draw, Type or Upload</span>
                  )}
                </div>
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
      />
    </div>
  );
};
