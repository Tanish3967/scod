import React, { useState } from 'react';
import { 
  Home, 
  Mail, 
  FileText, 
  Users, 
  UserCheck, 
  BarChart2, 
  Sparkles, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  GitFork,
  Stamp,
  Globe,
  Link as LinkIcon,
  ShieldCheck,
  Terminal,
  Layers,
  ChevronLeft,
  Video,
  Database,
  Smartphone,
  UploadCloud,
  HardDrive
} from 'lucide-react';
import { useSignFlow, AppView } from '../../context/SignFlowContext';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, prepareNewEnvelope } = useSignFlow();
  const [showMoreTools, setShowMoreTools] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const mainNavItems: { id: AppView; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'envelopes', label: 'Envelopes', icon: Mail },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'clm-workbench', label: 'Contacts', icon: UserCheck },
    { id: 'workflows', label: 'Team', icon: Users },
    { id: 'analytics', label: 'Reports', icon: BarChart2 },
    { id: 'ai-hub', label: 'AI Assistant', icon: Sparkles },
  ];

  const advancedTools: { id: AppView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'co-browsing', label: 'Live Co-Browsing Room', icon: Video },
    { id: 'crm-sync', label: 'Salesforce & CRM Sync', icon: Database },
    { id: 'offline-queue', label: 'Offline Mobile PWA Queue', icon: Smartphone },
    { id: 'migration', label: 'Legacy DocuSign Importer', icon: UploadCloud },
    { id: 'prepare', label: 'Document Studio', icon: FileText },
    { id: 'signing', label: 'Signer Experience', icon: Mail },
    { id: 'notary', label: 'Remote Notary (RON)', icon: Stamp },
    { id: 'qes-tsp', label: 'eIDAS QES & TSP', icon: Globe },
    { id: 'powerforms', label: 'PowerForms (Links)', icon: LinkIcon },
    { id: 'emails', label: 'Email Dispatcher & Inbox', icon: Mail },
    { id: 'compliance', label: 'Compliance & Audit', icon: ShieldCheck },
    { id: 'admin', label: 'Admin & Webhooks', icon: Terminal },
    { id: 'local-db', label: 'Local Database Vault', icon: HardDrive },
  ];

  return (
    <aside className="w-64 border-r border-slate-100 bg-white flex flex-col justify-between p-4 shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="flex-1 flex flex-col min-h-0 space-y-4">
        {/* SignFlow Brand Logo */}
        <div className="flex items-center space-x-2.5 px-2 py-1 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            <span className="font-display tracking-tight">S</span>
          </div>
          <span className="text-base font-bold text-slate-900 tracking-tight font-display">
            SignFlow
          </span>
        </div>

        {/* Primary Action Button: + New Envelope */}
        <button
          onClick={prepareNewEnvelope}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-xs shadow-xs flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Envelope</span>
        </button>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
          {/* Primary Navigation Menu */}
          <nav className="space-y-0.5 pt-1">
            {mainNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 font-semibold text-indigo-700 shadow-2xs'
                      : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}

            {/* More Tools Toggle for Enterprise Features */}
            <div className="pt-2">
              <button
                onClick={() => setShowMoreTools(!showMoreTools)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-[11px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>MORE FEATURES</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMoreTools ? 'rotate-180' : ''}`} />
              </button>

              {showMoreTools && (
                <div className="space-y-0.5 mt-1 pt-1 border-t border-slate-100">
                  {advancedTools.map(tool => {
                    const ToolIcon = tool.icon;
                    const isActive = activeView === tool.id;
                    const isLive = tool.id === 'co-browsing';

                    return (
                      <button
                        key={tool.id}
                        onClick={() => setActiveView(tool.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11.5px] transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-50 font-semibold text-indigo-700'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <ToolIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span className="truncate">{tool.label}</span>
                        </div>
                        {isLive && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold tracking-wide shrink-0">
                            LIVE
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Bottom User & Organization Section */}
      <div className="pt-3 border-t border-slate-100 space-y-2 shrink-0">
        {/* User Profile Pill */}
        <div className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer">
          <div className="flex items-center space-x-2.5 min-w-0">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Tanish Khosla"
              className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Tanish Khosla</p>
              <p className="text-[10px] text-slate-500 truncate">tanish@acme.com</p>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>

        {/* Organization Box */}
        <div className="p-2 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
          <span className="text-xs font-semibold text-slate-800">Acme Corp.</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Collapse toggle */}
        <div className="flex justify-center pt-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            «
          </button>
        </div>
      </div>
    </aside>
  );
};
