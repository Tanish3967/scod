import React, { useState } from 'react';
import { Terminal, Palette, ShieldCheck, ShieldAlert } from 'lucide-react';
import { CustomBrandingSettings } from './CustomBrandingSettings';
import { WebhookTester } from './WebhookTester';
import { ComplianceTrustCenter } from './ComplianceTrustCenter';
import { SecurityAnomalyDashboard } from './SecurityAnomalyDashboard';

export const AdminPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'branding' | 'webhooks' | 'compliance' | 'security'>('webhooks');

  const tabs = [
    { id: 'webhooks' as const, label: 'Webhooks & API Console', icon: Terminal, badge: 'Live Logs' },
    { id: 'branding' as const, label: 'White-Label Branding', icon: Palette, badge: 'Custom CSS' },
    { id: 'compliance' as const, label: 'Compliance & 21 CFR Part 11', icon: ShieldCheck, badge: 'SOC 2' },
    { id: 'security' as const, label: 'Trust & Safety / Fraud', icon: ShieldAlert, badge: 'ML Monitored' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${
                isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {t.badge}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === 'webhooks' && <WebhookTester />}
      {activeTab === 'branding' && <CustomBrandingSettings />}
      {activeTab === 'compliance' && <ComplianceTrustCenter />}
      {activeTab === 'security' && <SecurityAnomalyDashboard />}
    </div>
  );
};
