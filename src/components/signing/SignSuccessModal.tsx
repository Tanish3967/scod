import React from 'react';
import { CheckCircle2, ShieldCheck, Download, ExternalLink, ArrowRight, FileCheck } from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

export const SignSuccessModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  envelopeTitle: string;
  envelopeId: string;
}> = ({ isOpen, onClose, envelopeTitle, envelopeId }) => {
  const { openCertificateView, setActiveView } = useSignFlow();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-center space-y-5">
        {/* Animated Checkmark */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 uppercase">
            Signature Cryptographically Bound
          </span>
          <h3 className="text-xl font-display font-bold text-white tracking-tight">
            Agreement Executed!
          </h3>
          <p className="text-xs text-slate-300">
            "{envelopeTitle}" has been signed and anchored to the append-only audit trail.
          </p>
        </div>

        {/* Security Summary Box */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>ESIGN / eIDAS Validity:</span>
            <span className="text-emerald-400 font-semibold flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Legal Standard Met
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Document Checksum:</span>
            <span className="font-mono text-slate-300 text-[10px]">SHA-256 Verified</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Certificate of Completion:</span>
            <span className="text-indigo-400 font-mono text-[10px]">Generated (#COC-2026)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              onClose();
              openCertificateView(envelopeId);
            }}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
          >
            <FileCheck className="w-4 h-4" />
            <span>View Certificate of Completion</span>
          </button>

          <button
            onClick={() => {
              onClose();
              setActiveView('dashboard');
            }}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
