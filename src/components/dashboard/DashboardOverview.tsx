import React from 'react';
import { 
  Sparkles, 
  Plus, 
  Send, 
  ShieldAlert, 
  Stamp, 
  FileText, 
  ArrowUpRight, 
  CheckCircle, 
  Clock, 
  Layers,
  ChevronRight
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { MetricCards } from './MetricCards';
import { EnvelopePipeline } from './EnvelopePipeline';

export const DashboardOverview: React.FC = () => {
  const { 
    envelopes, 
    createNewEnvelope, 
    setActiveEnvelopeId, 
    setActiveView, 
    openSigningSession,
    openCertificateView
  } = useSignFlow();

  const recentEnvelopes = envelopes.slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome & Quick Launch */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-purple-950/40 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Agreement Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              SignFlow Agreement Platform
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Legally binding e-signatures compliant with ESIGN, eIDAS & 21 CFR Part 11. Powered by autonomous smart field placement, clause risk analysis, and Remote Online Notarization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => createNewEnvelope()}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Prepare New Envelope</span>
            </button>
            <button
              onClick={() => setActiveView('ai-hub')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 font-semibold text-xs transition-all"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Legal Hub</span>
            </button>
            <button
              onClick={() => setActiveView('notary')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-all"
            >
              <Stamp className="w-4 h-4 text-emerald-400" />
              <span>Launch RON Notary</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <MetricCards />

      {/* Lifecycle Pipeline Funnel */}
      <EnvelopePipeline />

      {/* Two Column Layout: Recent Agreements & AI Actionable Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Envelopes */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Envelopes & Signing Sessions</h3>
              <p className="text-xs text-slate-400">Manage active signatures and review tamper-evident completion seals</p>
            </div>
            <button
              onClick={() => setActiveView('envelopes')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View All ({envelopes.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {recentEnvelopes.map((env) => {
              const isCompleted = env.status === 'completed';
              const isReadyToSign = env.status === 'sent' || env.status === 'viewed';

              return (
                <div
                  key={env.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-semibold text-slate-100 truncate">{env.title}</h4>
                        {env.requiresNotary && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono">
                            RON Notary
                          </span>
                        )}
                        {env.requiresPayment && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800/60 font-mono">
                            ${env.totalPaymentAmount?.toLocaleString()} Retainer
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Sent by {env.sender.name} • {env.recipients.length} Recipient(s) • Status: <span className="font-semibold uppercase text-slate-300">{env.status}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    {isReadyToSign && (
                      <button
                        onClick={() => openSigningSession(env.id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm"
                      >
                        Sign As Recipient
                      </button>
                    )}
                    {isCompleted && (
                      <button
                        onClick={() => openCertificateView(env.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
                      >
                        View Certificate
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setActiveEnvelopeId(env.id);
                        setActiveView('envelopes');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Copilot & Proactive Legal Alerts */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/20 border border-indigo-500/20 space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">AI Legal Insights & Playbook</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-indigo-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-300">Contract Drafter Ready</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono">
                  RAG Grounded
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Generate tailored NDAs, MSAs, or Employment letters grounded in vetted legal clauses with track-changes redlines.
              </p>
              <button
                onClick={() => setActiveView('ai-hub')}
                className="w-full py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
              >
                Open AI Drafting Studio →
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-300">Upcoming Key Milestones</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                  Extracted
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                <strong>Net 30 Invoicing</strong> ($45,000.00) due on Sept 30, 2026 for Acme Master Agreement.
              </p>
              <button
                onClick={() => setActiveView('ai-hub')}
                className="w-full py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
              >
                View Obligation Calendar →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
