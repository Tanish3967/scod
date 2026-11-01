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
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">
              Obligation & Key-Date Extraction
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              AI automatically extracts renewal notice dates, payment terms, and deliverable milestones upon contract completion.
            </p>
          </div>
        </div>

        <button
          onClick={handleSyncCalendar}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs hover:shadow-md flex items-center space-x-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Sync with Google / Outlook</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200/80 pb-2.5 text-xs overflow-x-auto no-scrollbar">
        {(['all', 'payment', 'renewal', 'deliverable'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold capitalize transition-all cursor-pointer ${
              activeFilter === tab
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80'
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
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all space-y-3.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-xl border ${
                    isPayment 
                      ? 'bg-purple-50 text-purple-600 border-purple-100' 
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {isPayment ? <DollarSign className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{ob.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono font-medium">
                      Due: {ob.dueDate}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-mono font-bold">
                  {ob.status}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Contract:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">{ob.envelopeTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Responsible Party:</span>
                  <span className="text-indigo-600 font-semibold">{ob.responsibleParty}</span>
                </div>
                {ob.amount && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Amount:</span>
                    <span className="font-mono font-bold text-slate-900">{ob.amount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Clause Reference:</span>
                  <span className="font-mono text-[11px] text-slate-500 font-medium">{ob.clauseReference}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-emerald-600 font-medium flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  Auto-reminder 14 days prior
                </span>
                <button
                  onClick={() => notify('info', 'Task Created', `Added task for ${ob.title}`)}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer transition-colors"
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
