import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification } = useSignFlow();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {notifications.slice(0, 3).map((notif) => {
        const isAI = notif.type === 'ai';
        const isSuccess = notif.type === 'success';
        const isWarning = notif.type === 'warning';
        const isError = notif.type === 'error';

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-2xl backdrop-blur-xl border flex items-start space-x-3 transition-all animate-in slide-in-from-bottom-2 duration-200 ${
              isAI
                ? 'bg-slate-900/95 border-indigo-500/40 text-slate-100 shadow-indigo-500/10'
                : isSuccess
                ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-500/10'
                : isWarning
                ? 'bg-slate-900/95 border-amber-500/40 text-slate-100 shadow-amber-500/10'
                : isError
                ? 'bg-slate-900/95 border-rose-500/40 text-slate-100 shadow-rose-500/10'
                : 'bg-slate-900/95 border-slate-800 text-slate-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isAI && <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />}
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {isError && <XCircle className="w-4 h-4 text-rose-400" />}
              {!isAI && !isSuccess && !isWarning && !isError && <Info className="w-4 h-4 text-sky-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-200">{notif.title}</p>
                <button
                  onClick={() => dismissNotification(notif.id)}
                  className="text-slate-500 hover:text-slate-300 p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{notif.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
