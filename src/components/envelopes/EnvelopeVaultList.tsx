import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Send, 
  CheckCircle2, 
  Clock, 
  PenTool, 
  Trash2, 
  Eye, 
  Sparkles, 
  FileCheck,
  MoreVertical,
  ShieldCheck,
  Stamp
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { EnvelopeStatus, Envelope } from '../../types/signflow';
import { formatTimestamp } from '../../utils/cryptoUtils';

export const EnvelopeVaultList: React.FC = () => {
  const { 
    envelopes, 
    createNewEnvelope, 
    setActiveEnvelopeId, 
    setActiveView, 
    openSigningSession, 
    openCertificateView,
    deleteEnvelope,
    voidEnvelope,
    runAIRiskScan
  } = useSignFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEnvelopes, setSelectedEnvelopes] = useState<string[]>([]);

  const filtered = envelopes.filter(env => {
    const matchesQuery = 
      env.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      env.sender.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      env.recipients.some(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.email.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;
    if (statusFilter === 'all') return true;
    return env.status === statusFilter;
  });

  const getStatusBadge = (status: EnvelopeStatus) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40 uppercase">Completed</span>;
      case 'sent':
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-800/40 uppercase">Out For Sign</span>;
      case 'viewed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800/40 uppercase">Viewed</span>;
      case 'signed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800/40 uppercase">Partially Signed</span>;
      case 'voided':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 text-rose-400 border border-rose-800/40 uppercase">Voided</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700 uppercase">Draft</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              Envelopes & Agreement Vault
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Central ledger of all in-flight, signed, and completed digital agreements with tamper-evident audit trails.
          </p>
        </div>

        <button
          onClick={() => createNewEnvelope()}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all self-start sm:self-auto hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Prepare New Envelope</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter by agreement title, recipient name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex space-x-1.5 overflow-x-auto text-xs">
          {(['all', 'draft', 'sent', 'signed', 'completed', 'voided'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-all text-xs font-medium whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {status === 'all' ? 'All Agreements' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Envelopes List Table */}
      <div className="space-y-3">
        {filtered.map(env => {
          const isCompleted = env.status === 'completed';
          const isReadyToSign = env.status === 'sent' || env.status === 'delivered' || env.status === 'viewed';

          return (
            <div
              key={env.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Info Column */}
              <div className="flex items-start space-x-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate">{env.title}</h3>
                    {getStatusBadge(env.status)}
                    {env.requiresNotary && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-mono">
                        RON Notarized
                      </span>
                    )}
                    {env.requiresPayment && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-400 border border-purple-800/40 font-mono">
                        ${env.totalPaymentAmount?.toLocaleString()} Deposit
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 truncate">
                    Sender: <strong className="text-slate-300">{env.sender.name}</strong> ({env.sender.organization}) • Created {formatTimestamp(env.createdAt)}
                  </p>

                  {/* Recipients summary chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {env.recipients.map(r => (
                      <span
                        key={r.id}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono flex items-center space-x-1 ${
                          r.status === 'signed'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        <span>{r.name}</span>
                        <span>({r.status})</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons Column */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-center">
                {isReadyToSign && (
                  <button
                    onClick={() => openSigningSession(env.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center space-x-1.5"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Sign Agreement</span>
                  </button>
                )}

                {isCompleted && (
                  <button
                    onClick={() => openCertificateView(env.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>View Certificate</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveEnvelopeId(env.id);
                    setActiveView('prepare');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Edit Studio
                </button>

                <button
                  onClick={() => {
                    setActiveEnvelopeId(env.id);
                    runAIRiskScan(env.id);
                    setActiveView('ai-hub');
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-400"
                  title="Run AI Risk Scan"
                >
                  <Sparkles className="w-4 h-4" />
                </button>

                <button
                  onClick={() => voidEnvelope(env.id, 'User voided from envelope list')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-400"
                  title="Void Agreement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">No matching agreements found</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Try searching with a different keyword or reset filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
