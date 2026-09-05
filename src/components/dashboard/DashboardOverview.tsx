import React, { useState } from 'react';
import { 
  Send, 
  ShieldCheck, 
  User, 
  Clock, 
  Plus, 
  Sparkles, 
  FileText, 
  Video, 
  MoreHorizontal, 
  ArrowRight, 
  ChevronDown, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  Database,
  Cloud
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

export const DashboardOverview: React.FC = () => {
  const { setActiveView, setActiveEnvelopeId, prepareNewEnvelope, notify } = useSignFlow();
  const [funnelTimeRange, setFunnelTimeRange] = useState('This Week');
  const [aiPrompt, setAiPrompt] = useState('');

  const recentEnvelopes = [
    {
      id: 'env-msa-8921',
      code: '#ENV-8921',
      title: 'NDA – Acme & Globex Corp.',
      status: 'In Progress',
      statusClass: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      recipients: [
        { name: 'John Smith', initials: 'JS', bg: 'bg-indigo-600 text-white' },
        { name: 'Alice Morgan', initials: 'AM', bg: 'bg-indigo-500 text-white' }
      ],
      extraCount: '+2',
      created: 'May 20, 2024 10:42 AM',
      hasDocumentIcon: true,
      action: 'sign'
    },
    {
      id: 'env-ron-7109',
      code: '#ENV-8920',
      title: 'MSA – Service Agreement',
      status: 'Completed',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      recipients: [
        { name: 'Robert King', initials: 'RK', bg: 'bg-slate-700 text-white' },
        { name: 'Diana Prince', initials: 'DP', bg: 'bg-slate-600 text-white' }
      ],
      extraCount: null,
      created: 'May 19, 2024 04:15 PM',
      hasDocumentIcon: false,
      action: 'certificate'
    },
    {
      id: 'env-qes-9941',
      code: '#ENV-8919',
      title: 'Sales Contract – Q2 Deal',
      status: 'Draft',
      statusClass: 'bg-slate-100 text-slate-700 border-slate-200',
      recipients: [
        { name: 'Tom Clark', initials: 'TC', bg: 'bg-slate-500 text-white' }
      ],
      extraCount: '+1',
      created: 'May 19, 2024 11:09 AM',
      hasDocumentIcon: false,
      action: 'edit'
    },
    {
      id: 'env-msa-8921-2',
      code: '#ENV-8918',
      title: 'Vendor Onboarding Forms',
      status: 'In Progress',
      statusClass: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      recipients: [
        { name: 'Alexander Hayes', initials: 'AH', bg: 'bg-purple-600 text-white' },
        { name: 'Nina Patel', initials: 'NP', bg: 'bg-purple-500 text-white' }
      ],
      extraCount: '+1',
      created: 'May 18, 2024 09:33 AM',
      hasDocumentIcon: true,
      action: 'sign'
    },
    {
      id: 'env-ron-7109-2',
      code: '#ENV-8917',
      title: 'Employment Offer – Dev Team',
      status: 'Completed',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      recipients: [
        { name: 'Peter Parker', initials: 'PK', bg: 'bg-emerald-700 text-white' }
      ],
      extraCount: null,
      created: 'May 17, 2024 05:20 PM',
      hasDocumentIcon: false,
      action: 'certificate'
    }
  ];

  const handleAiAsk = (query?: string) => {
    const textToAsk = query || aiPrompt;
    if (!textToAsk.trim()) return;
    notify('ai', 'AI Assistant Analyzing', `Query: "${textToAsk}"`);
    setActiveView('ai-hub');
  };

  return (
    <div className="p-8 max-w-[1520px] mx-auto space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display flex items-center space-x-2">
          <span>Welcome back, Tanish</span>
          <span className="text-2xl">👋</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-normal">
          Here's what's happening with your agreements today.
        </p>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Envelopes Sent */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Send className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Total Envelopes Sent</span>
          </div>

          <div className="flex items-end justify-between pt-1">
            <div>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">1,248</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                ↑ 18.6% <span className="text-slate-400 font-normal">vs last 7 days</span>
              </p>
            </div>

            {/* Live Sparkline Wave SVG */}
            <div className="w-24 h-10">
              <svg className="w-full h-full" viewBox="0 0 100 40" fill="none">
                <path
                  d="M0 30 Q 15 10, 30 25 T 60 15 T 85 28 T 100 8"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Completed & Sealed */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Completed & Sealed</span>
          </div>

          <div className="flex items-end justify-between pt-1">
            <div>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">892</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                ↑ 24.3% <span className="text-slate-400 font-normal">Completion velocity</span>
              </p>
            </div>

            {/* Sparkline Wave SVG */}
            <div className="w-24 h-10">
              <svg className="w-full h-full" viewBox="0 0 100 40" fill="none">
                <path
                  d="M0 32 Q 20 28, 35 15 T 65 22 T 85 8 T 100 12"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Pending My Signature */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Pending My Signature</span>
          </div>

          <div className="flex items-end justify-between pt-1">
            <div>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">7</p>
              <div className="mt-1">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 text-[10px] font-semibold">
                  <Clock className="w-3 h-3" />
                  <span>Due in 2h 15m</span>
                </span>
              </div>
            </div>

            {/* Sparkline Wave SVG */}
            <div className="w-24 h-10">
              <svg className="w-full h-full" viewBox="0 0 100 40" fill="none">
                <path
                  d="M0 25 L 20 25 L 35 15 L 50 30 L 65 18 L 80 22 L 100 10"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 4: Median Turnaround Time */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Median Turnaround Time</span>
          </div>

          <div className="flex items-end justify-between pt-1">
            <div>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">3.4 hrs</p>
              <p className="text-[11px] text-indigo-600 font-medium mt-1">
                ↓ 8.7% <span className="text-slate-400 font-normal">vs last 7 days</span>
              </p>
            </div>

            {/* Histogram Bar Chart SVG */}
            <div className="w-24 h-10 flex items-end justify-between px-1">
              {[8, 14, 22, 16, 28, 18, 32, 24, 30].map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}px` }}
                  className="w-1.5 bg-indigo-200 hover:bg-indigo-400 rounded-xs transition-colors"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Action Shortcut Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Shortcut 1 */}
        <button
          onClick={prepareNewEnvelope}
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all text-left flex items-center space-x-3 group shadow-2xs cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">New Agreement</p>
            <p className="text-[10px] text-slate-400">Start from scratch</p>
          </div>
        </button>

        {/* Shortcut 2 */}
        <button
          onClick={() => setActiveView('ai-hub')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/20 transition-all text-left flex items-center space-x-3 group shadow-2xs cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">AI Contract Drafter</p>
            <p className="text-[10px] text-slate-400">Generate with AI</p>
          </div>
        </button>

        {/* Shortcut 3 */}
        <button
          onClick={() => setActiveView('ai-hub')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/20 transition-all text-left flex items-center space-x-3 group shadow-2xs cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Run Risk Review</p>
            <p className="text-[10px] text-slate-400">AI risk analysis</p>
          </div>
        </button>

        {/* Shortcut 4 */}
        <button
          onClick={() => setActiveView('notary')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all text-left flex items-center space-x-3 group shadow-2xs cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Remote Notary Session</p>
            <p className="text-[10px] text-slate-400">Start RON now</p>
          </div>
        </button>
      </div>

      {/* Main 2-Column Grid: Left 2/3 (Table & Widgets) | Right 1/3 (Funnel & Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3 Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Envelopes Table Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-bold text-slate-900">Recent Envelopes</h3>
              <button
                onClick={() => setActiveView('envelopes')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
              >
                <span>View all envelopes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[11px] font-medium text-slate-400 border-b border-slate-100">
                    <th className="pb-3 font-normal">Envelope / ID</th>
                    <th className="pb-3 font-normal">Status</th>
                    <th className="pb-3 font-normal">Recipients</th>
                    <th className="pb-3 font-normal">Created</th>
                    <th className="pb-3 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {recentEnvelopes.map((env) => (
                    <tr key={env.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Envelope & ID */}
                      <td className="py-3.5">
                        <div className="flex items-center space-x-3">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono text-rose-500 bg-rose-50 border border-rose-100">
                            PDF
                          </span>
                          <div>
                            <p 
                              onClick={() => {
                                setActiveEnvelopeId(env.id);
                                setActiveView('prepare');
                              }}
                              className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                            >
                              {env.title}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">{env.code}</p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${env.statusClass}`}>
                          {env.status}
                        </span>
                      </td>

                      {/* Recipients Avatar Stack */}
                      <td className="py-3.5">
                        <div className="flex items-center -space-x-1.5">
                          {env.recipients.map((r, i) => (
                            <div
                              key={i}
                              title={r.name}
                              className={`w-6 h-6 rounded-full ${r.bg} font-bold text-[9px] flex items-center justify-center border-2 border-white shadow-2xs`}
                            >
                              {r.initials}
                            </div>
                          ))}
                          {env.extraCount && (
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-[9px] flex items-center justify-center border-2 border-white">
                              {env.extraCount}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Created Timestamp */}
                      <td className="py-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                        {env.created}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {env.action === 'sign' && (
                            <button
                              onClick={() => {
                                setActiveEnvelopeId(env.id);
                                setActiveView('signing');
                              }}
                              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              Sign
                            </button>
                          )}

                          {env.action === 'certificate' && (
                            <button
                              onClick={() => {
                                setActiveEnvelopeId(env.id);
                                setActiveView('certificate');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-[11px] transition-colors cursor-pointer"
                            >
                              Certificate
                            </button>
                          )}

                          {env.action === 'edit' && (
                            <button
                              onClick={() => {
                                setActiveEnvelopeId(env.id);
                                setActiveView('prepare');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-[11px] transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                          )}

                          {env.hasDocumentIcon && (
                            <button 
                              onClick={() => {
                                setActiveEnvelopeId(env.id);
                                setActiveView('prepare');
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              title="Document Studio"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button 
                            onClick={() => notify('info', 'Options', `Opened context actions for ${env.code}`)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-center border-t border-slate-100">
              <button
                onClick={() => setActiveView('envelopes')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                View all envelopes →
              </button>
            </div>
          </div>

          {/* Bottom Row Grid: Quick Integrations + AI Assistant (BETA) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Integrations */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Quick Integrations</h4>
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[
                    { name: 'Salesforce', color: 'text-sky-600' },
                    { name: 'Google Drive', color: 'text-emerald-600' },
                    { name: 'Dropbox', color: 'text-blue-600' },
                    { name: 'OneDrive', color: 'text-indigo-600' }
                  ].map((intg) => (
                    <div key={intg.name} className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
                      <Cloud className={`w-4 h-4 mx-auto ${intg.color}`} />
                      <p className="text-[10px] font-bold text-slate-800 truncate">{intg.name}</p>
                      <p className="text-[9px] text-emerald-600 font-medium">● Connected</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveView('crm-sync')}
                  className="w-full py-1.5 px-3 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  Manage Integrations
                </button>
              </div>
            </div>

            {/* AI Assistant BETA */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-xs font-bold text-slate-900">AI Assistant</h4>
                  <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[9px] font-bold font-mono">
                    BETA
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ask anything about your agreements, risks, or clauses.
                </p>

                {/* Input Prompt Box */}
                <div className="relative mt-2.5">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAiAsk();
                    }}
                    placeholder="Ask AI Assistant..."
                    className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleAiAsk()}
                    className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Prompt Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Summarize this contract',
                  'Find risky clauses',
                  'Compare agreements'
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleAiAsk(chip)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-[10px] font-medium border border-indigo-100 transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1/3 Column: Velocity Funnel & AI Risk Alerts */}
        <div className="space-y-6">
          {/* Velocity Funnel Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Velocity Funnel</h3>
              <select
                value={funnelTimeRange}
                onChange={(e) => setFunnelTimeRange(e.target.value)}
                className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-none"
              >
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Last 30 Days">Last 30 Days</option>
              </select>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { label: 'Sent', count: '1,248', percent: 100, dot: 'bg-indigo-600' },
                { label: 'Delivered', count: '1,102', percent: 88.3, dot: 'bg-indigo-500' },
                { label: 'Viewed', count: '876', percent: 70.2, dot: 'bg-indigo-400' },
                { label: 'Consent Accepted', count: '612', percent: 49.0, dot: 'bg-purple-500' },
                { label: 'Sealed', count: '492', percent: 39.4, dot: 'bg-emerald-500' }
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                      <span className="font-medium text-slate-700">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2 font-mono text-[11px]">
                      <span className="font-bold text-slate-900">{item.count}</span>
                      <span className="text-slate-400 w-10 text-right">{item.percent}%</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${item.percent}%` }}
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Risk Alerts Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">AI Risk Alerts</h3>
              <button
                onClick={() => setActiveView('ai-hub')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Alert 1: Red */}
              <div 
                onClick={() => setActiveView('ai-hub')}
                className="p-3 rounded-xl bg-rose-50/60 border border-rose-100/90 hover:bg-rose-50 transition-colors flex items-start space-x-3 cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600 shrink-0 mt-0.5">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900">High Risk Clause Detected</p>
                    <span className="text-[10px] text-slate-400 font-mono">2h ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Indemnification clause is one-sided.
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                    ENV-8921 · NDA – Acme & Globex
                  </p>
                </div>
              </div>

              {/* Alert 2: Amber */}
              <div 
                onClick={() => setActiveView('ai-hub')}
                className="p-3 rounded-xl bg-amber-50/60 border border-amber-100/90 hover:bg-amber-50 transition-colors flex items-start space-x-3 cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900">Missing Compliance Field</p>
                    <span className="text-[10px] text-slate-400 font-mono">5h ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Data Processing Agreement is missing.
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                    ENV-8919 · Sales Contract – Q2 Deal
                  </p>
                </div>
              </div>

              {/* Alert 3: Orange Clock */}
              <div 
                onClick={() => setActiveView('ai-hub')}
                className="p-3 rounded-xl bg-orange-50/60 border border-orange-100/90 hover:bg-orange-50 transition-colors flex items-start space-x-3 cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900">Expiring Soon</p>
                    <span className="text-[10px] text-slate-400 font-mono">1d ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    This agreement expires in 5 days.
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                    ENV-8903 · Service Agreement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
