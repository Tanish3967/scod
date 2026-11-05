import React from 'react';
import { CheckCircle2, ShieldCheck, Download, ExternalLink, ArrowRight, FileCheck, Send, UserCheck, Clock } from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { Recipient } from '../../types/signflow';
import { downloadFlattenedEnvelopePdf } from '../../utils/pdfFlattener';

export interface SignSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  envelopeTitle: string;
  envelopeId: string;
  signedRecipient?: Recipient | null;
  allSigned?: boolean;
  nextRecipient?: Recipient | null;
}

export const SignSuccessModal: React.FC<SignSuccessModalProps> = ({ 
  isOpen, 
  onClose, 
  envelopeTitle, 
  envelopeId,
  signedRecipient,
  allSigned = false,
  nextRecipient
}) => {
  const { openCertificateView, closeCertificateView, setActiveView, envelopes } = useSignFlow();
  const envelope = envelopes.find(e => e.id === envelopeId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-center space-y-5">
        {/* Animated Checkmark */}
        <div className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto shadow-lg ${
          allSigned 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20' 
            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-indigo-500/20'
        }`}>
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border uppercase font-bold inline-block ${
            allSigned 
              ? 'bg-emerald-950 text-emerald-400 border-emerald-800/40' 
              : 'bg-indigo-950 text-indigo-400 border-indigo-800/40'
          }`}>
            {allSigned ? 'All Parties Signed & Sealed' : 'Step Completed • Next Signer Notified'}
          </span>
          <h3 className="text-xl font-display font-bold text-white tracking-tight">
            {allSigned ? 'Agreement Fully Executed!' : 'Signature Registered!'}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {allSigned 
              ? `"${envelopeTitle}" has been signed by all required parties and cryptographically locked.`
              : `Thank you, ${signedRecipient?.name || 'Signer'}. Your signature has been recorded and an invitation has been dispatched to the next counterparty.`}
          </p>
        </div>

        {/* Sequential Workflow Status / Security Box */}
        {!allSigned && nextRecipient ? (
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-300 font-display flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Sequential Signing Workflow
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/50">
                In Progress
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">✓</span>
                  <span className="text-slate-300 font-medium">{signedRecipient?.name || 'Signer 1'}</span>
                </div>
                <span className="text-emerald-400 text-[10px] font-semibold">Signed</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center">2</span>
                  <div>
                    <div className="text-white font-medium text-[11px]">{nextRecipient.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{nextRecipient.email}</div>
                  </div>
                </div>
                <span className="text-indigo-400 text-[10px] font-semibold flex items-center gap-1">
                  <Send className="w-3 h-3" /> Dispatched
                </span>
              </div>
            </div>
          </div>
        ) : (
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
              <span className="text-indigo-400 font-mono text-[10px]">Generated & Appended</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {allSigned && envelope && (
            <button
              onClick={() => downloadFlattenedEnvelopePdf(envelope)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Final Signed PDF</span>
            </button>
          )}

          {allSigned ? (
            <button
              onClick={() => {
                onClose();
                openCertificateView(envelopeId);
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>View Certificate of Completion</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                closeCertificateView();
                setActiveView('envelopes');
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Done & Close</span>
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              closeCertificateView();
              setActiveView('envelopes');
            }}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition-colors"
          >
            Return to Envelopes Vault
          </button>
        </div>
      </div>
    </div>
  );
};
