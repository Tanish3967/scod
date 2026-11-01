import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2, 
  Plus, 
  Settings, 
  LogOut, 
  Layers 
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

interface NavbarProps {
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const { 
    currentUser,
    logout,
    currentRole, 
    setCurrentRole, 
    environment, 
    setEnvironment, 
    notifications, 
    isNotificationDrawerOpen, 
    setIsNotificationDrawerOpen, 
    openCreateEnvelopeModal,
    setActiveView,
    notify,
    tenant
  } = useSignFlow();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showEnvMenu, setShowEnvMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const envMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
      if (envMenuRef.current && !envMenuRef.current.contains(e.target as Node)) {
        setShowEnvMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const rolesList = [
    { id: 'sender', label: 'Sender', icon: '💼', title: 'Envelope Sender', desc: 'Create, route, and manage multi-party agreement pipelines' },
    { id: 'signer', label: 'Signer', icon: '✍️', title: 'Signer Persona', desc: 'Execute signatures, draw initials, and verify passkey credentials' },
    { id: 'admin', label: 'Admin', icon: '🛡️', title: 'System Administrator', desc: 'Manage enterprise tenant, webhooks, and local database' },
    { id: 'notary', label: 'Notary', icon: '📜', title: 'Commissioned Notary', desc: 'Conduct Remote Online Notarization with live webcam biometrics' },
    { id: 'auditor', label: 'Auditor', icon: '🔍', title: 'Compliance Auditor', desc: 'Inspect immutable SHA-256 Merkle chain & legal certificates' }
  ] as const;

  return (
    <header className="h-14 px-6 flex items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 select-none shadow-2xs gap-4">
      {/* Left Section: Compact Search Bar (Non-wrapping & Proportional) */}
      <div className="w-64 sm:w-80 md:w-96 shrink-0">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-indigo-300 text-slate-400 text-xs transition-colors shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 transition-colors" />
            <span className="text-slate-500 text-xs font-normal truncate whitespace-nowrap">Search agreements, signers...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded shadow-2xs shrink-0 group-hover:border-indigo-200">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Section: Streamlined, Spacious Action Group */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Primary "+ New Envelope" CTA */}
        <button
          onClick={openCreateEnvelopeModal}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Envelope</span>
        </button>

        {/* Subtle Divider */}
        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block shrink-0" />

        {/* Persona Switcher Dropdown */}
        <div className="relative shrink-0" ref={roleMenuRef}>
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowEnvMenu(false);
              setShowUserMenu(false);
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            title="Switch User Persona & Access Role"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="capitalize">{currentRole}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-xs space-y-1 animate-in fade-in slide-in-from-top-2">
              <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">Switch Persona</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Test workflows under different access roles</p>
              </div>

              {rolesList.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setCurrentRole(r.id);
                    setShowRoleMenu(false);
                    notify('info', 'Persona Switched', `Active persona: ${r.label.toUpperCase()}`);
                  }}
                  className={`w-full text-left p-2 rounded-xl transition-colors flex items-start space-x-2.5 cursor-pointer ${
                    currentRole === r.id ? 'bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base leading-none mt-0.5">{r.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{r.title}</span>
                      {currentRole === r.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug truncate mt-0.5">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Environment Switcher */}
        <div className="relative shrink-0" ref={envMenuRef}>
          <button
            onClick={() => {
              setShowEnvMenu(!showEnvMenu);
              setShowRoleMenu(false);
              setShowUserMenu(false);
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            title="Switch Execution Environment"
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${environment === 'production' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="capitalize">{environment}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showEnvMenu ? 'rotate-180' : ''}`} />
          </button>

          {showEnvMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-xs space-y-1 animate-in fade-in slide-in-from-top-2">
              <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">Network Node</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Hardware HSM vs Virtual Sandbox</p>
              </div>

              {[
                { id: 'production' as const, label: 'Production Mesh', dot: 'bg-emerald-500', desc: 'Hardware HSM • eIDAS Qualified' },
                { id: 'sandbox' as const, label: 'Sandbox (Test Mesh)', dot: 'bg-amber-500', desc: 'Mock keys & simulated signers' }
              ].map((env) => (
                <button
                  key={env.id}
                  onClick={() => {
                    setEnvironment(env.id);
                    setShowEnvMenu(false);
                    notify('info', 'Environment Switched', `Active mesh node: ${env.label.toUpperCase()}`);
                  }}
                  className={`w-full text-left p-2 rounded-xl transition-colors flex items-start space-x-2.5 cursor-pointer ${
                    environment === env.id ? 'bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${env.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{env.label}</span>
                      {environment === env.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{env.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button 
          onClick={() => setIsNotificationDrawerOpen(!isNotificationDrawerOpen)}
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          title={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Subtle Divider */}
        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block shrink-0" />

        {/* User Profile */}
        <div className="relative shrink-0" ref={userMenuRef}>
          <button 
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowRoleMenu(false);
              setShowEnvMenu(false);
            }}
            className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-left"
          >
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'TK'}
            </div>
            <div className="hidden lg:block leading-none">
              <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name || 'Tanish Khosla'}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-xs space-y-1 animate-in fade-in slide-in-from-top-2">
              <div className="p-2.5 border-b border-slate-100 mb-1">
                <p className="font-bold text-slate-900 text-xs">{currentUser?.name || 'Tanish Khosla'}</p>
                <p className="text-[11px] text-slate-500 font-mono">{currentUser?.email || 'tanish.khosla@acme.com'}</p>
                <div className="flex items-center space-x-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    {currentUser?.tier || 'Enterprise Tier 3'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold">
                    {currentUser?.organization || 'US-East'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveView('compliance');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Compliance & Trust Center</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('admin');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer font-medium"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Organization Settings</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('local-db');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer font-medium"
              >
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Local Persistent Database</span>
              </button>

              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
