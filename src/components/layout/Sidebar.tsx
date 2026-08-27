import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Edit3, 
  PenTool, 
  Sparkles, 
  Stamp, 
  Copy, 
  Link as LinkIcon, 
  ShieldCheck, 
  Terminal, 
  BarChart3,
  Flame
} from 'lucide-react';
import { useSignFlow, AppView } from '../../context/SignFlowContext';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, envelopes, notarySessions } = useSignFlow();

  const pendingSigningCount = envelopes.filter(e => e.status === 'sent' || e.status === 'delivered' || e.status === 'viewed').length;
  const activeRonCount = notarySessions.filter(s => s.status !== 'completed').length;

  const navItems: { id: AppView; label: string; icon: React.FC<{ className?: string }>; badge?: string | number; badgeColor?: string; group?: string }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, group: 'Core' },
    { id: 'envelopes', label: 'Envelopes Vault', icon: FileText, badge: envelopes.length, group: 'Core' },
    { id: 'prepare', label: 'Document Studio', icon: Edit3, group: 'Core' },
    { id: 'signing', label: 'Signer Experience', icon: PenTool, badge: pendingSigningCount > 0 ? pendingSigningCount : undefined, badgeColor: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30', group: 'Core' },
    
    // AI Section
    { id: 'ai-hub', label: 'AI Legal Hub', icon: Sparkles, badge: 'AI-Native', badgeColor: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-sm', group: 'Intelligence' },
    
    // Notarization
    { id: 'notary', label: 'Remote Notary (RON)', icon: Stamp, badge: activeRonCount > 0 ? 'Live' : undefined, badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', group: 'Intelligence' },
    
    // Automation & Scale
    { id: 'templates', label: 'Templates & Bulk', icon: Copy, group: 'Scale' },
    { id: 'powerforms', label: 'PowerForms (Links)', icon: LinkIcon, group: 'Scale' },
    
    // Enterprise & Trust
    { id: 'compliance', label: 'Compliance & Audit', icon: ShieldCheck, badge: 'SOC 2', badgeColor: 'bg-slate-800 text-slate-300', group: 'Trust & Admin' },
    { id: 'admin', label: 'Admin & Webhooks', icon: Terminal, group: 'Trust & Admin' },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/95 flex flex-col justify-between p-3 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="space-y-6">
        {/* Navigation Groups */}
        {['Core', 'Intelligence', 'Scale', 'Trust & Admin'].map((groupName) => {
          const groupItems = navItems.filter(item => item.group === groupName);
          return (
            <div key={groupName} className="space-y-1">
              <div className="px-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
                {groupName}
              </div>
              <div className="space-y-0.5 mt-1">
                {groupItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-950'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security & Health widget */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-purple-950/20 border border-indigo-500/20">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-200">Legal Validity Active</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-800/40">
              ESIGN/eIDAS
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Append-only SHA-256 hash-chaining active across all active envelopes.
          </p>
        </div>
      </div>
    </aside>
  );
};
