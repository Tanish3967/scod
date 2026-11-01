import React, { useState, useEffect } from 'react';
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
  Cloud,
  X,
  TrendingUp,
  BarChart3,
  BarChart2,
  Activity,
  Calendar,
  Zap,
  Download,
  CheckCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { downloadCsvFile, downloadJsonBundle } from '../../utils/downloadUtils';

type MetricGraphType = 'sent' | 'sealed' | 'pending' | 'turnaround' | 'funnel' | null;

export const DashboardOverview: React.FC = () => {
  const { setActiveView, setActiveEnvelopeId, prepareNewEnvelope, notify } = useSignFlow();
  const [funnelTimeRange, setFunnelTimeRange] = useState('This Week');
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedGraphModal, setSelectedGraphModal] = useState<MetricGraphType>(null);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Keyboard shortcut listener to close graph modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedGraphModal) {
        setSelectedGraphModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGraphModal]);

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

  const handleExportMetric = (type: MetricGraphType) => {
    const timestamp = new Date().toISOString().split('T')[0];
    if (type === 'sent') {
      downloadCsvFile(`signflow_envelopes_sent_${timestamp}.csv`, [
        ['Date', 'Envelopes Sent', 'Delivery Rate (%)', 'Primary Category'],
        ['2024-05-14', '142', '99.8', 'Mutual NDA'],
        ['2024-05-15', '188', '100.0', 'Master Services Agreement'],
        ['2024-05-16', '210', '99.5', 'Offer Letter'],
        ['2024-05-17', '195', '100.0', 'Vendor SOW'],
        ['2024-05-18', '240', '99.9', 'Commercial Lease'],
        ['2024-05-19', '138', '100.0', 'Board Resolution'],
        ['2024-05-20', '135', '100.0', 'Mutual NDA']
      ]);
      notify('success', 'Telemetry Exported', 'Downloaded 7-day envelopes sent CSV ledger.');
    } else if (type === 'sealed') {
      downloadCsvFile(`signflow_completed_sealed_${timestamp}.csv`, [
        ['Date', 'Completed & Sealed', 'Merkle Hash Verified', 'Avg Turnaround (hrs)'],
        ['2024-05-14', '118', '100% Validated', '3.1'],
        ['2024-05-15', '142', '100% Validated', '2.8'],
        ['2024-05-16', '165', '100% Validated', '3.6'],
        ['2024-05-17', '150', '100% Validated', '3.4'],
        ['2024-05-18', '180', '100% Validated', '3.2'],
        ['2024-05-19', '72', '100% Validated', '4.0'],
        ['2024-05-20', '65', '100% Validated', '3.4']
      ]);
      notify('success', 'Telemetry Exported', 'Downloaded sealed agreements CSV ledger.');
    } else if (type === 'pending') {
      downloadCsvFile(`signflow_pending_signatures_${timestamp}.csv`, [
        ['Envelope ID', 'Document Title', 'Recipient Role', 'Time Remaining', 'Priority'],
        ['ENV-8921', 'NDA – Acme & Globex Corp.', 'Receiving Party Signer', '2h 15m', 'Urgent'],
        ['ENV-8918', 'Vendor Onboarding Forms', 'Authorized Officer', '6h 30m', 'High'],
        ['ENV-8915', 'Executive Equity Grant', 'Board Signatory', '18h 00m', 'Medium'],
        ['ENV-8912', 'Software License Agreement', 'Technical Lead', '1d 04h', 'Normal'],
        ['ENV-8908', 'Data Processing Addendum', 'DPO Signer', '2d 10h', 'Normal'],
        ['ENV-8905', 'Commercial Property Lease', 'Tenant Representative', '3d 12h', 'Low'],
        ['ENV-8901', 'Independent Contractor Agreement', 'Contractor', '4d 08h', 'Low']
      ]);
      notify('success', 'Telemetry Exported', 'Downloaded pending signature queue CSV.');
    } else if (type === 'turnaround') {
      downloadCsvFile(`signflow_turnaround_times_${timestamp}.csv`, [
        ['Day', 'Median Turnaround (hrs)', 'Fastest (mins)', 'Slowest (hrs)', 'Industry Baseline (hrs)'],
        ['Day 1', '3.2', '14', '11.5', '24.0'],
        ['Day 2', '2.9', '18', '9.2', '24.0'],
        ['Day 3', '3.8', '22', '14.0', '24.0'],
        ['Day 4', '3.5', '16', '12.8', '24.0'],
        ['Day 5', '3.1', '12', '8.4', '24.0'],
        ['Day 6', '4.2', '35', '16.1', '24.0'],
        ['Day 7', '3.6', '19', '10.5', '24.0'],
        ['Day 8', '3.4', '18', '14.2', '24.0']
      ]);
      notify('success', 'Telemetry Exported', 'Downloaded turnaround distribution CSV.');
    } else if (type === 'funnel') {
      downloadCsvFile(`signflow_velocity_funnel_${timestamp}.csv`, [
        ['Stage', 'Count', 'Conversion Rate (%)', 'Drop-off (%)', 'Avg Stage Transit Time'],
        ['1. Sent', '1,248', '100.0', '0.0', 'Instant (< 1s)'],
        ['2. Delivered', '1,102', '88.3', '11.7', '4.2 mins'],
        ['3. Viewed', '876', '70.2', '18.1', '1.2 hrs'],
        ['4. Consent Accepted', '612', '49.0', '21.2', '45 mins'],
        ['5. Cryptographically Sealed', '492', '39.4', '9.6', '1.5 hrs']
      ]);
      notify('success', 'Telemetry Exported', 'Downloaded velocity funnel metrics CSV.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 max-w-[1520px] mx-auto space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display flex items-center space-x-2">
          <span>Welcome back, Tanish</span>
          <span className="text-2xl">👋</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-normal">
          Here's what's happening with your agreements today. Click any graph for detailed analytics.
        </p>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Envelopes Sent */}
        <div 
          onClick={() => setSelectedGraphModal('sent')}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between space-y-2.5 cursor-pointer group"
          title="Click to view full envelopes sent telemetry & breakdown"
        >
          <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <Send className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700 truncate" title="Total Envelopes Sent">
                Total Envelopes Sent
              </span>
            </div>
            <span className="text-[10px] text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-0.5">
              <span>View</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">1,248</p>
            {/* Sparkline Wave */}
            <div className="w-16 h-7 shrink-0 group-hover:scale-110 transition-transform">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" fill="none">
                <path
                  d="M 4 28 Q 25 10, 48 24 T 78 14 T 96 10"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="pt-0.5 flex items-center justify-between">
            <p className="text-[11px] text-emerald-600 font-medium whitespace-nowrap">
              ↑ 18.6% <span className="text-slate-400 font-normal">vs last 7 days</span>
            </p>
            <span className="text-[9.5px] text-slate-400 font-mono hidden sm:inline">7-day live</span>
          </div>
        </div>

        {/* Card 2: Completed & Sealed */}
        <div 
          onClick={() => setSelectedGraphModal('sealed')}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between space-y-2.5 cursor-pointer group"
          title="Click to view completion velocity & SHA-256 seal integrity"
        >
          <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700 truncate" title="Completed & Sealed">
                Completed & Sealed
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-0.5">
              <span>View</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">892</p>
            {/* Sparkline Wave */}
            <div className="w-16 h-7 shrink-0 group-hover:scale-110 transition-transform">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" fill="none">
                <path
                  d="M 4 28 Q 24 24, 45 12 T 74 20 T 96 8"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="pt-0.5 flex items-center justify-between">
            <p className="text-[11px] text-emerald-600 font-medium whitespace-nowrap">
              ↑ 24.3% <span className="text-slate-400 font-normal">Completion velocity</span>
            </p>
            <span className="text-[9.5px] text-emerald-600/80 font-mono hidden sm:inline">100% Sealed</span>
          </div>
        </div>

        {/* Card 3: Pending My Signature */}
        <div 
          onClick={() => setSelectedGraphModal('pending')}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-2.5 cursor-pointer group"
          title="Click to view all 7 pending envelopes requiring your signature"
        >
          <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700 truncate" title="Pending My Signature">
                Pending My Signature
              </span>
            </div>
            <span className="text-[10px] text-amber-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-0.5">
              <span>Sign Queue</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">7</p>
            {/* Sparkline Line */}
            <div className="w-16 h-7 shrink-0 group-hover:scale-110 transition-transform">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" fill="none">
                <path
                  d="M 4 24 L 22 22 L 42 14 L 60 26 L 78 16 L 96 12"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="pt-0.5 flex items-center justify-between">
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 text-[10px] font-semibold whitespace-nowrap">
              <Clock className="w-3 h-3" />
              <span>Due in 2h 15m</span>
            </span>
            <span className="text-[9.5px] text-amber-600 font-medium hidden sm:inline">1 Urgent</span>
          </div>
        </div>

        {/* Card 4: Median Turnaround Time */}
        <div 
          onClick={() => setSelectedGraphModal('turnaround')}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between space-y-2.5 cursor-pointer group"
          title="Click to view turnaround time distribution & industry benchmarks"
        >
          <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700 truncate" title="Median Turnaround Time">
                Median Turnaround Time
              </span>
            </div>
            <span className="text-[10px] text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-0.5">
              <span>Histogram</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">3.4 hrs</p>
            {/* Histogram Bars */}
            <div className="w-16 h-7 flex items-end justify-between px-0.5 shrink-0 gap-1 group-hover:scale-110 transition-transform">
              {[8, 14, 20, 15, 26, 17, 28, 22].map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${Math.round(h * 0.85)}px` }}
                  className={`w-1.5 rounded-full transition-all duration-200 ${
                    i === 7 
                      ? 'bg-indigo-600 shadow-2xs' 
                      : i >= 5 
                        ? 'bg-indigo-500 hover:bg-indigo-600' 
                        : 'bg-indigo-400 hover:bg-indigo-500'
                  }`}
                  title={`Day ${i + 1}: ${(h / 7).toFixed(1)} hrs`}
                />
              ))}
            </div>
          </div>

          <div className="pt-0.5 flex items-center justify-between">
            <p className="text-[11px] text-emerald-600 font-medium whitespace-nowrap">
              ↓ 8.7% <span className="text-slate-400 font-normal">vs last 7 days</span>
            </p>
            <span className="text-[9.5px] text-indigo-600 font-semibold hidden sm:inline">7x vs Adobe</span>
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

      {/* Main 2-Column Grid: Left (Table & Widgets) | Right (Funnel & Alerts) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Recent Envelopes Table Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
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

            <div className="w-full overflow-hidden">
              <table className="w-full text-left text-xs table-auto">
                <thead>
                  <tr className="text-[11px] font-medium text-slate-400 border-b border-slate-100">
                    <th className="pb-3 pr-2 font-normal">Envelope / ID</th>
                    <th className="pb-3 px-2 font-normal w-[95px]">Status</th>
                    <th className="pb-3 px-2 font-normal w-[70px]">Recipients</th>
                    <th className="pb-3 px-2 font-normal hidden md:table-cell w-[120px]">Created</th>
                    <th className="pb-3 pr-1 font-normal text-right w-[95px] sm:w-[110px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {recentEnvelopes.map((env) => (
                    <tr key={env.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Envelope & ID */}
                      <td className="py-3 pr-2 min-w-0">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono text-rose-500 bg-rose-50 border border-rose-100 shrink-0">
                            PDF
                          </span>
                          <div className="min-w-0 flex-1">
                            <p 
                              onClick={() => {
                                setActiveEnvelopeId(env.id);
                                setActiveView('prepare');
                              }}
                              className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer truncate max-w-[120px] sm:max-w-[180px] lg:max-w-[220px]"
                              title={env.title}
                            >
                              {env.title}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{env.code}</p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${env.statusClass}`}>
                          {env.status}
                        </span>
                      </td>

                      {/* Recipients Avatar Stack */}
                      <td className="py-3 px-2 whitespace-nowrap">
                        <div className="flex items-center -space-x-1.5">
                          {env.recipients.map((r, i) => (
                            <div
                              key={i}
                              title={r.name}
                              className={`w-5.5 h-5.5 rounded-full ${r.bg} font-bold text-[8.5px] flex items-center justify-center border-2 border-white shadow-2xs shrink-0`}
                            >
                              {r.initials}
                            </div>
                          ))}
                          {env.extraCount && (
                            <div className="w-5.5 h-5.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[8.5px] flex items-center justify-center border-2 border-white shrink-0">
                              {env.extraCount}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Created Timestamp */}
                      <td className="py-3 px-2 text-[11px] text-slate-500 whitespace-nowrap hidden md:table-cell">
                        {env.created}
                      </td>

                      {/* Actions */}
                      <td className="py-3 pr-1 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          {env.action === 'sign' && (
                            <button
                              onClick={() => {
                                setActiveEnvelopeId(env.id);
                                setActiveView('signing');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] transition-colors cursor-pointer shadow-2xs"
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
                              className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-[11px] transition-colors cursor-pointer shadow-2xs"
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
                              className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-[11px] transition-colors cursor-pointer shadow-2xs"
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
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer hidden sm:inline-flex"
                              title="Document Studio"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button 
                            onClick={() => notify('info', 'Options', `Opened context actions for ${env.code}`)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
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
          <div 
            onClick={() => setSelectedGraphModal('funnel')}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all space-y-4 cursor-pointer group"
            title="Click to explore detailed lifecycle conversion & funnel telemetry"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Velocity Funnel</h3>
                  <span className="text-[10px] text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-0.5">
                    <span>Deep Dive</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Agreement lifecycle conversion · Click for analytics</p>
              </div>
              <select
                value={funnelTimeRange}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  setFunnelTimeRange(e.target.value);
                  notify('info', 'Timeframe Updated', `Velocity Funnel recomputed for ${e.target.value}.`);
                }}
                className="text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 cursor-pointer focus:outline-none focus:border-indigo-500 transition-colors shadow-2xs"
              >
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
              </select>
            </div>

            <div className="space-y-3 pt-1">
              {((
                {
                  'This Week': [
                    { label: 'Sent', count: '340', percent: 100, dot: 'bg-indigo-600' },
                    { label: 'Delivered', count: '318', percent: 93.5, dot: 'bg-indigo-500' },
                    { label: 'Viewed', count: '284', percent: 83.5, dot: 'bg-indigo-400' },
                    { label: 'Consent Accepted', count: '210', percent: 61.8, dot: 'bg-purple-500' },
                    { label: 'Sealed', count: '186', percent: 54.7, dot: 'bg-emerald-500' }
                  ],
                  'This Month': [
                    { label: 'Sent', count: '1,248', percent: 100, dot: 'bg-indigo-600' },
                    { label: 'Delivered', count: '1,102', percent: 88.3, dot: 'bg-indigo-500' },
                    { label: 'Viewed', count: '876', percent: 70.2, dot: 'bg-indigo-400' },
                    { label: 'Consent Accepted', count: '612', percent: 49.0, dot: 'bg-purple-500' },
                    { label: 'Sealed', count: '492', percent: 39.4, dot: 'bg-emerald-500' }
                  ],
                  'Last 30 Days': [
                    { label: 'Sent', count: '1,420', percent: 100, dot: 'bg-indigo-600' },
                    { label: 'Delivered', count: '1,245', percent: 87.7, dot: 'bg-indigo-500' },
                    { label: 'Viewed', count: '992', percent: 69.9, dot: 'bg-indigo-400' },
                    { label: 'Consent Accepted', count: '718', percent: 50.6, dot: 'bg-purple-500' },
                    { label: 'Sealed', count: '580', percent: 40.8, dot: 'bg-emerald-500' }
                  ],
                  'Last 90 Days': [
                    { label: 'Sent', count: '4,180', percent: 100, dot: 'bg-indigo-600' },
                    { label: 'Delivered', count: '3,820', percent: 91.4, dot: 'bg-indigo-500' },
                    { label: 'Viewed', count: '3,110', percent: 74.4, dot: 'bg-indigo-400' },
                    { label: 'Consent Accepted', count: '2,450', percent: 58.6, dot: 'bg-purple-500' },
                    { label: 'Sealed', count: '2,090', percent: 50.0, dot: 'bg-emerald-500' }
                  ]
                } as Record<string, { label: string; count: string; percent: number; dot: string }[]>
              )[funnelTimeRange] || [
                { label: 'Sent', count: '1,248', percent: 100, dot: 'bg-indigo-600' },
                { label: 'Delivered', count: '1,102', percent: 88.3, dot: 'bg-indigo-500' },
                { label: 'Viewed', count: '876', percent: 70.2, dot: 'bg-indigo-400' },
                { label: 'Consent Accepted', count: '612', percent: 49.0, dot: 'bg-purple-500' },
                { label: 'Sealed', count: '492', percent: 39.4, dot: 'bg-emerald-500' }
              ]).map((item) => (
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

      {/* Interactive Metric & Graph Deep Dive Modal */}
      {selectedGraphModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
          onClick={() => setSelectedGraphModal(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col my-auto max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs ${
                  selectedGraphModal === 'sent' ? 'bg-indigo-600' :
                  selectedGraphModal === 'sealed' ? 'bg-emerald-600' :
                  selectedGraphModal === 'pending' ? 'bg-amber-500' :
                  selectedGraphModal === 'turnaround' ? 'bg-purple-600' : 'bg-indigo-700'
                }`}>
                  {selectedGraphModal === 'sent' && <Send className="w-5 h-5" />}
                  {selectedGraphModal === 'sealed' && <ShieldCheck className="w-5 h-5" />}
                  {selectedGraphModal === 'pending' && <User className="w-5 h-5" />}
                  {selectedGraphModal === 'turnaround' && <Clock className="w-5 h-5" />}
                  {selectedGraphModal === 'funnel' && <Zap className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {selectedGraphModal === 'sent' && 'Total Envelopes Sent — Telemetry & Trends'}
                    {selectedGraphModal === 'sealed' && 'Completed & Sealed — SHA-256 Ledger Analytics'}
                    {selectedGraphModal === 'pending' && 'Pending Signatures — Action Queue'}
                    {selectedGraphModal === 'turnaround' && 'Turnaround Time — Distribution & Benchmarks'}
                    {selectedGraphModal === 'funnel' && 'Velocity Funnel — Pipeline Conversion Analysis'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live operational telemetry and real-time ledger intelligence
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedGraphModal(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Switcher Tabs */}
            <div className="px-6 py-2.5 border-b border-slate-100 flex items-center space-x-2 bg-white overflow-x-auto text-xs font-semibold">
              {[
                { id: 'sent', label: '📨 Total Sent' },
                { id: 'sealed', label: '🛡️ Completed & Sealed' },
                { id: 'pending', label: '⏳ Pending Queue' },
                { id: 'turnaround', label: '⏱️ Turnaround Time' },
                { id: 'funnel', label: '⚡ Velocity Funnel' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedGraphModal(tab.id as MetricGraphType)}
                  className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 cursor-pointer ${
                    selectedGraphModal === tab.id
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* TAB 1: TOTAL SENT */}
              {selectedGraphModal === 'sent' && (
                <div className="space-y-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                      <p className="text-[11px] font-semibold text-indigo-700">Total Dispatched</p>
                      <p className="text-xl font-bold text-indigo-950 mt-1">1,248</p>
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">↑ 18.6% this week</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-600">Daily Average</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">178</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Envelopes/day</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-600">Peak Volume Day</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">240</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Friday, May 18</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-600">Delivery SLA</p>
                      <p className="text-xl font-bold text-emerald-600 mt-1">99.8%</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">100% TLS encryption</p>
                    </div>
                  </div>

                  {/* Interactive 7-Day Chart */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart2 className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold text-slate-900">7-Day Dispatch Velocity Curve</h4>
                      </div>
                      <span className="text-[11px] text-slate-400">Hover points for day values</span>
                    </div>

                    <div className="relative h-44 w-full bg-white rounded-xl border border-slate-200/60 p-3 flex flex-col justify-between">
                      {/* SVG Curve with interactive nodes */}
                      <svg className="w-full h-28 overflow-visible" viewBox="0 0 700 120" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Area Fill */}
                        <path
                          d="M 20 85 L 120 55 L 220 38 L 320 50 L 420 20 L 520 88 L 620 90 L 620 120 L 20 120 Z"
                          fill="url(#indigoGrad)"
                        />
                        {/* Stroke Line */}
                        <path
                          d="M 20 85 L 120 55 L 220 38 L 320 50 L 420 20 L 520 88 L 620 90"
                          stroke="#6366f1"
                          strokeWidth="3.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Interactive Data Dots */}
                        {[
                          { x: 20, y: 85, day: 'Mon', date: 'May 14', count: 142 },
                          { x: 120, y: 55, day: 'Tue', date: 'May 15', count: 188 },
                          { x: 220, y: 38, day: 'Wed', date: 'May 16', count: 210 },
                          { x: 320, y: 50, day: 'Thu', date: 'May 17', count: 195 },
                          { x: 420, y: 20, day: 'Fri', date: 'May 18', count: 240 },
                          { x: 520, y: 88, day: 'Sat', date: 'May 19', count: 138 },
                          { x: 620, y: 90, day: 'Sun', date: 'May 20', count: 135 }
                        ].map((pt, idx) => (
                          <g 
                            key={idx} 
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredPointIndex(idx)}
                            onMouseLeave={() => setHoveredPointIndex(null)}
                          >
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={hoveredPointIndex === idx ? '6' : '4.5'}
                              fill="#6366f1"
                              stroke="#ffffff"
                              strokeWidth="2"
                              className="transition-all"
                            />
                            {hoveredPointIndex === idx && (
                              <g>
                                <rect
                                  x={pt.x - 45}
                                  y={pt.y - 38}
                                  width="90"
                                  height="30"
                                  rx="8"
                                  fill="#1e293b"
                                />
                                <text
                                  x={pt.x}
                                  y={pt.y - 20}
                                  fill="#ffffff"
                                  fontSize="11"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                >
                                  {pt.count} sent
                                </text>
                              </g>
                            )}
                          </g>
                        ))}
                      </svg>

                      {/* X-Axis Labels */}
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500 pt-1 border-t border-slate-100">
                        {['Mon (142)', 'Tue (188)', 'Wed (210)', 'Thu (195)', 'Fri (240)', 'Sat (138)', 'Sun (135)'].map((lbl) => (
                          <span key={lbl}>{lbl}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Document Category Breakdown */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">Envelopes by Document Category</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { name: 'Mutual NDAs', count: '524', pct: '42%', color: 'bg-indigo-600' },
                        { name: 'Master Services (MSA)', count: '349', pct: '28%', color: 'bg-purple-600' },
                        { name: 'Executive Offer Letters', count: '225', pct: '18%', color: 'bg-emerald-600' },
                        { name: 'Vendor SOWs & Addenda', count: '150', pct: '12%', color: 'bg-amber-600' }
                      ].map((cat) => (
                        <div key={cat.name} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
                          <div className="flex items-center space-x-1.5">
                            <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                            <p className="text-[11px] font-bold text-slate-800 truncate">{cat.name}</p>
                          </div>
                          <p className="text-xs font-bold text-slate-900 mt-1">{cat.count} <span className="text-[10px] text-slate-400 font-normal">({cat.pct})</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COMPLETED & SEALED */}
              {selectedGraphModal === 'sealed' && (
                <div className="space-y-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                      <p className="text-[11px] font-semibold text-emerald-700">Total Sealed</p>
                      <p className="text-xl font-bold text-emerald-950 mt-1">892</p>
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">↑ 24.3% velocity</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-600">Merkle Integrity</p>
                      <p className="text-xl font-bold text-emerald-600 mt-1">100%</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Zero tampering alerts</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-600">QES / eIDAS Tier 3</p>
                      <p className="text-xl font-bold text-indigo-600 mt-1">642</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">TSP qualified certs</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-600">Avg Time to Seal</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">3.4 hrs</p>
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">86% faster than avg</p>
                    </div>
                  </div>

                  {/* Cryptographic Ledger Summary */}
                  <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Cryptographic SHA-256 Ledger Status</h4>
                          <p className="text-[10px] text-slate-500">Every completion event is anchored to the immutable Merkle chain</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ✓ CHAIN VALIDATED
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-emerald-100 font-mono text-[10px] text-slate-600 space-y-1">
                      <p className="truncate"><span className="text-slate-400 font-sans font-semibold">Latest Root Hash:</span> 0x9f83a41e97c6d5b882310fa47c09312e8bfa398d27a149021</p>
                      <p><span className="text-slate-400 font-sans font-semibold">Ledger Blocks:</span> 892 Anchors · 0 Tamper Invocations · 100% Certificate Integrity</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-slate-500">Need to audit an agreement certificate?</p>
                    <button
                      onClick={() => {
                        setSelectedGraphModal(null);
                        setActiveEnvelopeId('env-ron-7109');
                        setActiveView('certificate');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Inspect Latest Certificate →
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: PENDING QUEUE */}
              {selectedGraphModal === 'pending' && (
                <div className="space-y-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                      <p className="text-[11px] font-semibold text-amber-700">Awaiting Signature</p>
                      <p className="text-xl font-bold text-amber-950 mt-1">7</p>
                      <p className="text-[10px] text-amber-600 font-medium mt-0.5">1 Urgent SLA</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-600">Shortest Expiration</p>
                      <p className="text-xl font-bold text-rose-600 mt-1">2h 15m</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Acme NDA</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-600">Auth Factors</p>
                      <p className="text-xl font-bold text-indigo-600 mt-1">Passkey</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">FIDO2 / SMS OTP</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-600">Average Turnaround</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">1.8 hrs</p>
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">On-time rate 98%</p>
                    </div>
                  </div>

                  {/* Actionable Queue Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">Envelopes Requiring Action</h4>
                    <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
                      {[
                        { id: 'env-msa-8921', code: '#ENV-8921', title: 'NDA – Acme & Globex Corp.', due: '2h 15m left', urgent: true },
                        { id: 'env-msa-8921-2', code: '#ENV-8918', title: 'Vendor Onboarding Forms', due: '6h 30m left', urgent: false },
                        { id: 'env-qes-9941', code: '#ENV-8919', title: 'Sales Contract – Q2 Deal', due: '1d 04h left', urgent: false }
                      ].map((doc) => (
                        <div key={doc.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                          <div className="min-w-0 pr-3">
                            <p className="text-xs font-bold text-slate-900 truncate">{doc.title}</p>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">{doc.code}</span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                doc.urgent ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                                {doc.due}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedGraphModal(null);
                              setActiveEnvelopeId(doc.id);
                              setActiveView('signing');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs shrink-0"
                          >
                            Sign Now →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TURNAROUND TIME */}
              {selectedGraphModal === 'turnaround' && (
                <div className="space-y-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100">
                      <p className="text-[11px] font-semibold text-purple-700">Median Turnaround</p>
                      <p className="text-xl font-bold text-purple-950 mt-1">3.4 hrs</p>
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">↓ 8.7% vs last 7 days</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-600">Fastest Signing</p>
                      <p className="text-xl font-bold text-emerald-600 mt-1">18 mins</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Executive NDA</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-600">Industry Average</p>
                      <p className="text-xl font-bold text-slate-400 line-through mt-1">24.0 hrs</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">DocuSign baseline</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-600">Velocity Advantage</p>
                      <p className="text-xl font-bold text-indigo-600 mt-1">7.0x</p>
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">86% time saved</p>
                    </div>
                  </div>

                  {/* Interactive 8-Day Bar Breakdown */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900">8-Day Turnaround Distribution (Hours)</h4>
                    <div className="grid grid-cols-8 gap-2 pt-4 items-end h-32 bg-white rounded-xl border border-slate-200/60 p-3">
                      {[
                        { day: 'D1', val: 3.2, h: '45%' },
                        { day: 'D2', val: 2.9, h: '40%' },
                        { day: 'D3', val: 3.8, h: '55%' },
                        { day: 'D4', val: 3.5, h: '50%' },
                        { day: 'D5', val: 3.1, h: '42%' },
                        { day: 'D6', val: 4.2, h: '65%' },
                        { day: 'D7', val: 3.6, h: '52%' },
                        { day: 'D8 (Today)', val: 3.4, h: '48%', today: true }
                      ].map((bar, i) => (
                        <div key={i} className="flex flex-col items-center space-y-1.5 group cursor-pointer">
                          <span className="text-[9.5px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            {bar.val}h
                          </span>
                          <div 
                            style={{ height: bar.h }} 
                            className={`w-full rounded-lg transition-all ${
                              bar.today ? 'bg-indigo-600 shadow-xs' : 'bg-indigo-300 hover:bg-indigo-500'
                            }`} 
                          />
                          <span className="text-[9.5px] font-medium text-slate-400">{bar.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: VELOCITY FUNNEL */}
              {selectedGraphModal === 'funnel' && (
                <div className="space-y-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                      <p className="text-[11px] font-semibold text-indigo-700">Funnel Conversion</p>
                      <p className="text-xl font-bold text-indigo-950 mt-1">39.4%</p>
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">End-to-end completion</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-600">Delivered Rate</p>
                      <p className="text-xl font-bold text-indigo-600 mt-1">88.3%</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">1,102 agreements</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-600">Viewed Rate</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">70.2%</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">876 agreements</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-600">Consent Accepted</p>
                      <p className="text-xl font-bold text-purple-600 mt-1">49.0%</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">612 agreements</p>
                    </div>
                  </div>

                  {/* Stage-by-Stage Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900">Conversion Waterfall & Stage Transit Time</h4>
                    <div className="space-y-2">
                      {[
                        { stage: '1. Sent to Recipients', count: '1,248', pct: 100, drop: '0.0%', transit: '< 1s', color: 'bg-indigo-600' },
                        { stage: '2. Email / SMS Delivered', count: '1,102', pct: 88.3, drop: '-11.7%', transit: '4.2m', color: 'bg-indigo-500' },
                        { stage: '3. Opened & Viewed by Signer', count: '876', pct: 70.2, drop: '-18.1%', transit: '1.2h', color: 'bg-indigo-400' },
                        { stage: '4. Legal Consent Accepted', count: '612', pct: 49.0, drop: '-21.2%', transit: '45m', color: 'bg-purple-500' },
                        { stage: '5. Cryptographically Sealed & Finished', count: '492', pct: 39.4, drop: '-9.6%', transit: '1.5h', color: 'bg-emerald-500' }
                      ].map((step) => (
                        <div key={step.stage} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2 font-bold text-slate-800">
                              <span className={`w-2.5 h-2.5 rounded-full ${step.color}`} />
                              <span>{step.stage}</span>
                            </div>
                            <div className="flex items-center space-x-3 font-mono text-[11px]">
                              <span className="font-bold text-slate-900">{step.count} ({step.pct}%)</span>
                              <span className="text-rose-500 font-semibold">{step.drop}</span>
                              <span className="text-slate-400">{step.transit}</span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div style={{ width: `${step.pct}%` }} className={`h-full ${step.color} rounded-full`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Recommendation Alert */}
                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex items-start space-x-3">
                    <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-purple-950">AI Velocity Recommendation</h5>
                      <p className="text-[11px] text-purple-800 mt-0.5 leading-snug">
                        The highest drop-off occurs between <strong>Opened & Viewed</strong> and <strong>Legal Consent</strong> (-21.2%). Enabling automated SMS OTP reminders typically recovers +14% signing velocity within 2 hours.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
              <button
                onClick={() => handleExportMetric(selectedGraphModal)}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center space-x-2 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export CSV Telemetry</span>
              </button>

              <button
                onClick={() => setSelectedGraphModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Close & Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
