import React, { useState } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Bell, 
  Plus, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { ObligationItem } from '../../types/signflow';

export const ObligationCalendarTracker: React.FC = () => {
  const { envelopes, notify } = useSignFlow();

  const allObligations: (ObligationItem & { envelopeTitle: string })[] = [];

  envelopes.forEach(env => {
    if (env.extractedObligations) {
      env.extractedObligations.forEach(ob => {
        allObligations.push({ ...ob, envelopeTitle: env.title });
      });
    }
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'payment' | 'renewal' | 'deliverable'>('all');

  const filtered = allObligations.filter(ob => {
    if (activeFilter === 'all') return true;
    return ob.type === activeFilter;
  });

  const handleSyncCalendar = () => {
    notify('success', 'Calendar Sync Active', 'Exported ical feed with automatic 30-day renewal alerts.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400">
            <Calendar className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              Obligation & Key-Date Extraction
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            AI automatically extracts renewal notice dates, payment terms, and deliverable milestones upon contract completion.
          </p>
        </div>

        <button
          onClick={handleSyncCalendar}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Sync with Google / Outlook</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 text-xs">
        {(['all', 'payment', 'renewal', 'deliverable'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
              activeFilter === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab} Obligations
          </button>
        ))}
      </div>

      {/* Obligations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(ob => {
          const isPayment = ob.type === 'payment';
          const isRenewal = ob.type === 'renewal';

          return (
            <div
              key={ob.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-xl border ${
                    isPayment 
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {isPayment ? <DollarSign className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{ob.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Due: {ob.dueDate}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 uppercase font-mono">
                  {ob.status}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Contract:</span>
                  <span className="font-semibold text-slate-200 truncate max-w-[200px]">{ob.envelopeTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Responsible Party:</span>
                  <span className="text-indigo-300">{ob.responsibleParty}</span>
                </div>
                {ob.amount && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount:</span>
                    <span className="font-mono font-bold text-white">{ob.amount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Clause Reference:</span>
                  <span className="font-mono text-[11px] text-slate-400">{ob.clauseReference}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-emerald-400 flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Auto-reminder 14 days prior
                </span>
                <button
                  onClick={() => notify('info', 'Task Created', `Added task for ${ob.title}`)}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Create Task →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
