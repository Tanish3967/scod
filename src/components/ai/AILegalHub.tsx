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
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                isActive ? 'bg-slate-800 text-indigo-300' : 'bg-slate-100 text-slate-500'
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
