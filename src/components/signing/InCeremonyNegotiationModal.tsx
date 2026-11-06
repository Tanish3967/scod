import React, { useState } from 'react';
import { 
  GitPullRequest, 
  Sparkles, 
  Check, 
  X, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Send
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { CLAUSE_LIBRARY } from '../../data/clauseLibrary';
import { NegotiationAmendment } from '../../types/signflow';

interface InCeremonyNegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  clauseTitle?: string;
  originalText?: string;
  clauseId?: string;
  defaultCompromise?: string;
}

export const InCeremonyNegotiationModal: React.FC<InCeremonyNegotiationModalProps> = ({
  isOpen,
  onClose,
  clauseTitle = 'Section 4.1: Limitation of Liability',
  originalText = 'In no event shall Vendor aggregate liability under this Agreement exceed fifty US Dollars ($50.00). Customer waives all rights to consequential, indirect, or incidental damages.',
  clauseId = 'cl-liability',
  defaultCompromise
}) => {
  const { activeEnvelope, proposeClauseAmendment, resolveClauseAmendment, notify } = useSignFlow();

  const [proposedText, setProposedText] = useState(
    defaultCompromise || 
    'Except for confidentiality breaches or gross negligence, the aggregate cumulative liability of either party shall not exceed the total fees paid by Customer in the twelve (12) months preceding the claim.'
  );
  const [reason, setReason] = useState('Standard enterprise corporate governance policy requires mutual trailing fee liability caps.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'playbook'>('edit');
  const [playbookUsed, setPlaybookUsed] = useState(Boolean(defaultCompromise));

  if (!isOpen || !activeEnvelope) return null;

  // Check if there is an existing pending amendment for this envelope/clause
  const pendingAmendment = activeEnvelope.negotiationAmendments?.find(
    a => a.clauseId === clauseId || a.sectionTitle === clauseTitle
  );

  const matchedClause = CLAUSE_LIBRARY.find(c => 
    c.id === clauseId || clauseTitle.toLowerCase().includes(c.category.toLowerCase())
  );

  const handleApplyPlaybook = (text: string) => {
    setProposedText(text);
    setPlaybookUsed(true);
    setActiveTab('edit');
    notify('ai', 'Playbook Compromise Applied', 'Inserted pre-vetted balanced clause into proposal.');
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedText.trim()) return;

    setIsSubmitting(true);
    const primarySigner = activeEnvelope.recipients.find(r => r.role === 'signer') || activeEnvelope.recipients[0];

    proposeClauseAmendment(activeEnvelope.id, {
      envelopeId: activeEnvelope.id,
      clauseId,
      sectionTitle: clauseTitle,
      proposerRecipientId: primarySigner.id,
      proposerName: primarySigner.name,
      originalText,
      proposedText,
      reason,
      playbookCompromiseUsed: playbookUsed
    });

    setIsSubmitting(false);
  };

  const handleApproveInPlace = () => {
    if (!pendingAmendment) return;
    resolveClauseAmendment(activeEnvelope.id, pendingAmendment.id, 'approved');
  };

  const handleReject = () => {
    if (!pendingAmendment) return;
    resolveClauseAmendment(activeEnvelope.id, pendingAmendment.id, 'rejected');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  In-Ceremony Live Clause Negotiation
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                  ⚡ Zero-Void Technology
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Propose in-place redlines without canceling this envelope or restarting signature workflows.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="px-6 pt-3 border-b border-slate-800/80 flex space-x-4 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('edit')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'edit'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Proposed Amendment
          </button>
          <button
            onClick={() => setActiveTab('playbook')}
            className={`pb-2.5 text-xs font-semibold border-b-2 flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'playbook'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Playbook Pre-Vetted Alternatives</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {pendingAmendment?.status === 'approved' ? (
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-emerald-300">Amendment Approved & Updated In-Place!</h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                The document text has been updated directly in the signing canvas. SHA-256 Merkle chain has logged this amendment without voiding previous verified actions.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Return to Document & Sign
              </button>
            </div>
          ) : activeTab === 'playbook' ? (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>
                  Select any pre-vetted legal compromise from the SignFlow Enterprise Playbook to resolve this clause with 1 click.
                </span>
              </div>

              {CLAUSE_LIBRARY.map(clause => (
                <div 
                  key={clause.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{clause.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {clause.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 leading-relaxed font-mono text-[11px]">
                    {clause.standardText}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400 italic">
                      Standard: {clause.playbookStandard.slice(0, 70)}...
                    </span>
                    <button
                      onClick={() => handleApplyPlaybook(clause.standardText)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1"
                    >
                      <span>Insert This Compromise</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmitProposal} className="space-y-4">
              {/* Target Section Title */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Target Clause: <strong>{clauseTitle}</strong></span>
                </span>
                {playbookUsed && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700/50 flex items-center space-x-1">
                    <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                    <span>Playbook Compromise</span>
                  </span>
                )}
              </div>

              {/* Original Wording */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1">
                  <span>Current Document Text (Counterparty Objection)</span>
                </label>
                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/30 text-xs text-rose-200 leading-relaxed font-mono line-through decoration-rose-500/70">
                  {originalText}
                </div>
              </div>

              {/* Proposed Wording */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Proposed Alternative Text (Balanced Redline)
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('playbook')}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Browse Playbook Compromises</span>
                  </button>
                </div>
                <textarea
                  value={proposedText}
                  onChange={(e) => setProposedText(e.target.value)}
                  rows={4}
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-xs text-emerald-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                  placeholder="Enter balanced alternative clause wording..."
                  required
                />
              </div>

              {/* Reason / Business Justification */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400">
                  Business Justification (Shared with Document Owner)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="e.g. Standard governance requirements for mutual indemnity..."
                  required
                />
              </div>

              {/* Active Proposal Status & Decision Panel */}
              {pendingAmendment && (
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Amendment Status: {pendingAmendment.status.toUpperCase()}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Proposed by: {pendingAmendment.proposerName}
                    </span>
                  </div>

                  {pendingAmendment.status === 'pending' && (
                    <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between gap-3">
                      <p className="text-[11px] text-slate-300">
                        Sender Action: Approve in-place or reject amendment.
                      </p>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleReject}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={handleApproveInPlace}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve In-Place</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !proposedText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center space-x-2 transition-all cursor-pointer hover:scale-105"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Amendment Proposal</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
