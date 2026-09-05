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
  Stamp,
  MoreHorizontal
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { EnvelopeStatus, Envelope } from '../../types/signflow';
import { formatTimestamp } from '../../utils/cryptoUtils';

export const EnvelopeVaultList: React.FC = () => {
  const { 
    envelopes, 
    prepareNewEnvelope, 
    setActiveEnvelopeId, 
    setActiveView, 
    openSigningSession, 
    openCertificateView,
    deleteEnvelope,
    voidEnvelope,
    runAIRiskScan,
    notify
  } = useSignFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">Completed</span>;
      case 'sent':
      case 'delivered':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">In Progress</span>;
      case 'viewed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">Waiting</span>;
      case 'signed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">Signed</span>;
      case 'voided':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">Voided</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">Draft</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight font-display">
            Envelopes Vault
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, sign, verify, and inspect enterprise digital agreements with append-only audit tracking.
          </p>
        </div>

        <button
          onClick={prepareNewEnvelope}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs flex items-center space-x-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Envelope</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by title, recipient, or tag..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          {['all', 'sent', 'completed', 'draft'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {st === 'sent' ? 'In Progress' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Envelopes Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 font-medium bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">Envelope Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Recipients</th>
                <th className="py-3 px-4">Created / Expiry</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((env) => (
                <tr key={env.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center space-x-3">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono text-rose-500 bg-rose-50 border border-rose-100">
                        PDF
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{env.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">#{env.id.toUpperCase().replace('ENV-', 'EN-')}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {getStatusBadge(env.status)}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center -space-x-1.5">
                      {env.recipients.map((rec, i) => (
                        <div
                          key={i}
                          title={`${rec.name} (${rec.role})`}
                          className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-[9px] flex items-center justify-center border-2 border-white"
                        >
                          {rec.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {formatTimestamp(env.createdAt)}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => openSigningSession(env.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-[11px] transition-all cursor-pointer whitespace-nowrap"
                      >
                        Sign
                      </button>
                      <button
                        onClick={() => openCertificateView(env.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-all cursor-pointer whitespace-nowrap"
                      >
                        Certificate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
