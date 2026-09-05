import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Info, XCircle, X, Bell } from 'lucide-react';
import { useSignFlow, ActiveToast } from '../../context/SignFlowContext';

const ToastCard: React.FC<{
  toast: ActiveToast;
  onDismiss: (id: string) => void;
  onOpenCenter: () => void;
}> = ({ toast, onDismiss, onOpenCenter }) => {
  const isAI = toast.type === 'ai';
  const isSuccess = toast.type === 'success';
  const isWarning = toast.type === 'warning';
  const isError = toast.type === 'error';

  // Real-time remaining seconds countdown (from 60 down to 0)
  const [remainingSec, setRemainingSec] = useState(() => {
    const elapsed = Math.floor((Date.now() - toast.createdAt) / 1000);
    return Math.max(0, 60 - elapsed);
  });

  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setRemainingSec(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Color-coded progress bar gradient
  const progressGradient = isAI
    ? 'from-indigo-500 via-purple-500 to-indigo-400'
    : isSuccess
    ? 'from-emerald-400 via-teal-500 to-emerald-300'
    : isWarning
    ? 'from-amber-400 via-orange-500 to-amber-300'
    : isError
    ? 'from-rose-500 via-red-500 to-rose-400'
    : 'from-blue-500 via-indigo-500 to-sky-400';

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto p-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex flex-col space-y-2.5 transition-all duration-300 ease-out animate-in slide-in-from-bottom-2 group ${
        isAI
          ? 'bg-slate-900/95 border-indigo-500/40 text-slate-100 shadow-indigo-500/20'
          : isSuccess
          ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-500/20'
          : isWarning
          ? 'bg-slate-900/95 border-amber-500/40 text-slate-100 shadow-amber-500/20'
          : isError
          ? 'bg-slate-900/95 border-rose-500/40 text-slate-100 shadow-rose-500/20'
          : 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-slate-950/40'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="shrink-0 mt-0.5">
          {isAI && <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />}
          {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          {isError && <XCircle className="w-4 h-4 text-rose-400" />}
          {!isAI && !isSuccess && !isWarning && !isError && <Info className="w-4 h-4 text-sky-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-white tracking-tight">{toast.title}</p>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
              title="Dismiss from Screen"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
      </div>

      {/* Auto-dismiss countdown & center link */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400">
        <span className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
          <span className="font-mono">
            Auto-moves to Center in <strong className="text-indigo-300 font-bold">{remainingSec}s</strong>
          </span>
          {isPaused && <span className="text-[9px] text-amber-400 font-bold">(Paused)</span>}
        </span>

        <button
          onClick={() => {
            onDismiss(toast.id);
            onOpenCenter();
          }}
          className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-0.5 cursor-pointer"
        >
          <Bell className="w-3 h-3" />
          <span>View in Center</span>
        </button>
      </div>

      {/* Progress Bar Container: Visually Reduces with Time */}
      <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden relative">
        <div 
          style={{ width: `${(remainingSec / 60) * 100}%` }}
          className={`h-full bg-gradient-to-r ${progressGradient} rounded-full transition-all duration-1000 ease-linear shadow-xs`}
        />
      </div>
    </div>
  );
};

export const NotificationToast: React.FC = () => {
  const { activeToasts, dismissToast, setIsNotificationDrawerOpen } = useSignFlow();

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none select-none">
      {activeToasts.slice(0, 3).map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={dismissToast}
          onOpenCenter={() => setIsNotificationDrawerOpen(true)}
        />
      ))}
    </div>
  );
};
