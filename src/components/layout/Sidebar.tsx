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
  HardDrive,
  Calculator,
  Calendar
} from 'lucide-react';
import { useSignFlow, AppView } from '../../context/SignFlowContext';

interface NavGroup {
  title: string;
  items: {
    id: AppView;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: string;
  }[];
}

export const Sidebar: React.FC = () => {
  const { currentUser, activeView, setActiveView, prepareNewEnvelope } = useSignFlow();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navGroups: NavGroup[] = [
    {
      title: 'WORKSPACE',
      items: [
        { id: 'dashboard', label: 'Home', icon: Home },
        { id: 'envelopes', label: 'Envelopes', icon: Mail },
        { id: 'prepare', label: 'Document Studio', icon: FileText },
        { id: 'templates', label: 'Templates & Forms', icon: Layers },
        { id: 'powerforms', label: 'PowerForms Intake', icon: Calculator },
        { id: 'workflows', label: 'Workflow Canvas', icon: GitFork }
      ]
    },
    {
      title: 'INTELLIGENCE & CLM',
      items: [
        { id: 'ai-hub', label: 'AI Legal Assistant', icon: Sparkles },
        { id: 'clm-workbench', label: 'CLM Workbench', icon: UserCheck },
        { id: 'obligations', label: 'Obligation & Renewal AI', icon: Calendar, badge: 'AI' },
        { id: 'analytics', label: 'Reports & Analytics', icon: BarChart2 }
      ]
    },
    {
      title: 'ENTERPRISE & TRUST',
      items: [
        { id: 'notary', label: 'Remote Notary (RON)', icon: Stamp },
        { id: 'qes-tsp', label: 'eIDAS QES & TSP', icon: Globe },
        { id: 'co-browsing', label: 'Live Co-Browsing', icon: Video, badge: 'LIVE' },
        { id: 'crm-sync', label: 'Salesforce & CRM', icon: Database },
        { id: 'compliance', label: 'Compliance & Audit', icon: ShieldCheck },
        { id: 'admin', label: 'Admin & Database', icon: Terminal }
      ]
    }
  ];

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-18 p-2.5' : 'w-64 p-3.5'
      } border-r border-slate-100 bg-white flex flex-col justify-between shrink-0 h-full select-none transition-all duration-300 ease-in-out`}
    >
      <div className="flex-1 flex flex-col min-h-0 space-y-3">
        {/* Header: SignFlow Brand & Collapse/Expand Toggle */}
        <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-2' : 'justify-between'} px-1 py-0.5 shrink-0`}>
          {isCollapsed ? (
            <>
              {/* Top Expand Button */}
              <button
                onClick={() => setIsCollapsed(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 flex items-center justify-center transition-all cursor-pointer group relative shadow-2xs hover:scale-105"
                title="Expand Sidebar"
              >
                <ChevronRight className="w-4.5 h-4.5" />
                <div className="absolute left-12 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Expand Sidebar
                </div>
              </button>

              {/* Logo icon */}
              <div 
                onClick={() => setActiveView('dashboard')}
                className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm hover:scale-105 transition-transform cursor-pointer"
                title="SignFlow Home"
              >
                <span className="font-display tracking-tight">S</span>
              </div>
            </>
          ) : (
            <>
              <div 
                onClick={() => setActiveView('dashboard')}
                className="flex items-center space-x-2.5 cursor-pointer group"
                title="SignFlow Home"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform shrink-0">
                  <span className="font-display tracking-tight">S</span>
                </div>
                <span className="text-base font-bold text-slate-900 tracking-tight font-display">
                  SignFlow
                </span>
              </div>

              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Primary Action Button: + New Envelope */}
        {isCollapsed ? (
          <button
            onClick={prepareNewEnvelope}
            className="w-10 h-10 mx-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs flex items-center justify-center transition-all hover:scale-105 shrink-0 cursor-pointer group relative"
            title="Create New Envelope"
          >
            <Plus className="w-5 h-5" />
            <div className="absolute left-14 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              New Envelope
            </div>
          </button>
        ) : (
          <button
            onClick={prepareNewEnvelope}
            className="w-full py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-xs shadow-xs flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Envelope</span>
          </button>
        )}

        {/* Extended Navigation Area (No scrollbar needed, clean sections) */}
        <div className="flex-1 flex flex-col justify-between py-1 space-y-3">
          {navGroups.map((group, groupIdx) => (
            <div key={group.title} className="space-y-0.5">
              {!isCollapsed ? (
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3 pb-1">
                  {group.title}
                </p>
              ) : groupIdx > 0 ? (
                <div className="h-px bg-slate-100 my-1.5 mx-2" />
              ) : null}

              <nav className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;

                  if (isCollapsed) {
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`w-10 h-8 mx-auto flex items-center justify-center rounded-xl text-xs transition-all cursor-pointer relative group ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                        <div className="absolute left-14 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          {item.label}
                        </div>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50 font-semibold text-indigo-700 shadow-2xs'
                          : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 text-[8.5px] font-bold tracking-wide shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom User & Organization Section */}
      <div className="pt-2.5 border-t border-slate-100 space-y-2 shrink-0">
        {isCollapsed ? (
          <div className="flex flex-col items-center py-1">
            {/* Collapsed User Avatar with Tooltip */}
            <div 
              className="relative group cursor-pointer"
              title="Tanish Khosla (tanish@acme.com)"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Tanish Khosla"
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <div className="absolute left-14 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Tanish Khosla (Acme Corp)
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* User Profile Pill */}
            <div className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer">
              <div className="flex items-center space-x-2.5 min-w-0">
                <img
                  src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                  alt={currentUser?.name || "User"}
                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name || 'Tanish Khosla'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{currentUser?.email || 'tanish@acme.com'}</p>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>

            {/* Organization Box */}
            <div className="p-2 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
              <span className="text-xs font-semibold text-slate-800 truncate">{currentUser?.organization || 'Acme Corp.'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>

            {/* Collapse toggle */}
            <div className="flex justify-center pt-0.5">
              <button
                onClick={() => setIsCollapsed(true)}
                className="w-full py-1 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center space-x-1.5 text-xs font-semibold transition-colors cursor-pointer border border-slate-200/60"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Collapse</span>
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
