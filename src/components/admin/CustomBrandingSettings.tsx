import React, { useState } from 'react';
import { Palette, Globe, Shield, Save, Building2, CheckCircle2 } from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

export const CustomBrandingSettings: React.FC = () => {
  const { tenant, updateTenantSettings, notify } = useSignFlow();

  const [orgName, setOrgName] = useState(tenant.organization);
  const [logoText, setLogoText] = useState(tenant.logoText);
  const [primaryColor, setPrimaryColor] = useState(tenant.primaryColor);
  const [customDomain, setCustomDomain] = useState(tenant.customDomain);
  const [dataResidency, setDataResidency] = useState(tenant.dataResidency);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantSettings({
      organization: orgName,
      logoText,
      primaryColor,
      customDomain,
      dataResidency
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400">
            <Palette className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">White-Label Branding & Identity</h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Customize the signing experience with your corporate brand, colors, custom domain, and data residency jurisdiction.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Organization / Legal Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Logo Header Text</label>
              <input
                type="text"
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-display font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Custom Signing Domain</label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Data Residency Storage Region</label>
              <select
                value={dataResidency}
                onChange={(e) => setDataResidency(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
              >
                <option value="US">US Region (AWS us-east-1 / Delaware)</option>
                <option value="EU">EU Region (Frankfurt / GDPR Enforced)</option>
                <option value="APAC">APAC Region (Singapore / Tokyo)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              <span>Save Tenant Branding</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
