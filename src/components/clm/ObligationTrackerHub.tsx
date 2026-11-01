import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  FileText, 
  Sparkles, 
  DollarSign, 
  Send, 
  Filter, 
  Search, 
  Plus, 
  ChevronRight, 
  ExternalLink, 
  Check, 
  X,
  RefreshCw,
  Bell,
  ArrowUpRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { ContractObligation, ObligationType, ObligationStatus } from '../../types/signflow';
import { INITIAL_OBLIGATIONS } from '../../utils/obligationExtractor';
import { formatTimestamp, generateUUID } from '../../utils/cryptoUtils';

export const ObligationTrackerHub: React.FC = () => {
  const { envelopes, setActiveEnvelopeId, setActiveView, notify } = useSignFlow();

  const [obligations, setObligations] = useState<ContractObligation[]>(INITIAL_OBLIGATIONS);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // AI Query state
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // New Obligation Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContractTitle, setNewContractTitle] = useState(envelopes[0]?.title || 'Master Services Agreement');
  const [newCounterparty, setNewCounterparty] = useState('Acme Global Inc.');
  const [newType, setNewType] = useState<ObligationType>('renewal_notice');
  const [newDueDate, setNewDueDate] = useState('2026-12-01');
  const [newFinancialValue, setNewFinancialValue] = useState('50000');
  const [newAssignee, setNewAssignee] = useState('Legal Counsel (Sarah Jenkins)');

  // Filtered list
  const filtered = obligations.filter(obl => {
    const matchesSearch = 
      obl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obl.contractTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obl.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obl.assignee.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === 'all') return true;
    if (activeFilter === 'renewals') return obl.type === 'renewal_notice' || obl.autoRenewal;
    if (activeFilter === 'payments') return obl.type === 'payment_milestone';
    if (activeFilter === 'deliverables') return obl.type === 'deliverable';
    if (activeFilter === 'sla') return obl.type === 'sla_performance';
    if (activeFilter === 'at_risk') return obl.status === 'at_risk' || obl.isEscalated;
    return true;
  });

  // KPI Metrics
  const totalActive = obligations.length;
  const renewalsCount = obligations.filter(o => o.type === 'renewal_notice' || o.autoRenewal).length;
  const atRiskCount = obligations.filter(o => o.status === 'at_risk' || o.isEscalated).length;
  const totalFinancialExposure = obligations.reduce((acc, o) => acc + (o.financialValue || 0), 0);

  const handleMarkFulfilled = (id: string) => {
    setObligations(prev => prev.map(o => o.id === id ? { ...o, status: 'fulfilled', isEscalated: false } : o));
    notify('success', 'Obligation Fulfilled', 'Obligation status updated and recorded in CLM audit history.');
  };

  const handleDispatchEscalation = (obl: ContractObligation) => {
    setObligations(prev => prev.map(o => o.id === obl.id ? { 
      ...o, 
      isEscalated: true, 
      remindersSent: (o.remindersSent || 0) + 1,
      lastReminderAt: new Date().toISOString()
    } : o));

    notify(
      'ai', 
      'Escalation Dispatched', 
      `Sent automated high-priority SLA notice to ${obl.assignee} regarding ${obl.title}.`
    );
  };

  const handleRunAiInsight = () => {
    if (!aiQuery.trim()) return;
    setIsAnalyzing(true);
    setAiResponse(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      const q = aiQuery.toLowerCase();
      if (q.includes('renewal') || q.includes('opt-out') || q.includes('deadline')) {
        setAiResponse(`🔍 **AI Contract Analysis**: Found **2 active auto-renewal windows** in your portfolio. The most critical is the **NDA with Globex Corp.** requiring written non-renewal notice by **September 21, 2026** (60-day window). Failure to deliver notice will trigger automatic renewal through November 2028.`);
      } else if (q.includes('payment') || q.includes('financial') || q.includes('exposure')) {
        setAiResponse(`💰 **Financial Obligation Breakdown**: Total tracked commitment is **$${totalFinancialExposure.toLocaleString()}**. Largest upcoming milestone: **$125,000 for Cloud Services Agreement (Vance Capital)** due on October 15, 2026 upon SOC2 Type II delivery.`);
      } else {
        setAiResponse(`📋 **Portfolio Obligation Health**: **${totalActive} tracked covenants** across ${envelopes.length} contracts. **${atRiskCount} obligations are currently flagged at-risk** due to approaching notice deadlines. Automated escalation reminders have been queued for assigned stakeholders.`);
      }
    }, 800);
  };

  const handleCreateObligation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newObl: ContractObligation = {
      id: 'obl-' + generateUUID().slice(0, 6),
      envelopeId: envelopes[0]?.id || 'env-msa-8921',
      contractTitle: newContractTitle,
      counterparty: newCounterparty,
      type: newType,
      title: newTitle,
      description: `Tracked obligation created manually on ${new Date().toLocaleDateString()}.`,
      dueDate: new Date(newDueDate).toISOString(),
      noticeDeadline: new Date(new Date(newDueDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      assignee: newAssignee,
      financialValue: parseFloat(newFinancialValue) || 0,
      confidenceScore: 100,
      autoRenewal: newType === 'renewal_notice',
      renewalNoticeDays: 30,
      remindersSent: 0,
      isEscalated: false
    };

    setObligations([newObl, ...obligations]);
    setShowAddModal(false);
    setNewTitle('');
    notify('success', 'Obligation Created', 'New post-signing obligation added to tracker.');
  };

  const getTypeBadge = (type: ObligationType) => {
    switch (type) {
      case 'renewal_notice':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Auto-Renewal Notice</span>;
      case 'payment_milestone':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Payment Milestone</span>;
      case 'insurance_renewal':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Insurance COI</span>;
      case 'sla_performance':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">SLA Performance</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Deliverable</span>;
    }
  };

  const getStatusBadge = (status: ObligationStatus, isEscalated?: boolean) => {
    if (isEscalated) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
          <span>Escalated Notice</span>
        </span>
      );
    }

    switch (status) {
      case 'fulfilled':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Fulfilled ✓</span>;
      case 'at_risk':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">At Risk</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">In Progress</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Pending</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1520px] mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
              Obligation & Renewal AI Tracker
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>AI Post-Signing CLM</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Autonomous tracking of contract renewals, payment milestones, SLA guarantees, and compliance deliverables.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Track New Obligation</span>
          </button>
        </div>
      </div>

      {/* 4 Top Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Active Obligations</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-display">{totalActive}</p>
          <p className="text-[11px] text-emerald-600 font-medium">100% extracted from live seals</p>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Auto-Renewal Windows</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-display">{renewalsCount}</p>
          <p className="text-[11px] text-purple-600 font-medium">60-day notice alerts active</p>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">At-Risk Notice Deadlines</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 font-display">{atRiskCount}</p>
          <p className="text-[11px] text-rose-600 font-medium">Urgent action required &lt; 14 days</p>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Tracked Financial Value</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-display">
            ${totalFinancialExposure.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">Across active milestones & penalties</p>
        </div>
      </div>

      {/* AI Contract Intelligence Query Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs">
          <Sparkles className="w-4 h-4" />
          <span>Ask AI Legal Portfolio Copilot</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunAiInsight()}
            placeholder="e.g. Which vendor contracts have auto-renewal deadlines in the next 60 days?"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleRunAiInsight}
            disabled={isAnalyzing}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1.5 shrink-0"
          >
            {isAnalyzing ? (
              <span>Analyzing...</span>
            ) : (
              <>
                <span>Analyze</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {aiResponse && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed animate-in fade-in">
            <p>{aiResponse}</p>
          </div>
        )}
      </div>

      {/* Filters & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search obligations, counterparties, or assignees..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'renewals', label: 'Auto-Renewals' },
            { id: 'payments', label: 'Payments' },
            { id: 'deliverables', label: 'Deliverables' },
            { id: 'sla', label: 'SLA' },
            { id: 'at_risk', label: 'At Risk' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Obligations Matrix Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 font-medium bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Obligation / Agreement</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Notice Deadline / Due Date</th>
                <th className="py-3.5 px-4">Assignee</th>
                <th className="py-3.5 px-4">Value</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                    <p className="font-semibold text-slate-700">No matching obligations found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">All contractual commitments are in good standing.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((obl) => (
                  <tr key={obl.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900">{obl.title}</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {obl.contractTitle} <span className="text-slate-400">· {obl.counterparty}</span>
                        </p>
                        {obl.governingClause && (
                          <p className="text-[10px] text-indigo-600 font-mono">{obl.governingClause}</p>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {getTypeBadge(obl.type)}
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        {obl.noticeDeadline ? (
                          <div className="flex items-center space-x-1 text-rose-600 font-bold text-[11px]">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>Notice: {new Date(obl.noticeDeadline).toLocaleDateString()}</span>
                          </div>
                        ) : null}
                        <p className="text-[11px] text-slate-500">
                          Due: {new Date(obl.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-800">{obl.assignee}</p>
                      {obl.assigneeEmail && (
                        <p className="text-[10px] text-slate-400">{obl.assigneeEmail}</p>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap font-mono font-bold text-slate-900">
                      {obl.financialValue ? `$${obl.financialValue.toLocaleString()}` : '—'}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {getStatusBadge(obl.status, obl.isEscalated)}
                    </td>

                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        {obl.status !== 'fulfilled' && (
                          <button
                            onClick={() => handleMarkFulfilled(obl.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-[11px] transition-colors cursor-pointer"
                            title="Mark as Fulfilled"
                          >
                            Fulfilled ✓
                          </button>
                        )}

                        <button
                          onClick={() => handleDispatchEscalation(obl)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-[11px] transition-colors cursor-pointer flex items-center space-x-1"
                          title="Simulate Dispatching Escalation Alert to Stakeholders"
                        >
                          <Bell className="w-3 h-3" />
                          <span>Alert ({obl.remindersSent || 0})</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Obligation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-display">Track New Contract Obligation</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateObligation} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Obligation Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Annual SOC2 Type II Audit Delivery"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Contract Agreement</label>
                  <input
                    type="text"
                    value={newContractTitle}
                    onChange={(e) => setNewContractTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Counterparty</label>
                  <input
                    type="text"
                    value={newCounterparty}
                    onChange={(e) => setNewCounterparty(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Obligation Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ObligationType)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    <option value="renewal_notice">Auto-Renewal Notice</option>
                    <option value="payment_milestone">Payment Milestone</option>
                    <option value="deliverable">Deliverable</option>
                    <option value="sla_performance">SLA Performance</option>
                    <option value="insurance_renewal">Insurance Renewal</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Financial Value ($)</label>
                  <input
                    type="number"
                    value={newFinancialValue}
                    onChange={(e) => setNewFinancialValue(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Assignee</label>
                  <input
                    type="text"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Save Obligation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
