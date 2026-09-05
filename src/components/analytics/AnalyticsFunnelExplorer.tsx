import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  Download, 
  FileText, 
  CheckCircle2, 
  ArrowUpRight, 
  Filter, 
  Layers, 
  FileSpreadsheet, 
  Code, 
  Printer, 
  Copy, 
  Check, 
  Eye, 
  X 
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { downloadCsvFile, downloadJsonBundle, generateCsvString } from '../../utils/downloadUtils';

export const AnalyticsFunnelExplorer: React.FC = () => {
  const { notify } = useSignFlow();
  const [timeRange, setTimeRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const handleTimeRangeChange = (val: string) => {
    setIsRefreshing(true);
    setTimeRange(val);
    setTimeout(() => setIsRefreshing(false), 200);
  };

  const funnelStages = [
    { order: 1, stage: 'Envelopes Sent', count: timeRange === '7d' ? 340 : timeRange === '90d' ? 4180 : 1420, percent: 100, color: 'bg-indigo-600', dropoff: '0.0%' },
    { order: 2, stage: 'Email Delivered', count: timeRange === '7d' ? 335 : timeRange === '90d' ? 4095 : 1394, percent: 98.2, color: 'bg-indigo-500', dropoff: '-1.8%' },
    { order: 3, stage: 'Document Viewed', count: timeRange === '7d' ? 312 : timeRange === '90d' ? 3820 : 1298, percent: 91.4, color: 'bg-indigo-400', dropoff: '-6.8%' },
    { order: 4, stage: 'Consent Accepted', count: timeRange === '7d' ? 304 : timeRange === '90d' ? 3716 : 1262, percent: 88.9, color: 'bg-purple-500', dropoff: '-2.5%' },
    { order: 5, stage: 'Signed & Sealed', count: timeRange === '7d' ? 292 : timeRange === '90d' ? 3570 : 1213, percent: 85.4, color: 'bg-emerald-500', dropoff: '-3.5%' },
  ];

  const departmentMetrics = [
    { name: 'Enterprise Sales', medianTime: '3.4 hrs', completionRate: '92.1%', count: timeRange === '7d' ? 130 : 540, trend: '+6.2%' },
    { name: 'Legal & Procurement', medianTime: '8.1 hrs', completionRate: '88.4%', count: timeRange === '7d' ? 75 : 320, trend: '+4.1%' },
    { name: 'HR & People Ops', medianTime: '1.2 hrs', completionRate: '96.8%', count: timeRange === '7d' ? 95 : 410, trend: '+8.9%' },
    { name: 'Real Estate & Notary', medianTime: '14.5 hrs', completionRate: '78.2%', count: timeRange === '7d' ? 40 : 150, trend: '+2.0%' }
  ];

  const getCsvDataRows = (): (string | number)[][] => {
    const dateStamp = new Date().toISOString().split('T')[0];
    return [
      ['Report_Section', 'Item_Name', 'Metric_Value', 'Metric_Unit', 'Envelope_Count', 'Performance_Rate', 'Trend_Or_Dropoff', 'Time_Range', 'Export_Date'],
      ...departmentMetrics.map(d => [
        'Department_Velocity',
        d.name,
        d.medianTime.replace(' hrs', ''),
        'hours',
        d.count,
        d.completionRate,
        d.trend,
        timeRange,
        dateStamp
      ]),
      ...funnelStages.map(f => [
        'Funnel_Lifecycle',
        f.stage,
        f.percent,
        'percent',
        f.count,
        `${f.percent}%`,
        f.dropoff,
        timeRange,
        dateStamp
      ])
    ];
  };

  const handleExportCsv = () => {
    const dateStamp = new Date().toISOString().split('T')[0];
    const csvRows = getCsvDataRows();
    const filename = `SignFlow-Agreement-Velocity-${timeRange}-${dateStamp}.csv`;
    downloadCsvFile(filename, csvRows);
    notify('success', 'CSV Download Started', `Saved "${filename}" (RFC-4180 format with UTF-8 BOM).`);
  };

  const handleExportJson = () => {
    const dateStamp = new Date().toISOString().split('T')[0];
    const payload = {
      reportType: 'SignFlow Agreement Velocity & Funnel Analytics',
      generatedAt: new Date().toISOString(),
      timeRange,
      overallConversionRate: '85.4%',
      departmentMetrics,
      funnelStages
    };
    const filename = `SignFlow-Analytics-Dataset-${timeRange}-${dateStamp}.json`;
    downloadJsonBundle(filename, payload);
    notify('success', 'JSON Download Started', `Saved "${filename}"`);
  };

  const rawCsvString = generateCsvString(getCsvDataRows());

  const handleCopyRawCsv = () => {
    navigator.clipboard.writeText(rawCsvString);
    setHasCopied(true);
    notify('success', 'Copied to Clipboard', 'Raw CSV text copied to clipboard.');
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600">
            <BarChart3 className="w-5 h-5" />
            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">
              Agreement Velocity & Completion Funnel Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Turnaround time distributions, signer drop-off funnels, and department velocity leaderboards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-indigo-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last Quarter (Q3)</option>
            <option value="1y">Year to Date (2026)</option>
          </select>

          {/* 1-Click Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            title="Download standard .csv spreadsheet for Excel/Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download CSV (.csv)</span>
          </button>

          {/* Preview & Copy CSV Modal Trigger */}
          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer"
            title="View & copy raw CSV text directly"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Preview / Copy CSV</span>
          </button>

          {/* Export JSON Button */}
          <button
            onClick={handleExportJson}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer"
            title="Download structured .json dataset"
          >
            <Code className="w-3.5 h-3.5 text-indigo-600" />
            <span>JSON (.json)</span>
          </button>
        </div>
      </div>

      {/* Completion Rate Funnel */}
      <div className={`p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 transition-all duration-200 ${isRefreshing ? 'opacity-60 scale-[0.995]' : 'opacity-100 scale-100'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Envelope Lifecycle Drop-off Funnel</h3>
            <p className="text-xs text-slate-400 mt-0.5">End-to-end progression from dispatch to cryptographic completion</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
            Overall Conversion: 85.4%
          </span>
        </div>

        <div className="space-y-3.5 pt-2">
          {funnelStages.map(stage => (
            <div key={stage.stage} className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800">{stage.order}. {stage.stage}</span>
                </div>
                <div className="flex items-center space-x-3 font-mono text-[11px]">
                  <span className="text-slate-500">{stage.count} envelopes</span>
                  <span className="text-slate-900 font-bold">{stage.percent}%</span>
                  <span className="text-[10px] text-rose-500 font-semibold">{stage.dropoff}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${stage.percent}%` }}
                  className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Turnaround Time by Team / Department</h3>
          <p className="text-xs text-slate-400 mt-0.5">Team-level velocity comparison and signature completion rates</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departmentMetrics.map(dept => (
            <div
              key={dept.name}
              className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2.5 text-xs hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 truncate">{dept.name}</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  {dept.trend}
                </span>
              </div>

              <div className="flex items-baseline space-x-2 pt-1">
                <span className="text-2xl font-display font-bold text-indigo-600">{dept.medianTime}</span>
                <span className="text-[10px] text-slate-400 font-mono">Median Time</span>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex justify-between text-[11px] text-slate-500">
                <span>Completion Rate:</span>
                <span className="text-slate-900 font-bold">{dept.completionRate}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Total Envelopes:</span>
                <span className="text-slate-900 font-mono font-semibold">{dept.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw CSV Preview & Copy Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 font-display">
                  CSV Report Content Preview
                </h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Below is the raw RFC-4180 comma-separated data stream that is downloaded as a <strong>.csv</strong> file.
            </p>

            {/* Monospace Code Box */}
            <div className="flex-1 bg-slate-950 rounded-xl p-4 overflow-auto font-mono text-[11px] text-emerald-400 leading-relaxed border border-slate-800">
              <pre className="whitespace-pre-wrap">{rawCsvString.replace('\uFEFF', '')}</pre>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 font-mono">
                Format: UTF-8 BOM • RFC-4180 Table
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyRawCsv}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy CSV</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    handleExportCsv();
                    setShowPreviewModal(false);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .csv File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
