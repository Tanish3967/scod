import React, { useState } from 'react';
import { Link as LinkIcon, Copy, ExternalLink, Plus, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

interface PowerFormItem {
  id: string;
  name: string;
  url: string;
  submissionsCount: number;
  templateSource: string;
  isActive: boolean;
}

export const PowerFormsView: React.FC = () => {
  const { notify } = useSignFlow();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const powerForms: PowerFormItem[] = [
    {
      id: 'pf-01',
      name: 'Public Non-Disclosure Agreement (Self-Service)',
      url: 'https://sign.acmeglobal.com/powerforms/pf-mnda-2026-public',
      submissionsCount: 318,
      templateSource: 'Standard Mutual Non-Disclosure Agreement (MNDA)',
      isActive: true
    },
    {
      id: 'pf-02',
      name: 'Vendor Onboarding & Compliance Form',
      url: 'https://sign.acmeglobal.com/powerforms/pf-vendor-onboarding-v4',
      submissionsCount: 89,
      templateSource: 'Enterprise Master Services Agreement (MSA)',
      isActive: true
    },
    {
      id: 'pf-03',
      name: 'Event Liability & Photo Release Waiver',
      url: 'https://sign.acmeglobal.com/powerforms/pf-event-waiver-austin',
      submissionsCount: 642,
      templateSource: 'General Commercial Lease & Sublease Agreement',
      isActive: true
    }
  ];

  const handleCopy = (pf: PowerFormItem) => {
    navigator.clipboard?.writeText(pf.url);
    setCopiedId(pf.id);
    notify('success', 'PowerForm Link Copied', 'Shareable URL copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400">
            <LinkIcon className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              PowerForms & Reusable Public Signing Links
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Embed on websites or share via link. Every submission automatically creates a standalone, legally tracked envelope.
          </p>
        </div>

        <button
          onClick={() => notify('info', 'New PowerForm Created', 'Generated embeddable signing link.')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
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
            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-bold text-white">{pf.name}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-mono">
                Active Link
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Source Template: <strong className="text-slate-300">{pf.templateSource}</strong>
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-indigo-300 truncate max-w-[280px]">
                {pf.url}
              </span>
              <button
                onClick={() => handleCopy(pf)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy URL"
              >
                {copiedId === pf.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span className="font-mono">{pf.submissionsCount} Completed Submissions</span>
              <span className="text-indigo-400 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Bot Protected & Captcha Verified
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
