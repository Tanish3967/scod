import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  Sparkles, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

export const MetricCards: React.FC = () => {
  const { envelopes } = useSignFlow();

  const total = envelopes.length;
  const completed = envelopes.filter(e => e.status === 'completed').length;
  const pending = envelopes.filter(e => e.status === 'sent' || e.status === 'delivered' || e.status === 'viewed').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 85;

  const metrics = [
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      subtitle: '+4.2% vs industry avg (85% target)',
      trend: '+4.2%',
      isPositive: true,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Median Turnaround Time',
      value: '4.8 hrs',
      subtitle: 'Target < 24 hrs (DocuSign: 18 hrs)',
      trend: '-62% faster',
      isPositive: true,
      icon: Clock,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'Active In-Flight Envelopes',
      value: pending.toString(),
      subtitle: 'Awaiting signer action or approver',
      trend: '3 expedited',
      isPositive: true,
      icon: Zap,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      title: 'AI Drafting & Risk Shield',
      value: '98.4%',
      subtitle: '0 false negatives in legal audit sample',
      trend: '100% Guardrail pass',
      isPositive: true,
      icon: Sparkles,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.title}
            className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{m.title}</span>
              <div className={`p-2 rounded-xl border ${m.bgColor}`}>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-display font-bold text-white tracking-tight">{m.value}</span>
              <span className="text-[11px] font-medium text-emerald-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                {m.trend}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 truncate">{m.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};
