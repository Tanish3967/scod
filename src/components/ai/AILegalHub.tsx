import React, { useState } from 'react';
import { Sparkles, Edit3, ShieldAlert, Calendar, MessageSquare } from 'lucide-react';
import { AIDraftingStudio } from './AIDraftingStudio';
import { AIRiskScanner } from './AIRiskScanner';
import { ObligationCalendarTracker } from './ObligationCalendarTracker';
import { ContractQABot } from './ContractQABot';

export const AILegalHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'draft' | 'risk' | 'obligations' | 'qa'>('draft');

  const tabs = [
    { id: 'draft' as const, label: 'AI Contract Drafter', icon: Edit3, badge: 'RAG Clauses' },
    { id: 'risk' as const, label: 'Risk & Playbook Scan', icon: ShieldAlert, badge: 'Pre-Sign' },
    { id: 'obligations' as const, label: 'Obligation & Dates', icon: Calendar, badge: 'Auto-Sync' },
    { id: 'qa' as const, label: 'Contract Vault Q&A', icon: MessageSquare, badge: 'Citations' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top AI Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        {tabs.map((t) => {
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

      {/* Tab View Render */}
      {activeTab === 'draft' && <AIDraftingStudio />}
      {activeTab === 'risk' && <AIRiskScanner />}
      {activeTab === 'obligations' && <ObligationCalendarTracker />}
      {activeTab === 'qa' && <ContractQABot />}
    </div>
  );
};
