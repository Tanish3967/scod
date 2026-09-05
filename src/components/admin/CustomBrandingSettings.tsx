import React, { useState } from 'react';
import { 
  Palette, 
  Globe, 
  Shield, 
  Save, 
  Building2, 
  CheckCircle2, 
  Sparkles, 
  Mail, 
  Eye, 
  Check, 
  Laptop, 
  Smartphone 
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

export const CustomBrandingSettings: React.FC = () => {
  const { tenant, updateTenantSettings, notify } = useSignFlow();

  const [orgName, setOrgName] = useState(tenant.organization);
  const [logoText, setLogoText] = useState(tenant.logoText);
  const [primaryColor, setPrimaryColor] = useState(tenant.primaryColor || '#4f46e5');
  const [customDomain, setCustomDomain] = useState(tenant.customDomain);
  const [dataResidency, setDataResidency] = useState(tenant.dataResidency);
  const [supportEmail, setSupportEmail] = useState('legal-ops@acmeglobal.com');
  const [footerLegalNote, setFooterLegalNote] = useState('Protected by SignFlow Enterprise 256-Bit Cryptographic Sealing & EU eIDAS Qualified Signatures.');

  const colorPresets = [
    { name: 'Royal Indigo', hex: '#4f46e5' },
    { name: 'Obsidian Slate', hex: '#0f172a' },
    { name: 'Emerald Green', hex: '#059669' },
    { name: 'Velvet Ruby', hex: '#e11d48' },
    { name: 'Electric Cyan', hex: '#0891b2' },
    { name: 'Amethyst Purple', hex: '#9333ea' }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantSettings({
      organization: orgName,
      logoText,
      primaryColor,
      customDomain,
      dataResidency
    });
    notify('success', 'Tenant Branding Saved!', 'Custom colors, vanity domain, and email templates updated across all signer touchpoints.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400">
            <Palette className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              White-Label Branding, Vanity Domains & Identity
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Customize the recipient signing experience with your corporate logo, brand colors, custom domain, and data residency jurisdiction.
          </p>
        </div>

        <span className="text-[11px] font-mono px-3 py-1.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 self-start sm:self-auto font-bold">
          Enterprise Tier: Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Branding Form */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Brand Assets & Configuration</h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Organization / Legal Entity</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Header Brand Logo Text</label>
                <input
                  type="text"
                  value={logoText}
                  onChange={(e) => setLogoText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-display font-bold"
                />
              </div>
            </div>

            {/* Brand Color Presets */}
            <div className="space-y-2">
              <label className="text-slate-300 block font-medium">Primary Accent Color ({primaryColor})</label>
              <div className="flex flex-wrap items-center gap-2">
                {colorPresets.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setPrimaryColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                      primaryColor === c.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    title={c.name}
                  >
                    {primaryColor === c.hex && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-full bg-transparent border-0 cursor-pointer"
                  title="Custom Color Picker"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Custom Signing Vanity Domain</label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Support & Legal Ops Contact</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">Data Residency Storage Region</label>
              <select
                value={dataResidency}
                onChange={(e) => setDataResidency(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
              >
                <option value="US">US Region (AWS us-east-1 / Delaware • SOC 2 & HIPAA)</option>
                <option value="EU">EU Region (Frankfurt / Dublin • GDPR Article 28 & eIDAS QES)</option>
                <option value="APAC">APAC Region (Singapore / Tokyo • ISO 27001)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">Signer Email Footer Legal Notice</label>
              <input
                type="text"
                value={footerLegalNote}
                onChange={(e) => setFooterLegalNote(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-[11px]"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <Save className="w-4 h-4" />
                <span>Save Tenant Branding</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 5 Cols: Live Signing Preview */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>Live Signer Experience Preview</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              Live Render
            </span>
          </div>

          {/* Email Preview Card */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3 text-xs">
            {/* Simulated Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div 
                  style={{ backgroundColor: primaryColor }}
                  className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-white text-[10px]"
                >
                  {logoText.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-bold text-white font-display text-sm">{logoText}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{customDomain}</span>
            </div>

            {/* Email Body */}
            <div className="space-y-2 py-1">
              <span className="text-[11px] text-slate-400 block font-medium">Invitation Email to Signer:</span>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2">
                <p className="text-slate-200 text-xs font-semibold leading-tight">
                  {orgName} has requested your signature on <strong>Enterprise Agreement 2026</strong>.
                </p>
                <p className="text-[11px] text-slate-400">
                  Please review and execute with tamper-evident digital seal.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    style={{ backgroundColor: primaryColor }}
                    className="w-full py-2 rounded-xl text-white font-bold text-xs shadow-md transition-opacity hover:opacity-90"
                  >
                    Review & Sign Agreement
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Legal Note */}
            <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 space-y-1">
              <p>{footerLegalNote}</p>
              <p className="text-slate-400 font-mono">Contact: {supportEmail}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
