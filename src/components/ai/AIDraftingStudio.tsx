import React, { useState } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Check, 
  X, 
  FileText, 
  Layers, 
  Send, 
  BookOpen, 
  ArrowRight,
  RefreshCw,
  Copy
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { generateContractDraft } from '../../utils/aiEngine';
import { AIDraftClauseSuggestion } from '../../types/signflow';

export const AIDraftingStudio: React.FC = () => {
  const { createNewEnvelope, notify } = useSignFlow();

  const [prompt, setPrompt] = useState('Standard Enterprise Master Services Agreement with Delaware law, Net 30 invoicing, and 12-month trailing fee liability cap');
  const [agreementType, setAgreementType] = useState('MSA');
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftResult, setDraftResult] = useState<{
    title: string;
    clauses: AIDraftClauseSuggestion[];
    fullDraftContent: string;
  } | null>(null);

  const samplePrompts = [
    { label: 'Mutual NDA (2-Yr Term)', text: 'Mutual NDA between two software companies, 2-year confidentiality term, Delaware law, standard trade secret exceptions' },
    { label: 'Executive Employment Offer', text: 'Executive VP Engineering Offer Letter with $240k base, 4-year equity option vesting with 1-year cliff, at-will terms, and proprietary invention assignment' },
    { label: 'SaaS SLA & Subscription', text: 'Enterprise SaaS Agreement with 99.9% uptime SLA, credit remedies, Net 30 payment terms, and SOC 2 Type II data security commitments' },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const draft = generateContractDraft(prompt, agreementType);
      setDraftResult(draft);
      setIsGenerating(false);
      notify('ai', 'AI Draft Generated', `Drafted 5 standard-compliant clauses grounded in vetted legal templates.`);
    }, 700);
  };

  const handleClauseDecision = (clauseId: string, decision: 'accepted' | 'rejected') => {
    if (!draftResult) return;
    setDraftResult({
      ...draftResult,
      clauses: draftResult.clauses.map(c => c.id === clauseId ? { ...c, status: decision } : c)
    });
  };

  const handlePushToEnvelope = () => {
    if (!draftResult) return;
    const newEnv = createNewEnvelope({
      title: draftResult.title,
      description: `AI-Drafted Agreement: ${prompt}`,
      tags: ['AI-Drafted', 'Legal-Review', agreementType],
      documents: [
        {
          id: 'doc-ai-' + Date.now(),
          name: `${draftResult.title.replace(/\s+/g, '_')}.pdf`,
          size: '1.4 MB',
          fileType: 'pdf',
          sha256Hash: 'ai_draft_sha256_' + Date.now(),
          pages: [
            {
              pageNumber: 1,
              title: '1. Commercial Terms & Obligations',
              content: draftResult.fullDraftContent
            }
          ]
        }
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/50 border border-indigo-500/20 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-indigo-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <h2 className="text-lg font-display font-bold text-white tracking-tight">
            AI Document Drafting Assistant
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
            RAG Grounded • Anti-Hallucination
          </span>
        </div>

        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Generate first-draft agreements grounded in our vetted clause library. Compare aggressive counterparty language against balanced corporate standards with track-changes redlines.
        </p>

        {/* Prompt Input */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your contract requirements in natural language..."
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] shrink-0"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Drafting Clauses...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Contract Draft</span>
                </>
              )}
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 text-[11px]">Quick Templates:</span>
            {samplePrompts.map(sp => (
              <button
                key={sp.label}
                onClick={() => {
                  setPrompt(sp.text);
                  setAgreementType(sp.label.split(' ')[0]);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] transition-colors"
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Draft & Redline Suggestion Cards */}
      {draftResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Generated Clauses & Redline Suggestions</h3>
              <p className="text-xs text-slate-400">Review AI suggestions and accept/reject changes individually</p>
            </div>
            <button
              onClick={handlePushToEnvelope}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Convert to Live Envelope & Send</span>
            </button>
          </div>

          <div className="space-y-4">
            {draftResult.clauses.map((clause, idx) => {
              const isAccepted = clause.status === 'accepted';
              const isRejected = clause.status === 'rejected';

              return (
                <div
                  key={clause.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-mono font-bold text-xs">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200">{clause.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {clause.category}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-500 font-mono">{clause.sourceCitation}</span>
                      <button
                        onClick={() => handleClauseDecision(clause.id, 'accepted')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all ${
                          isAccepted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 hover:bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Standard</span>
                      </button>
                      <button
                        onClick={() => handleClauseDecision(clause.id, 'rejected')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all ${
                          isRejected
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-800 hover:bg-rose-950 text-rose-400 border border-rose-800/60'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Keep Original</span>
                      </button>
                    </div>
                  </div>

                  {/* Track-changes Redline Diff View */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Aggressive / Original */}
                    <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                      <span className="text-[10px] font-mono text-rose-400 font-semibold uppercase">
                        Aggressive / One-Sided Term:
                      </span>
                      <p className="text-rose-200 text-[11px] leading-relaxed line-through opacity-80">
                        {clause.originalText}
                      </p>
                    </div>

                    {/* AI Balanced Recommendation */}
                    <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Vetted Balanced Standard:
                      </span>
                      <p className="text-emerald-200 text-[11px] leading-relaxed font-medium">
                        {clause.suggestedText}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
