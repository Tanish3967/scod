import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Lock, 
  Phone, 
  Mail, 
  Fingerprint, 
  ArrowDownUp, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { Recipient, RecipientRole, AuthType } from '../../types/signflow';
import { generateUUID } from '../../utils/cryptoUtils';

export const RecipientConfigPanel: React.FC<{
  recipients: Recipient[];
  onUpdateRecipients: (recipients: Recipient[]) => void;
  selectedRecipientId: string;
  onSelectRecipientId: (id: string) => void;
}> = ({ recipients, onUpdateRecipients, selectedRecipientId, onSelectRecipientId }) => {
  const [routingMode, setRoutingMode] = useState<'sequential' | 'parallel' | 'conditional'>('sequential');
  const [showConditionalModal, setShowConditionalModal] = useState(false);

  const addRecipient = () => {
    const newRec: Recipient = {
      id: 'rec-' + generateUUID().slice(0, 6),
      name: `Recipient ${recipients.length + 1}`,
      email: `recipient${recipients.length + 1}@example.com`,
      role: 'signer',
      routingOrder: recipients.length + 1,
      authType: 'email',
      status: 'ready'
    };
    const updated = [...recipients, newRec];
    onUpdateRecipients(updated);
    onSelectRecipientId(newRec.id);
  };

  const removeRecipient = (id: string) => {
    if (recipients.length <= 1) return;
    const updated = recipients.filter(r => r.id !== id);
    onUpdateRecipients(updated);
    if (selectedRecipientId === id) {
      onSelectRecipientId(updated[0].id);
    }
  };

  const updateRecipient = (id: string, updates: Partial<Recipient>) => {
    const updated = recipients.map(r => r.id === id ? { ...r, ...updates } : r);
    onUpdateRecipients(updated);
  };

  return (
    <div className="w-80 bg-slate-900/90 border-l border-slate-800/80 p-4 shrink-0 flex flex-col justify-between h-full overflow-y-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recipients & Routing</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Define signers, approvers & auth gates</p>
          </div>
          <button
            onClick={addRecipient}
            className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-xs font-medium flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Routing Order Selector */}
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Routing Workflow Mode
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(['sequential', 'parallel', 'conditional'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => {
                  setRoutingMode(mode);
                  if (mode === 'conditional') setShowConditionalModal(true);
                }}
                className={`py-1 rounded-lg text-[10px] font-medium capitalize transition-all ${
                  routingMode === mode
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          {routingMode === 'conditional' && (
            <p className="text-[10px] text-indigo-400 pt-1">
              • Rule Active: If Total Amount &gt; $50k → Route to VP Finance
            </p>
          )}
        </div>

        {/* Recipient Cards */}
        <div className="space-y-3">
          {recipients.map((rec, index) => {
            const isSelected = rec.id === selectedRecipientId;

            return (
              <div
                key={rec.id}
                onClick={() => onSelectRecipientId(rec.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md shadow-indigo-950'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-mono font-bold text-[10px]">
                      {routingMode === 'sequential' ? index + 1 : '•'}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">{rec.name}</span>
                  </div>
                  {recipients.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecipient(rec.id);
                      }}
                      className="text-slate-600 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <input
                      type="text"
                      aria-label="Recipient Name"
                      value={rec.name}
                      onChange={(e) => updateRecipient(rec.id, { name: e.target.value })}
                      placeholder="Full Name"
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-slate-200 text-[11px] focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      aria-label="Recipient Email"
                      value={rec.email}
                      onChange={(e) => updateRecipient(rec.id, { email: e.target.value })}
                      placeholder="Email Address"
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-slate-200 text-[11px] focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* Role */}
                    <div>
                      <label className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">Role</label>
                      <select
                        aria-label="Recipient Role"
                        value={rec.role}
                        onChange={(e) => updateRecipient(rec.id, { role: e.target.value as RecipientRole })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-md px-1.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="signer">Signer</option>
                        <option value="approver">Approver</option>
                        <option value="cc">CC / Viewer</option>
                        <option value="in_person">In-Person</option>
                        <option value="editor">Editor</option>
                      </select>
                    </div>

                    {/* Auth Tier */}
                    <div>
                      <label className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">Auth Tier</label>
                      <select
                        aria-label="Authentication Tier"
                        value={rec.authType}
                        onChange={(e) => updateRecipient(rec.id, { authType: e.target.value as AuthType })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-md px-1.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="email">Email Link</option>
                        <option value="access_code">Access Code</option>
                        <option value="sms_otp">SMS OTP</option>
                        <option value="kba">KBA Quiz</option>
                        <option value="idv_biometric">ID + Liveness</option>
                      </select>
                    </div>
                  </div>

                  {rec.authType === 'sms_otp' && (
                    <div className="pt-1">
                      <input
                        type="tel"
                        aria-label="Phone Number"
                        value={rec.phoneNumber || ''}
                        onChange={(e) => updateRecipient(rec.id, { phoneNumber: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-slate-200 text-[11px] focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500">
        Active Signer: <span className="font-mono text-indigo-400">{recipients.find(r => r.id === selectedRecipientId)?.name}</span>
      </div>
    </div>
  );
};
