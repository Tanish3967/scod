import React, { useState } from 'react';
import { 
  Link as LinkIcon, 
  Copy, 
  ExternalLink, 
  Plus, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Code, 
  Play, 
  Trash2, 
  Globe,
  Sliders,
  CheckCircle2,
  X
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

interface PowerFormItem {
  id: string;
  name: string;
  slug: string;
  url: string;
  submissionsCount: number;
  templateSource: string;
  isActive: boolean;
  maxSubmissions?: number;
}

export const PowerFormsView: React.FC = () => {
  const { notify, createNewEnvelope } = useSignFlow();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [activeEmbedPf, setActiveEmbedPf] = useState<PowerFormItem | null>(null);

  const [newFormName, setNewFormName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newTemplate, setNewTemplate] = useState('Standard Mutual Non-Disclosure Agreement (MNDA)');
  const [newCap, setNewCap] = useState(500);

  const [powerForms, setPowerForms] = useState<PowerFormItem[]>([
    {
      id: 'pf-01',
      name: 'Public Non-Disclosure Agreement (Self-Service)',
      slug: 'pf-mnda-2026-public',
      url: 'https://sign.acmeglobal.com/powerforms/pf-mnda-2026-public',
      submissionsCount: 318,
      templateSource: 'Standard Mutual Non-Disclosure Agreement (MNDA)',
      isActive: true,
      maxSubmissions: 1000
    },
    {
      id: 'pf-02',
      name: 'Vendor Onboarding & Compliance Form',
      slug: 'pf-vendor-onboarding-v4',
      url: 'https://sign.acmeglobal.com/powerforms/pf-vendor-onboarding-v4',
      submissionsCount: 89,
      templateSource: 'Enterprise Master Services Agreement (MSA)',
      isActive: true,
      maxSubmissions: 500
    },
    {
      id: 'pf-03',
      name: 'Event Liability & Photo Release Waiver',
      slug: 'pf-event-waiver-austin',
      url: 'https://sign.acmeglobal.com/powerforms/pf-event-waiver-austin',
      submissionsCount: 642,
      templateSource: 'General Commercial Lease & Sublease Agreement',
      isActive: true,
      maxSubmissions: 2000
    }
  ]);

  const handleCopy = (pf: PowerFormItem) => {
    navigator.clipboard?.writeText(pf.url);
    setCopiedId(pf.id);
    notify('success', 'PowerForm Link Copied', 'Shareable URL copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreatePowerForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormName.trim()) return;

    const slug = newSlug.trim() || newFormName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newPf: PowerFormItem = {
      id: 'pf-' + (powerForms.length + 1).toString().padStart(2, '0'),
      name: newFormName,
      slug,
      url: `https://sign.acmeglobal.com/powerforms/${slug}`,
      submissionsCount: 0,
      templateSource: newTemplate,
      isActive: true,
      maxSubmissions: Number(newCap) || 1000
    };

    setPowerForms(prev => [newPf, ...prev]);
    setNewFormName('');
    setNewSlug('');
    setShowCreateModal(false);
    notify('success', 'PowerForm Published', `Generated self-service link: ${newPf.url}`);
  };

  const handleOpenEmbedModal = (pf: PowerFormItem) => {
    setActiveEmbedPf(pf);
    setShowEmbedModal(true);
  };

  const handleTestSubmission = (pf: PowerFormItem) => {
    createNewEnvelope({
      title: `[PowerForm Submission] ${pf.name}`,
      description: `Auto-generated submission from public URL (${pf.url}). Bot protection & KYC verified.`,
      tags: ['PowerForm', 'Self-Serve', 'Public-Intake']
    });
    setPowerForms(prev => prev.map(p => p.id === pf.id ? { ...p, submissionsCount: p.submissionsCount + 1 } : p));
    notify('success', 'PowerForm Simulated Submission!', 'Created live envelope in Vault.');
  };

  const handleDeleteForm = (id: string) => {
    setPowerForms(prev => prev.filter(p => p.id !== id));
    notify('info', 'PowerForm Link Deactivated', 'Removed public URL.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">
              PowerForms & Reusable Public Signing Links
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Embed on websites or share via link. Every submission automatically creates a standalone, legally tracked envelope.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs hover:shadow-md flex items-center space-x-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New PowerForm Link</span>
        </button>
      </div>

      {/* PowerForms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {powerForms.map(pf => (
          <div
            key={pf.id}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold text-slate-900 font-display">{pf.name}</h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-semibold">
                  Active Link
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Source Template: <strong className="text-slate-800 font-semibold">{pf.templateSource}</strong>
              </p>

              {/* URL Box */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-indigo-700 truncate max-w-[260px]">
                  {pf.url}
                </span>
                <button
                  onClick={() => handleCopy(pf)}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shadow-2xs"
                  title="Copy URL"
                >
                  {copiedId === pf.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bottom Actions & Telemetry */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono font-bold text-slate-800">{pf.submissionsCount} Submissions</span>
                <span className="text-indigo-600 flex items-center font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Bot Protected & Captcha Verified
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleTestSubmission(pf)}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  <span>Test Fill & Submit</span>
                </button>

                <button
                  onClick={() => handleOpenEmbedModal(pf)}
                  className="p-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                  title="Embed on Website"
                >
                  <Code className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Embed</span>
                </button>

                <button
                  onClick={() => handleDeleteForm(pf.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete PowerForm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create PowerForm Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display">Create Self-Service PowerForm</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePowerForm} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-semibold">PowerForm Name</label>
                <input
                  type="text"
                  placeholder="e.g. Employee Equipment Agreement"
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Custom URL Slug</label>
                <input
                  type="text"
                  placeholder="e.g. employee-equipment-v1"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Source Template</label>
                <select
                  value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Standard Mutual Non-Disclosure Agreement (MNDA)">Standard Mutual Non-Disclosure Agreement (MNDA)</option>
                  <option value="Enterprise Master Services Agreement (MSA)">Enterprise Master Services Agreement (MSA)</option>
                  <option value="General Commercial Lease & Sublease Agreement">General Commercial Lease & Sublease Agreement</option>
                  <option value="Executive Employment Agreement & Offer Letter">Executive Employment Agreement & Offer Letter</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Max Submissions Limit</label>
                <input
                  type="number"
                  value={newCap}
                  onChange={(e) => setNewCap(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Publish PowerForm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embed Modal */}
      {showEmbedModal && activeEmbedPf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white border border-slate-200/80 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 font-display">Embed Code Snippets</h3>
              </div>
              <button onClick={() => setShowEmbedModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-semibold">1. Responsive HTML iFrame Embed</label>
                <div className="p-3.5 bg-slate-900 rounded-2xl font-mono text-[11px] text-emerald-400 border border-slate-800 overflow-x-auto shadow-inner">
                  <code>{`<iframe src="${activeEmbedPf.url}" width="100%" height="700px" frameborder="0" allow="camera; microphone"></iframe>`}</code>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">2. Floating Sign Button Modal Trigger (JavaScript)</label>
                <div className="p-3.5 bg-slate-900 rounded-2xl font-mono text-[11px] text-indigo-300 border border-slate-800 overflow-x-auto shadow-inner">
                  <code>{`<script src="https://cdn.signflow.io/v1/powerforms.js" data-form="${activeEmbedPf.slug}"></script>`}</code>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowEmbedModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
