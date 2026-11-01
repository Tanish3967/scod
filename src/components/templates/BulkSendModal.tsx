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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Bulk Send Dispatcher</h3>
              <p className="text-[11px] text-slate-400">CSV multi-party batch envelope campaign</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Send <strong className="text-slate-900">"{templateName}"</strong> to hundreds of signers simultaneously via CSV merge. Each recipient receives an individually tracked envelope with cryptographic audit ledger.
        </p>

        {/* CSV Upload Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Q3_Vendor_Signers_List.csv</p>
                <p className="text-[10px] text-slate-500 font-mono">142 rows mapped • 0 invalid rows</p>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
              ✓ Ready to Dispatch
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-700 space-y-1.5 shadow-2xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Mapped Merge Columns:</span>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono text-[10px] font-semibold">Recipient_Name</span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono text-[10px] font-semibold">Email_Address</span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono text-[10px] font-semibold">Custom_Fee_Amount</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end space-x-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSendBulk}
            disabled={isSending}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow-md flex items-center space-x-2 transition-all cursor-pointer"
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
