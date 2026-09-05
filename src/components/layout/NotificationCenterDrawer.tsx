import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Trash2, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  ExternalLink, 
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  Filter
} from 'lucide-react';
import { useSignFlow, ToastNotification } from '../../context/SignFlowContext';

export const NotificationCenterDrawer: React.FC = () => {
  const { 
    notifications, 
    isNotificationDrawerOpen, 
    setIsNotificationDrawerOpen,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    dismissNotification,
    setActiveView,
    setActiveEnvelopeId
  } = useSignFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'unread' | 'ai-risk' | 'agreements' | 'compliance'>('all');

  if (!isNotificationDrawerOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    // Search query filter
    const matchesQuery = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesQuery) return false;

    // Category filter
    if (categoryFilter === 'unread') return !n.isRead;
    if (categoryFilter === 'ai-risk') return n.category === 'ai-risk' || n.type === 'ai';
    if (categoryFilter === 'agreements') return n.category === 'agreements';
    if (categoryFilter === 'compliance') return n.category === 'compliance' || n.category === 'security';
    return true;
  });

  const handleNotificationClick = (notif: ToastNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.targetEnvelopeId) {
      setActiveEnvelopeId(notif.targetEnvelopeId);
    }
    if (notif.targetView) {
      setActiveView(notif.targetView);
      setIsNotificationDrawerOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div 
        onClick={() => setIsNotificationDrawerOpen(false)}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-100 space-y-3 shrink-0 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900 font-display">Notification Center</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">All agreement actions, AI insights & compliance logs</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    title="Mark all as read"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    title="Clear all notifications"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsNotificationDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts, events, agreements..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              {[
                { id: 'all', label: 'All', count: notifications.length },
                { id: 'unread', label: 'Unread', count: unreadCount },
                { id: 'ai-risk', label: 'AI Risk', count: notifications.filter(n => n.category === 'ai-risk' || n.type === 'ai').length },
                { id: 'agreements', label: 'Agreements', count: notifications.filter(n => n.category === 'agreements').length },
                { id: 'compliance', label: 'Compliance', count: notifications.filter(n => n.category === 'compliance' || n.category === 'security').length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCategoryFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center space-x-1 ${
                    categoryFilter === tab.id
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[9px] px-1 rounded-full ${categoryFilter === tab.id ? 'bg-indigo-700 text-white' : 'bg-white text-slate-500'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications Scrollable List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No Notifications</p>
                <p className="text-[11px] text-slate-400">You're all caught up! New events and alerts will appear here.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isAI = notif.type === 'ai';
                const isSuccess = notif.type === 'success';
                const isWarning = notif.type === 'warning';
                const isError = notif.type === 'error';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                      !notif.isRead
                        ? 'bg-indigo-50/30 border-indigo-200/80 shadow-2xs hover:bg-indigo-50/60'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    {/* Unread blue dot */}
                    {!notif.isRead && (
                      <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />
                    )}

                    <div className="flex items-start space-x-3 pr-4">
                      {/* Icon */}
                      <div className="shrink-0 mt-0.5">
                        {isAI && (
                          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {isSuccess && (
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {isWarning && (
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {isError && (
                          <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {!isAI && !isSuccess && !isWarning && !isError && (
                          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                            <Info className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{notif.title}</p>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                        
                        <div className="flex items-center justify-between pt-2 mt-1 text-[10px] text-slate-400">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{notif.timestamp}</span>
                          </span>

                          {notif.targetView && (
                            <span className="text-indigo-600 font-semibold flex items-center space-x-0.5 group-hover:translate-x-0.5 transition-transform">
                              <span>Open</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span className="flex items-center space-x-1.5 text-[11px] text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Cryptographic Event Log</span>
            </span>

            <button
              onClick={() => {
                setActiveView('compliance');
                setIsNotificationDrawerOpen(false);
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              View Full Audit Ledger →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
