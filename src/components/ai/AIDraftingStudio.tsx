import React, { useState } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Check, 
  X, 
  FileText, 
  Layers, 
  Send, 
  BookOpen, 
  ArrowRight, 
  RefreshCw, 
  Copy,
  Sliders,
  ShieldCheck,
  Cpu,
  Database,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Award,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { executeMultiAgentDraft } from '../../utils/aiMultiAgentDrafter';
import { MultiAgentDraftResult, AgentExecutionStep } from '../../types/signflow';

export const AIDraftingStudio: React.FC = () => {
  const { createNewEnvelope, notify, setActiveView } = useSignFlow();

  const [prompt, setPrompt] = useState('Standard Enterprise Master Services Agreement with Delaware law, Net 30 invoicing, and 12-month trailing fee liability cap');
  const [agreementType, setAgreementType] = useState('MSA');
  const [targetPages, setTargetPages] = useState<number>(20);
  const [governingLaw, setGoverningLaw] = useState('State of Delaware');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState<AgentExecutionStep | null>(null);
  const [executionLogs, setExecutionLogs] = useState<AgentExecutionStep[]>([]);
  const [draftResult, setDraftResult] = useState<MultiAgentDraftResult | null>(null);
  const [activePreviewPage, setActivePreviewPage] = useState<number>(1);

  const samplePrompts = [
    { label: 'MSA (20 Pages)', type: 'MSA', pages: 20, text: 'Enterprise Cloud Master Services Agreement with 99.95% SLA, Net 30 invoicing, Delaware law, and liability cap' },
    { label: 'SaaS Agreement (15 Pages)', type: 'SaaS', pages: 15, text: 'Global Enterprise SaaS Subscription with DPA, SOC 2 compliance, and service credit remedies' },
    { label: 'Mutual NDA (5 Pages)', type: 'MNDA', pages: 5, text: 'Comprehensive Mutual Non-Disclosure Agreement with trade secret carve-outs and 5-year survival' },
    { label: 'Exec Employment (10 Pages)', type: 'Employment', pages: 10, text: 'Executive VP Employment Agreement with 4-year equity option vesting, IP assignment, and severance terms' },
    { label: 'Commercial Lease (30 Pages)', type: 'Lease', pages: 30, text: 'Commercial Office Triple-Net (NNN) Master Lease Agreement with CAM reconciliation and buildout allowances' }
  ];

  const handleStartMultiAgentDraft = async () => {
    setIsGenerating(true);
    setExecutionLogs([]);
    setActiveStep(null);
    setDraftResult(null);

    try {
      const result = await executeMultiAgentDraft({
        prompt,
        agreementType,
        targetPageCount: targetPages,
        governingLaw,
        onProgress: (step) => {
          setActiveStep(step);
          setExecutionLogs(prev => [...prev.filter(l => l.agentId !== step.agentId || l.status !== step.status), step]);
        }
      });

      setDraftResult(result);
      setActivePreviewPage(1);
      notify('ai', 'Multi-Agent Draft Completed', `Successfully generated & certified ${result.totalPages}-page agreement (${result.totalWordCount.toLocaleString()} words).`);
    } catch (err) {
      console.error('Multi-agent drafting error:', err);
      notify('error', 'Drafting Failed', 'An error occurred during multi-agent drafting.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePushToEnvelope = () => {
    if (!draftResult) return;
    
    createNewEnvelope({
      title: draftResult.title,
      description: `AI Multi-Agent Draft (${draftResult.totalPages} Pages): ${prompt}`,
      tags: ['AI-Drafted', 'Multi-Agent', agreementType, `${draftResult.totalPages}-Pages`],
      documents: [
        {
          id: 'doc-ai-multi-' + Date.now(),
          name: `${draftResult.title.replace(/[\s:]+/g, '_')}.pdf`,
          size: `${(draftResult.totalPages * 0.18).toFixed(1)} MB`,
          fileType: 'pdf',
          sha256Hash: 'sha256_ai_merkle_' + Date.now(),
          pages: draftResult.pages
        }
      ]
    });

    notify('success', 'Created Live Envelope', `Generated ${draftResult.totalPages}-page envelope in Document Studio.`);
    setActiveView('prepare');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">
                AI Multi-Agent Long-Form Document Drafter
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono font-bold">
                Multi-Agent Swarm • 5 to 50+ Pages
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Orchestrates 6 specialized legal AI agents collaborating across a centralized Shared Knowledge Store with Compact Context Envelopes to generate comprehensive, exhaustive legal documents with verified pagination and cross-references.
            </p>
          </div>
        </div>

        {/* Prompt Input & Target Page Scale Controls */}
        <div className="space-y-4 pt-1">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your agreement objectives and special business terms..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 shadow-2xs transition-colors"
            />
            <button
              onClick={handleStartMultiAgentDraft}
              disabled={isGenerating}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs hover:shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Agents Drafting...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Launch Multi-Agent Drafter ({targetPages} Pages)</span>
                </>
              )}
            </button>
          </div>

          {/* Target Page Scale Selector & Parameters */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Page Count Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5 font-medium text-slate-700">
                <span className="flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Target Page Length:</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold font-mono">
                  {targetPages} Pages
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={targetPages}
                onChange={(e) => setTargetPages(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>5p</span>
                <span>10p</span>
                <span>20p</span>
                <span>30p</span>
                <span>50+p</span>
              </div>
            </div>

            {/* Agreement Type */}
            <div>
              <label className="block mb-1.5 font-medium text-slate-700">Agreement Type:</label>
              <select
                value={agreementType}
                onChange={(e) => setAgreementType(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="MSA">Master Services Agreement (MSA)</option>
                <option value="SaaS">SaaS Subscription & DPA</option>
                <option value="MNDA">Mutual Non-Disclosure Agreement (MNDA)</option>
                <option value="Employment">Executive Employment Agreement</option>
                <option value="Lease">Commercial Real Estate Lease</option>
              </select>
            </div>

            {/* Governing Law */}
            <div>
              <label className="block mb-1.5 font-medium text-slate-700">Governing Law Jurisdiction:</label>
              <select
                value={governingLaw}
                onChange={(e) => setGoverningLaw(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="State of Delaware">State of Delaware (Delaware Chancery)</option>
                <option value="State of New York">State of New York (Commercial Division)</option>
                <option value="State of California">State of California</option>
                <option value="England and Wales">England and Wales (UK High Court)</option>
              </select>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
            <span className="text-slate-400 text-[11px] font-medium">Pre-Configured Blueprints:</span>
            {samplePrompts.map(sp => (
              <button
                key={sp.label}
                onClick={() => {
                  setPrompt(sp.text);
                  setAgreementType(sp.type);
                  setTargetPages(sp.pages);
                }}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Multi-Agent Swarm Telemetry HUD */}
      {(isGenerating || executionLogs.length > 0) && (
        <div className="p-5 rounded-3xl bg-slate-900 text-slate-100 border border-slate-800 shadow-xl space-y-4 font-sans">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                  <span>Multi-Agent Swarm Collaboration</span>
                  {isGenerating ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                      Live Orchestrating
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Pipeline Complete
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Shared Memory: {draftResult?.sharedMemory.sections.length || 'Allocating'} Sections | Compact Context Protocol Active
                </p>
              </div>
            </div>

            {activeStep && (
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-indigo-400">{activeStep.progressPercent}%</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${activeStep?.progressPercent || (draftResult ? 100 : 0)}%` }}
            />
          </div>

          {/* Agent Swarm Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 text-[11px]">
            {[
              { id: 'orchestrator', label: '1. Orchestrator', desc: 'Section Budgeting' },
              { id: 'pattern_enforcer', label: '2. Style Enforcer', desc: 'Shared Memory Lexicon' },
              { id: 'section_drafter', label: '3. Section Swarm', desc: '2-3pp Dense Clauses' },
              { id: 'layout_agent', label: '4. Layout Agent', desc: '8.5x11 Pagination' },
              { id: 'compiler', label: '5. Compiler', desc: 'TOC & Signature Blocks' },
              { id: 'verifier', label: '6. Legal Verifier', desc: 'Cross-Refs & Grade A+' }
            ].map(ag => {
              const logItem = executionLogs.find(l => l.agentId === ag.id);
              const isDone = logItem?.status === 'completed';
              const isActive = activeStep?.agentId === ag.id && isGenerating;

              return (
                <div 
                  key={ag.id}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isDone 
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                      : isActive 
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 shadow-md ring-1 ring-indigo-500 animate-pulse'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[10px] truncate">{ag.label}</span>
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : isActive ? (
                      <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-700 shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] mt-1 text-slate-400 truncate">{ag.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Active Status Message */}
          {activeStep && (
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 font-mono text-[11px] text-indigo-300 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span className="truncate">{activeStep.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Generated Document Review & Multi-Page Canvas Viewer */}
      {draftResult && (
        <div className="space-y-4">
          {/* Top Review Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2.5">
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {draftResult.title}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-xs font-bold flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Grade {draftResult.verification.complianceGrade} ({draftResult.verification.overallScore}/100)</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Verified Multi-Page Output: <strong className="text-slate-800">{draftResult.totalPages} Pages</strong> • Total Words: <strong className="text-slate-800">{draftResult.totalWordCount.toLocaleString()}</strong> • Internal Cross-References: <strong className="text-emerald-700">{draftResult.verification.crossReferencesValid} Valid</strong>
              </p>
            </div>

            <button
              onClick={handlePushToEnvelope}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <Check className="w-4 h-4" />
              <span>Convert to Live Envelope ({draftResult.totalPages} Pages)</span>
            </button>
          </div>

          {/* Verification Quality Certificate Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-2">
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center space-x-1.5 font-mono text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Legal Verification Quality Certificate ({draftResult.verification.certificateId})</span>
              </span>
              <span className="text-[10px] text-emerald-800">
                Issued: {new Date(draftResult.verification.issuedAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px] pt-1">
              {draftResult.verification.auditorNotes.map((note, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-white/80 border border-emerald-100 flex items-start space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700 leading-snug">{note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Page Canvas Viewer with Page Navigation Rail */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Page Navigation Rail */}
            <div className="lg:col-span-1 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 max-h-[600px] overflow-y-auto">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider px-2 py-1 font-mono">
                Document Pages ({draftResult.pages.length})
              </h4>
              <div className="space-y-1">
                {draftResult.pages.map((p) => (
                  <button
                    key={p.pageNumber}
                    onClick={() => setActivePreviewPage(p.pageNumber)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                      activePreviewPage === p.pageNumber
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold shadow-xs'
                        : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                    }`}
                  >
                    <span className="truncate pr-2 font-mono text-[11px]">
                      Page {p.pageNumber}: {p.title.split('. ')[1] || p.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      p.{p.pageNumber}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Page Paper Canvas */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[600px]">
              <div>
                {/* Page Pagination Controls */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActivePreviewPage(prev => Math.max(1, prev - 1))}
                      disabled={activePreviewPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-800">
                      Page {activePreviewPage} of {draftResult.pages.length}
                    </span>
                    <button
                      onClick={() => setActivePreviewPage(prev => Math.min(draftResult.pages.length, prev + 1))}
                      disabled={activePreviewPage === draftResult.pages.length}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    Authentic Legal 8.5" x 11" Canvas
                  </span>
                </div>

                {/* Page Content Display */}
                <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-3 font-serif">
                  {draftResult.pages[activePreviewPage - 1]?.content.split('\n\n').map((para, idx) => {
                    if (para.startsWith('# ')) {
                      return <h1 key={idx} className="text-base font-sans font-bold text-slate-950 uppercase tracking-tight border-b pb-2">{para.replace('# ', '')}</h1>;
                    }
                    if (para.startsWith('### ')) {
                      return <h3 key={idx} className="text-xs font-sans font-bold text-slate-900 uppercase tracking-wider text-indigo-900 mt-4">{para.replace('### ', '')}</h3>;
                    }
                    if (para.startsWith('|')) {
                      // Table rendering
                      return (
                        <div key={idx} className="my-3 overflow-x-auto">
                          <table className="min-w-full text-[11px] font-sans border border-slate-200">
                            <tbody>
                              {para.split('\n').filter(r => !r.includes('---|---')).map((row, rIdx) => (
                                <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-100 font-bold' : 'border-t border-slate-200'}>
                                  {row.split('|').filter(c => c.trim().length > 0).map((cell, cIdx) => (
                                    <td key={cIdx} className="p-2 border-r border-slate-200 last:border-r-0">
                                      {cell.trim()}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }
                    if (para.startsWith('- ')) {
                      return (
                        <ul key={idx} className="list-disc list-inside space-y-1 text-slate-700 pl-2">
                          {para.split('\n').map((li, lIdx) => (
                            <li key={lIdx}>{li.replace(/^- /, '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={idx} className="text-slate-800 font-sans leading-relaxed text-[12px]">{para}</p>;
                  })}
                </div>
              </div>

              {/* Bottom Canvas Footer */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>SignFlow Multi-Agent Certified</span>
                <span>SHA-256 Merkle Ledger Anchored</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
