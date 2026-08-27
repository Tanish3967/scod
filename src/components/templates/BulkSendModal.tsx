import React, { useState } from 'react';
import { Upload, Check, X, FileSpreadsheet, Users, Send, RefreshCw, Sparkles } from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

export const BulkSendModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
}> = ({ isOpen, onClose, templateName }) => {
  const { notify } = useSignFlow();
  const [fileUploaded, setFileUploaded] = useState(true);
  const [recipientCount, setRecipientCount] = useState(142);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSendBulk = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      notify('success', 'Bulk Dispatch Complete!', `Dispatched ${recipientCount} individual envelopes using "${templateName}".`);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Users className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">Bulk Send Dispatcher</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Send <strong className="text-white">"{templateName}"</strong> to hundreds of signers simultaneously via CSV merge. Each recipient receives an individually tracked envelope.
        </p>

        {/* CSV Upload Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-white">Q3_Vendor_Signers_List.csv</p>
                <p className="text-[10px] text-slate-400 font-mono">142 rows mapped • 0 invalid rows</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-mono">
              Ready to Dispatch
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Mapped Merge Columns:</span>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[10px]">Recipient_Name</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[10px]">Email_Address</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[10px]">Custom_Fee_Amount</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSendBulk}
            disabled={isSending}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all hover:scale-[1.02]"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Fan-out Dispatching...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Launch {recipientCount} Envelopes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
