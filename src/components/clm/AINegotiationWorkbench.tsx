import React, { useState } from 'react';
import { 
  GitPullRequest, 
  Sparkles, 
  Check, 
  X, 
  MessageSquare, 
  Plus, 
  FileText, 
  ArrowRight,
  ShieldAlert,
  Send,
  BookOpen
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { CLAUSE_LIBRARY } from '../../data/clauseLibrary';

interface RedlineClause {
  id: string;
  section: string;
  clauseTitle: string;
  counterpartyText: string;
  ourStandardText: string;
  aiRationale: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  comments: { author: string; text: string; time: string }[];
}

export const AINegotiationWorkbench: React.FC = () => {
  const { notify } = useSignFlow();

  const [clauses, setClauses] = useState<RedlineClause[]>([
    {
      id: 'cl-1',
      section: 'Section 4.1',
      clauseTitle: 'Limitation of Liability & Consequential Damages',
      counterpartyText: 'In no event shall Vendor aggregate liability under this Agreement exceed fifty US Dollars ($50.00). Customer waives all rights to incidental damages.',
      ourStandardText: 'Except for confidentiality breaches, the aggregate cumulative liability of either party shall be capped at total fees paid in the twelve (12) months preceding the claim.',
      aiRationale: 'Counterparty draft limits liability to nominal $50.00, which leaves customer completely unprotected in data breach incidents.',
      status: 'pending',
      comments: [
        { author: 'Legal Counsel (You)', text: 'Unacceptable cap. Must revert to 12-month trailing spend.', time: '10m ago' },
        { author: 'Counterparty Counsel', text: 'Our executive team requested this as a baseline term.', time: '5m ago' }
      ]
    },
    {
      id: 'cl-2',
      section: 'Section 7.3',
      clauseTitle: 'Indemnification & IP Infringement Defense',
      counterpartyText: 'Customer agrees to defend, indemnify, and hold harmless Vendor from any claims arising out of Customer use of the platform.',
      ourStandardText: 'Each party shall defend and indemnify the other party against claims arising out of third-party IP infringement or gross negligence.',
      aiRationale: 'Unilateral indemnity unfairly protects vendor while failing to indemnify customer against third-party patent/copyright claims.',
      status: 'pending',
      comments: [
        { author: 'SignFlow AI', text: 'Suggested reciprocal IP defense clause from Clause Library (#V-CL-INDEMNITY).', time: '15m ago' }
      ]
    }
  ]);

  const [activeClauseId, setActiveClauseId] = useState<string>('cl-1');
  const [newComment, setNewComment] = useState('');

  const activeClause = clauses.find(c => c.id === activeClauseId) || clauses[0];

  const handleDecision = (id: string, decision: 'accepted' | 'rejected' | 'countered') => {
    setClauses(prev => prev.map(c => c.id === id ? { ...c, status: decision } : c));
    notify('success', `Clause ${decision.toUpperCase()}`, `Updated negotiation state for ${activeClause.clauseTitle}`);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setClauses(prev => prev.map(c => {
      if (c.id !== activeClauseId) return c;
      return {
        ...c,
        comments: [...c.comments, { author: 'Legal Counsel (You)', text: newComment, time: 'Just now' }]
      };
    }));
    setNewComment('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">
              AI Live Negotiation & Redlining Workbench
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Side-by-side contract redlining, counterparty markup reconciliation, and fallback clause insertions.
            </p>
          </div>
        </div>

        <button
          onClick={() => notify('success', 'Redline Dispatched', 'Exported track-changes markup to counterparty.')}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs hover:shadow-md flex items-center space-x-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send Counter-Markup to Party</span>
        </button>
      </div>

      {/* 2-Column Redlining Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Clause List */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Negotiation Clauses ({clauses.length})
          </span>

          <div className="space-y-2.5">
            {clauses.map(c => {
              const isSelected = c.id === activeClauseId;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveClauseId(c.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-50/50 border-purple-500 shadow-sm'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className={`font-mono font-bold ${isSelected ? 'text-purple-700' : 'text-slate-500'}`}>
                      {c.section}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[9.5px] uppercase font-bold ${
                      c.status === 'accepted' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : isSelected 
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-slate-100 text-slate-600'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <h4 className={`text-xs font-bold ${isSelected ? 'text-slate-900 font-display' : 'text-slate-700'}`}>
                    {c.clauseTitle}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">{c.comments.length} comments</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Side-by-Side Comparison & Thread (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono text-purple-700 font-bold">{activeClause.section}</span>
                <h3 className="text-base font-bold text-slate-900 font-display">{activeClause.clauseTitle}</h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDecision(activeClause.id, 'accepted')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept Our Standard</span>
                </button>
                <button
                  onClick={() => handleDecision(activeClause.id, 'countered')}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Counter-Draft</span>
                </button>
              </div>
            </div>

            {/* Side-by-Side Diffs with Clean Light Red and Green Styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Counterparty Redline */}
              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-1.5 shadow-2xs">
                <span className="text-[10.5px] font-mono text-rose-700 uppercase font-bold tracking-wider">
                  Counterparty Redline
                </span>
                <p className="text-rose-950 text-[11.5px] leading-relaxed line-through decoration-rose-400 opacity-80">
                  {activeClause.counterpartyText}
                </p>
              </div>

              {/* Our Corporate Playbook Standard */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1.5 shadow-2xs">
                <span className="text-[10.5px] font-mono text-emerald-700 uppercase font-bold tracking-wider flex items-center">
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                  Our Corporate Playbook Standard
                </span>
                <p className="text-emerald-950 text-[11.5px] leading-relaxed font-medium">
                  {activeClause.ourStandardText}
                </p>
              </div>
            </div>

            {/* AI Explanation Banner */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-slate-700 flex items-start space-x-2.5 shadow-2xs">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="leading-snug">
                <strong className="text-indigo-900 font-semibold">AI Legal Rationale:</strong> {activeClause.aiRationale}
              </p>
            </div>

            {/* Comment Thread */}
            <div className="pt-2 space-y-3">
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5 font-display">
                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                <span>Internal & Party Negotiation Thread</span>
              </span>

              <div className="space-y-2">
                {activeClause.comments.map((cm, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <strong className="text-indigo-700 font-bold">{cm.author}</strong>
                      <span className="font-mono text-slate-400">{cm.time}</span>
                    </div>
                    <p className="text-slate-700 text-[11.5px]">{cm.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add comment or revision rationale..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  Post Note
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
