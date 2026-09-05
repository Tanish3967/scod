import React, { useState } from 'react';
import { Search, Bell, MessageSquare, ChevronDown, UserCheck, Shield, CheckCircle2 } from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

interface NavbarProps {
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const { 
    currentRole, 
    setCurrentRole, 
    environment, 
    setEnvironment, 
    notifications, 
    isNotificationDrawerOpen, 
    setIsNotificationDrawerOpen, 
    notify 
  } = useSignFlow();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showEnvMenu, setShowEnvMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-14 px-6 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-30 select-none">
      {/* Search Input Bar */}
      <div className="flex-1 max-w-xl">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-50/90 hover:bg-slate-100 border border-slate-200/80 text-slate-400 text-xs transition-all shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="text-slate-500 text-xs font-normal">Search envelopes, signers, templates, hashes...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Actions & Persona Controls */}
      <div className="flex items-center space-x-3 ml-4">
        {/* Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowEnvMenu(false);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            <span className="capitalize">{currentRole}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 text-xs space-y-0.5">
              {(['sender', 'signer', 'admin', 'notary', 'auditor'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setCurrentRole(r);
                    setShowRoleMenu(false);
                    notify('info', 'Role Switched', `Active view persona: ${r.toUpperCase()}`);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg capitalize flex items-center justify-between ${
                    currentRole === r ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{r}</span>
                  {currentRole === r && <CheckCircle2 className="w-3 h-3 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Environment Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowEnvMenu(!showEnvMenu);
              setShowRoleMenu(false);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className={`w-2 h-2 rounded-full ${environment === 'production' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="capitalize">{environment}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showEnvMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 text-xs space-y-0.5">
              {(['production', 'sandbox'] as const).map((env) => (
                <button
                  key={env}
                  onClick={() => {
                    setEnvironment(env);
                    setShowEnvMenu(false);
                    notify('info', 'Environment Changed', `Switched to ${env.toUpperCase()}`);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg capitalize flex items-center justify-between ${
                    environment === env ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${env === 'production' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span>{env}</span>
                  </span>
                  {environment === env && <CheckCircle2 className="w-3 h-3 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell with Dynamic Unread Badge */}
        <button 
          onClick={() => setIsNotificationDrawerOpen(!isNotificationDrawerOpen)}
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          title={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Message Bubble Icon */}
        <button 
          onClick={() => notify('info', 'Messages & Threads', 'Direct counterparty redline threads')}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Messages"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* User / Organization Avatar Badge */}
        <div className="flex items-center space-x-2 pl-1 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            A
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-none">Acme Corp.</p>
            <p className="text-[10px] text-slate-400 leading-tight">acme.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};
