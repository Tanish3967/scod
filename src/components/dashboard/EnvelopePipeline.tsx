import React from 'react';
import { 
  FileText, 
  Send, 
  Eye, 
  PenTool, 
  CheckCircle2, 
  AlertCircle, 
  Ban, 
  Clock 
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { EnvelopeStatus } from '../../types/signflow';

export const EnvelopePipeline: React.FC = () => {
  const { envelopes, setActiveEnvelopeId, setActiveView } = useSignFlow();

  const stages: { status: EnvelopeStatus; label: string; icon: React.FC<{ className?: string }>; color: string }[] = [
    { status: 'draft', label: 'Drafts', icon: FileText, color: 'text-slate-400 border-slate-700 bg-slate-800/40' },
    { status: 'sent', label: 'Out for Sign', icon: Send, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' },
    { status: 'viewed', label: 'Viewed', icon: Eye, color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
    { status: 'signed', label: 'Partially Signed', icon: PenTool, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    { status: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Envelope Lifecycle Pipeline</h3>
          <p className="text-xs text-slate-400">Real-time state machine tracking from drafting to cryptographic seal</p>
        </div>
        <button
          onClick={() => setActiveView('envelopes')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
        >
          View All Vault →
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const matchingEnvelopes = envelopes.filter(e => e.status === stage.status);

          return (
            <div
              key={stage.status}
              className={`p-3.5 rounded-xl border transition-all ${stage.color}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{stage.label}</span>
                </div>
                <span className="text-sm font-bold font-mono px-1.5 py-0.5 rounded bg-slate-950/40">
                  {matchingEnvelopes.length}
                </span>
              </div>

              <div className="mt-3 space-y-1.5">
                {matchingEnvelopes.slice(0, 2).map((env) => (
                  <button
                    key={env.id}
                    onClick={() => {
                      setActiveEnvelopeId(env.id);
                      setActiveView('envelopes');
                    }}
                    className="w-full text-left p-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-950 border border-white/5 text-[11px] text-slate-300 hover:text-white transition-colors truncate block"
                  >
                    <span className="font-medium truncate block">{env.title}</span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {env.recipients[0]?.name || 'Signer'}
                    </span>
                  </button>
                ))}
                {matchingEnvelopes.length === 0 && (
                  <div className="text-[10px] text-slate-500 py-2 text-center italic">
                    No active items
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
