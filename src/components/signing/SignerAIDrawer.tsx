import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  BookOpen, 
  AlertCircle, 
  ShieldCheck, 
  GitPullRequest, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { generateSignerSummary, answerContractQuestion, analyzeSignerGuardianRisks } from '../../utils/aiEngine';

export const SignerAIDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentContent: string;
  onOpenNegotiation?: (clauseTitle: string, originalText: string, defaultCompromise?: string) => void;
}> = ({ isOpen, onClose, documentTitle, documentContent, onOpenNegotiation }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'guardian' | 'chat'>('guardian');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string; citations?: any[] }[]>([
    {
      role: 'assistant',
      text: `Hello! I am your SignFlow Legal Assistant. Ask me any question about "${documentTitle}" (e.g. "What is my liability?", "When do I need to pay?"). All answers are strictly grounded in this contract.`
    }
  ]);
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const summary = generateSignerSummary(documentTitle, documentContent);
  const guardianReport = analyzeSignerGuardianRisks(documentContent);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);

    setTimeout(() => {
      const response = answerContractQuestion(userText, documentTitle, documentContent);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: response.answer,
          citations: response.citations
        }
      ]);
    }, 400);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Signer AI Copilot</h3>
            <p className="text-[10px] text-slate-400">Plain-Language Review & RAG Q&A</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-2 border-b border-slate-800 flex space-x-2 bg-slate-950/40">
        <button
          onClick={() => setActiveTab('guardian')}
          className={`flex items-center space-x-1.5 pb-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'guardian'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Guardian Angel</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 font-mono font-bold">
            {guardianReport.fairnessScore}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center space-x-1.5 pb-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'summary'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>TL;DR</span>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center space-x-1.5 pb-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'chat'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Ask AI</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'guardian' ? (
          <div className="space-y-4 text-xs">
            {/* Fairness Score Hero Card */}
            <div className={`p-4 rounded-2xl border space-y-2.5 ${
              guardianReport.fairnessScore >= 80 
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100'
                : guardianReport.fairnessScore >= 60 
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-100'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-100'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Contract Fairness Score</span>
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  guardianReport.fairnessScore >= 80 ? 'bg-emerald-900/80 text-emerald-300' : 'bg-rose-900/80 text-rose-300'
                }`}>
                  Grade {guardianReport.fairnessGrade} ({guardianReport.riskLevel.toUpperCase()})
                </span>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black font-display tracking-tight text-white">
                  {guardianReport.fairnessScore}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    guardianReport.fairnessScore >= 80 ? 'bg-emerald-500' : guardianReport.fairnessScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${guardianReport.fairnessScore}%` }}
                />
              </div>

              <p className="text-[10px] text-slate-400 italic">
                {guardianReport.benchmarkComparison}
              </p>
            </div>

            {/* Gotcha Clause Findings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Key Clauses & Risks Detected ({guardianReport.findings.length})</span>
                </span>
              </div>

              {guardianReport.findings.map(finding => (
                <div 
                  key={finding.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{finding.title}</span>
                    <span className={`text-[9px] font-mono px-2 py-0.2 rounded font-bold uppercase ${
                      finding.severity === 'critical' 
                        ? 'bg-rose-950 text-rose-400 border border-rose-800' 
                        : finding.severity === 'high' 
                          ? 'bg-amber-950 text-amber-400 border border-amber-800' 
                          : 'bg-slate-800 text-slate-300'
                    }`}>
                      {finding.severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 font-mono text-[10px] leading-relaxed">
                    "{finding.excerpt}"
                  </p>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">
                      Plain-English Risk:
                    </span>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {finding.plainEnglishRisk}
                    </p>
                  </div>

                  {onOpenNegotiation && (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {finding.clauseReference}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onOpenNegotiation(finding.clauseReference, finding.excerpt, finding.recommendedCompromise);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <GitPullRequest className="w-3 h-3" />
                        <span>Propose AI Compromise</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'summary' ? (
          <div className="space-y-3.5 text-xs">
            {/* Legal Disclaimer */}
            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-amber-300 text-[11px] flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-snug">
                <strong>Disclaimer:</strong> This summary is an AI-generated reading aid and not formal legal advice. Always review the full text before signing.
              </p>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed">
              {summary.overview}
            </p>

            {/* Key Takeaways */}
            <div className="space-y-2.5">
              {summary.keyTakeaways.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{item.heading}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{item.summary}</p>
                  <p className="text-[10px] text-slate-500 font-mono italic">Impact: {item.impact}</p>
                </div>
              ))}
            </div>

            {/* Signer Rights */}
            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1.5">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
                Your Legal Protections
              </span>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {summary.signerRights.map((r, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-indigo-400">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full justify-between space-y-3">
            <div className="space-y-3 overflow-y-auto max-h-96 pr-1">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-xs ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white ml-6'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-200 mr-4'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                      <span className="text-[9px] font-mono text-indigo-400 uppercase">
                        Source Citation (RAG Grounded):
                      </span>
                      {msg.citations.map((c, cIdx) => (
                        <div key={cIdx} className="p-1.5 rounded bg-slate-900 border border-slate-700/60 text-[10px] text-slate-300">
                          <p className="font-semibold text-slate-200">Page {c.page} • {c.clauseTitle}</p>
                          <p className="text-slate-400 italic text-[9px] mt-0.5">"{c.paragraph.slice(0, 100)}..."</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Footer if tab == chat */}
      {activeTab === 'chat' && (
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask about liability, fees, terms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </div>
  );
};
