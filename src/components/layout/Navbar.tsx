import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Sparkles, 
  Shield, 
  ChevronDown, 
  Globe, 
  Building2, 
  Plus, 
  Layers
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

export const Navbar: React.FC<{ onOpenSearch: () => void }> = ({ onOpenSearch }) => {
  const { 
    currentRole, 
    setCurrentRole, 
    environment, 
    setEnvironment, 
    tenant, 
    notifications,
    createNewEnvelope,
    setActiveView
  } = useSignFlow();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState('en-US');

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between">
      {/* Left branding & Org */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center">
              <Layers className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                {tenant.logoText}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-2.5 h-2.5 mr-1" /> AI-Native
              </span>
            </div>
          </div>
        </div>

        {/* Tenant selector */}
        <div className="hidden md:flex items-center pl-4 border-l border-slate-800 space-x-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-300 truncate max-w-[180px]">
            {tenant.organization}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 font-mono">
            {tenant.dataResidency} Vault
          </span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-900 border border-slate-800 text-slate-400 text-xs transition-colors group"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
            <span>Search agreements, clauses, or ask AI...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2.5">
        {/* Environment toggle */}
        <button
          onClick={() => setEnvironment(environment === 'production' ? 'sandbox' : 'production')}
          className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all ${
            environment === 'production'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}
          title="Toggle Sandbox / Production Environment"
        >
          <span className={`w-2 h-2 rounded-full ${environment === 'production' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="capitalize">{environment}</span>
        </button>

        {/* Language selector preview */}
        <div className="relative hidden xl:flex items-center">
          <select
            aria-label="Language selector"
            value={selectedLocale}
            onChange={(e) => setSelectedLocale(e.target.value)}
            className="bg-slate-900/80 border border-slate-800 text-slate-300 text-xs rounded-md pl-7 pr-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
          >
            <option value="en-US">English (US)</option>
            <option value="es-ES">Español (ES)</option>
            <option value="fr-FR">Français (FR)</option>
            <option value="de-DE">Deutsch (DE)</option>
            <option value="ja-JP">日本語 (JA)</option>
          </select>
          <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-2 pointer-events-none" />
        </div>

        {/* Quick New Agreement Button */}
        <button
          onClick={() => createNewEnvelope()}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Envelope</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-950" />
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-200">Event Stream & Alerts</span>
                <span className="text-[10px] text-slate-400 font-mono">{notifications.length} recent</span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs">
                    <div className="flex items-center justify-between text-indigo-400 font-medium">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center space-x-2 pl-2 pr-2.5 py-1 rounded-lg border border-slate-800 hover:bg-slate-900 text-xs text-slate-200 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-[10px] text-white">
              {currentRole.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden md:block">
              <span className="block font-medium capitalize leading-none">{currentRole}</span>
              <span className="text-[9px] text-slate-400 font-mono">Persona Switcher</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in">
              <div className="px-2 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Simulate Persona
              </div>
              {(['sender', 'signer', 'admin', 'notary', 'auditor'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => {
                    setCurrentRole(role);
                    setShowRoleDropdown(false);
                    if (role === 'notary') setActiveView('notary');
                    if (role === 'admin') setActiveView('admin');
                    if (role === 'auditor') setActiveView('compliance');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize flex items-center justify-between ${
                    currentRole === role ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{role}</span>
                  {currentRole === role && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
