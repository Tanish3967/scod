import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Camera, Check, RefreshCw, X, AlertCircle } from 'lucide-react';

export const IDVBiometricCheckModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  signerName: string;
}> = ({ isOpen, onClose, onVerified, signerName }) => {
  const [step, setStep] = useState<'id_capture' | 'selfie_liveness' | 'verifying' | 'success'>('id_capture');
  const [docType, setDocType] = useState<'Drivers_License' | 'Passport'>('Drivers_License');

  if (!isOpen) return null;

  const startVerification = () => {
    setStep('verifying');
    setTimeout(() => {
      setStep('success');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">Biometric Identity Verification (IDV)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 'id_capture' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Select government-issued ID to verify identity for Remote Online Notarization:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDocType('Drivers_License')}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                  docType === 'Drivers_License'
                    ? 'bg-indigo-950/40 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Driver's License / State ID
              </button>
              <button
                onClick={() => setDocType('Passport')}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                  docType === 'Passport'
                    ? 'bg-indigo-950/40 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Official Passport
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-700 text-center space-y-2">
              <Camera className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-medium text-slate-300">Front of {docType === 'Passport' ? 'Passport Photo Page' : "Driver's License"}</p>
              <p className="text-[10px] text-emerald-400">Mock Capture: Document Ready</p>
            </div>

            <button
              onClick={() => setStep('selfie_liveness')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
            >
              Continue to 3D Selfie Liveness →
            </button>
          </div>
        )}

        {step === 'selfie_liveness' && (
          <div className="space-y-4 text-center">
            <p className="text-xs text-slate-300">
              Position your face in the oval to perform 3D facial biometric liveness check:
            </p>

            <div className="w-40 h-48 rounded-full border-4 border-indigo-500/60 mx-auto overflow-hidden bg-slate-950 flex items-center justify-center relative shadow-inner">
              <UserCheck className="w-16 h-16 text-indigo-400 opacity-80" />
              <div className="absolute inset-0 border-t-2 border-indigo-400 animate-pulse-slow" />
            </div>

            <button
              onClick={startVerification}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30"
            >
              Analyze Biometrics & Match ID
            </button>
          </div>
        )}

        {step === 'verifying' && (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <h4 className="text-xs font-bold text-white">Cross-Referencing Government Database...</h4>
            <p className="text-[11px] text-slate-400">Verifying tamper features, hologram integrity & biometric score</p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">Identity Verified Successfully!</h4>
              <p className="text-xs text-slate-300 mt-1">Biometric Liveness Match: <strong className="text-emerald-400">99.6% Confidence</strong></p>
              <p className="text-[10px] font-mono text-slate-500 mt-1">Proof Hash: IDV-US-DL-8829-VERIFIED</p>
            </div>

            <button
              onClick={() => {
                onVerified();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30"
            >
              Proceed to Notary Video Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
