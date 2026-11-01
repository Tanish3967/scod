import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RefreshCw, 
  FileText, 
  Sliders
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { analyzeDocumentRisk } from '../../utils/aiEngine';
import { AIRiskAnalysis } from '../../types/signflow';

export const AIRiskScanner: React.FC = () => {
  const { envelopes, activeEnvelope, runAIRiskScan, setActiveEnvelopeId, setActiveView } = useSignFlow();
  const [selectedEnvId, setSelectedEnvId] = useState(activeEnvelope?.id || envelopes[0]?.id || '');
  const [isScanning, setIsScanning] = useState(false);

  const targetEnv = envelopes.find(e => e.id === selectedEnvId) || activeEnvelope || envelopes[0];
  const doc = targetEnv?.documents[0];
  const docText = doc ? doc.pages.map(p => p.content).join('\n') : '';

  const analysis: AIRiskAnalysis = targetEnv?.aiAnalysis || analyzeDocumentRisk(docText);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      runAIRiskScan(selectedEnvId);
      setIsScanning(false);
    }, 600);
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (grade === 'B') return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    if (grade === 'C') return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getSeverityBadge = (sev: string) => {
    if (sev === 'critical') return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
    if (sev === 'high') return 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
    if (sev === 'medium') return 'bg-yellow-50 text-yellow-700 border-yellow-200 font-bold';
    return 'bg-blue-50 text-blue-700 border-blue-200 font-bold';
  };

  return (
    <div className="space-y-6">
      {/* Header & Target Selector */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">
              Agreement Risk & Clause Analysis
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Automated legal review scanning against corporate risk policy & indemnification standards.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <select
            value={selectedEnvId}
            onChange={(e) => setSelectedEnvId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
          >
            {envelopes.map(env => (
              <option key={env.id} value={env.id}>
                {env.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs hover:shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Re-Analyze'}</span>
          </button>
        </div>
      </div>

      {/* Score Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Playbook Grade */}
        <div className={`p-5 rounded-2xl border ${getGradeColor(analysis.playbookGrade)} flex items-center justify-between shadow-2xs`}>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Playbook Grade</span>
            <div className="text-4xl font-display font-black mt-1">{analysis.playbookGrade}</div>
            <p className="text-[11px] opacity-75 mt-0.5">Corporate Standard Compliance</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold font-mono">{analysis.overallScore}</span>
            <span className="text-xs opacity-60">/100</span>
          </div>
        </div>

        {/* Risk Level */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Risk Assessment</span>
            <div className="text-2xl font-display font-bold text-slate-900 uppercase mt-1">
              {analysis.riskLevel}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Aggregate Risk Exposure</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            {analysis.riskLevel === 'low' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            )}
          </div>
        </div>

        {/* Flagged Items Count */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Flagged Clauses</span>
            <div className="text-2xl font-display font-bold text-slate-900 font-mono mt-1">
              {analysis.findings.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Requires Legal Attention</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <Sliders className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Findings Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 font-display">Detailed Risk Findings & Playbook Recommendations</h3>

        <div className="space-y-3">
          {analysis.findings.map((finding) => (
            <div
              key={finding.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border uppercase ${getSeverityBadge(finding.severity)}`}>
                    {finding.severity}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{finding.clauseName}</h4>
                  <span className="text-xs text-slate-400 font-mono">({finding.lineReference})</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">Page {finding.pageNumber}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {finding.explanation}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Playbook Standard Rule:</span>
                  <p className="text-slate-700 text-[11px]">{finding.playbookStandard}</p>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1">
                  <span className="text-[10px] font-mono text-indigo-700 uppercase font-bold flex items-center">
                    <Sparkles className="w-3 h-3 mr-1 text-indigo-600" />
                    Recommended Revision:
                  </span>
                  <p className="text-indigo-950 text-[11px] font-medium">{finding.recommendedEdit}</p>
                </div>
              </div>
            </div>
          ))}

          {analysis.findings.length === 0 && (
            <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-900">Zero Critical Risks Flagged</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Agreement aligns with all mandatory corporate legal playbooks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
