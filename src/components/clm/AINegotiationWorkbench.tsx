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
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-indigo-950/50 border border-purple-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-400">
            <GitPullRequest className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              AI Live Negotiation & Redlining Workbench
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Side-by-side contract redlining, counterparty markup reconciliation, and fallback clause insertions.
          </p>
        </div>

        <button
          onClick={() => notify('success', 'Redline Dispatched', 'Exported track-changes markup to counterparty.')}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send Counter-Markup to Party</span>
        </button>
      </div>

      {/* 2-Column Redlining Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Clause List */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Negotiation Clauses ({clauses.length})
          </span>

          <div className="space-y-2">
            {clauses.map(c => {
              const isSelected = c.id === activeClauseId;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveClauseId(c.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 shadow-md'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono text-purple-400 font-bold">{c.section}</span>
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] uppercase ${
                      c.status === 'accepted' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{c.clauseTitle}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">{c.comments.length} comments</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Side-by-Side Comparison & Thread (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono text-purple-400 font-bold">{activeClause.section}</span>
                <h3 className="text-sm font-bold text-white">{activeClause.clauseTitle}</h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDecision(activeClause.id, 'accepted')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept Our Standard</span>
                </button>
                <button
                  onClick={() => handleDecision(activeClause.id, 'countered')}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Counter-Draft</span>
                </button>
              </div>
            </div>

            {/* Side-by-Side Diffs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-1.5">
                <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">Counterparty Redline</span>
                <p className="text-rose-200 text-[11.5px] leading-relaxed line-through opacity-85">
                  {activeClause.counterpartyText}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" /> Our Corporate Playbook Standard
                </span>
                <p className="text-emerald-200 text-[11.5px] leading-relaxed font-medium">
                  {activeClause.ourStandardText}
                </p>
              </div>
            </div>

            {/* AI Explanation Banner */}
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="leading-snug">
                <strong className="text-indigo-300">AI Legal Rationale:</strong> {activeClause.aiRationale}
              </p>
            </div>

            {/* Comment Thread */}
            <div className="pt-2 space-y-3">
              <span className="text-xs font-bold text-slate-400 flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                <span>Internal & Party Negotiation Thread</span>
              </span>

              <div className="space-y-2">
                {activeClause.comments.map((cm, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <strong className="text-indigo-300">{cm.author}</strong>
                      <span className="font-mono">{cm.time}</span>
                    </div>
                    <p className="text-slate-200 text-[11px]">{cm.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add comment or revision rationale..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
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
