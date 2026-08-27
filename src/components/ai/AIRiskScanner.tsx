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
    if (grade === 'A') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (grade === 'B') return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    if (grade === 'C') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getSeverityBadge = (sev: string) => {
    if (sev === 'critical') return 'bg-rose-950 text-rose-400 border-rose-800';
    if (sev === 'high') return 'bg-amber-950 text-amber-400 border-amber-800';
    if (sev === 'medium') return 'bg-yellow-950 text-yellow-400 border-yellow-800';
    return 'bg-blue-950 text-blue-400 border-blue-800';
  };

  return (
    <div className="space-y-6">
      {/* Header & Target Selector */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-400">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              Agreement Risk & Clause Analysis
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Automated legal review scanning against corporate risk policy & indemnification standards.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedEnvId}
            onChange={(e) => setSelectedEnvId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
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
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 flex items-center space-x-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Re-Analyze'}</span>
          </button>
        </div>
      </div>

      {/* Score Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Playbook Grade */}
        <div className={`p-5 rounded-2xl border ${getGradeColor(analysis.playbookGrade)} flex items-center justify-between`}>
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
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Risk Assessment</span>
            <div className="text-2xl font-display font-bold text-white uppercase mt-1">
              {analysis.riskLevel}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Aggregate Risk Exposure</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            {analysis.riskLevel === 'low' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            )}
          </div>
        </div>

        {/* Flagged Items Count */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Flagged Clauses</span>
            <div className="text-2xl font-display font-bold text-white font-mono mt-1">
              {analysis.findings.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Requires Legal Attention</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <Sliders className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Findings Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Detailed Risk Findings & Playbook Recommendations</h3>

        <div className="space-y-3">
          {analysis.findings.map((finding) => (
            <div
              key={finding.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase ${getSeverityBadge(finding.severity)}`}>
                    {finding.severity}
                  </span>
                  <h4 className="text-xs font-bold text-white">{finding.clauseName}</h4>
                  <span className="text-xs text-slate-500 font-mono">({finding.lineReference})</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Page {finding.pageNumber}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {finding.explanation}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Playbook Standard Rule:</span>
                  <p className="text-slate-300 text-[11px]">{finding.playbookStandard}</p>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Recommended Revision:
                  </span>
                  <p className="text-indigo-200 text-[11px] font-medium">{finding.recommendedEdit}</p>
                </div>
              </div>
            </div>
          ))}

          {analysis.findings.length === 0 && (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-200">Zero Critical Risks Flagged</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Agreement aligns with all mandatory corporate legal playbooks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
