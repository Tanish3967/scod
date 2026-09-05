import React from 'react';
import { 
  Check, 
  Clock, 
  Minus, 
  Send, 
  PenTool, 
  UserPlus, 
  Share2, 
  FileText,
  ChevronRight
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { Envelope } from '../../types/signflow';

interface RightInspectorPanelProps {
  envelope: Envelope;
  onOpenEnvelope: (envId: string) => void;
}

export const RightInspectorPanel: React.FC<RightInspectorPanelProps> = ({ envelope, onOpenEnvelope }) => {
  const { notify } = useSignFlow();

  const mockRecipients = [
    { name: 'John Doe (You)', role: 'Sender', status: 'completed' },
    { name: 'Mina Rodriguez', role: 'Signer', status: 'completed' },
    { name: 'Tom Wilson', role: 'Signer', status: 'in_progress' },
    { name: 'Jessica Lee', role: 'CC', status: 'pending' },
  ];

  const mockActivities = [
    { title: 'You sent the envelope', time: 'May 21, 2025 • 10:21 AM', icon: Send, iconColor: 'bg-rose-50 text-rose-500' },
    { title: 'Mina Rodriguez signed', time: 'May 21, 2025 • 10:27 AM', icon: PenTool, iconColor: 'bg-emerald-50 text-emerald-500' },
    { title: 'You added Tom Wilson', time: 'May 21, 2025 • 10:28 AM', icon: UserPlus, iconColor: 'bg-blue-50 text-blue-500' },
  ];

  return (
    <div className="w-80 bg-white border-l border-slate-100 p-6 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="space-y-6">
        {/* Envelope Header */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            {envelope.title || 'NDA – Acme Corp & Beta LLC'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Envelope #{envelope.id.toUpperCase().replace('ENV-', 'EN-') || 'EN-4587'}
          </p>

          {/* Status Badge */}
          <div className="mt-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
              In Progress
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Progress</span>
              <span className="font-medium text-slate-600">2 of 4 completed</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full w-1/2 transition-all duration-300" />
            </div>
          </div>
        </div>

        {/* Recipients Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900">Recipients</h4>
            <button 
              onClick={() => notify('info', 'Edit Routing', 'Opening recipient routing editor.')}
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Edit
            </button>
          </div>

          <div className="space-y-2.5">
            {mockRecipients.map((rec, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {rec.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{rec.name}</p>
                    <p className="text-[10px] text-slate-400">{rec.role}</p>
                  </div>
                </div>

                <div className="shrink-0 text-[11px]">
                  {rec.status === 'completed' && (
                    <span className="text-emerald-600 flex items-center space-x-1 font-medium">
                      <Check className="w-3 h-3" />
                      <span>Completed</span>
                    </span>
                  )}
                  {rec.status === 'in_progress' && (
                    <span className="text-blue-600 flex items-center space-x-1 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>In Progress</span>
                    </span>
                  )}
                  {rec.status === 'pending' && (
                    <span className="text-slate-400 flex items-center space-x-1">
                      <Minus className="w-3 h-3" />
                      <span>Pending</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900">Activity</h4>
            <button 
              onClick={() => notify('info', 'Audit Trail', 'Viewing complete cryptographic audit trail.')}
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {mockActivities.map((act, i) => {
              const Icon = act.icon;
              return (
                <div key={i} className="flex items-start space-x-2.5 text-xs">
                  <div className={`p-1.5 rounded-lg ${act.iconColor} shrink-0 mt-0.5`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 leading-snug">{act.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{act.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="pt-6 space-y-2.5">
        <button
          onClick={() => onOpenEnvelope(envelope.id)}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5"
        >
          <span>Open Envelope</span>
        </button>

        <button
          onClick={() => notify('success', 'Link Copied', 'Signer invite link copied to clipboard.')}
          className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center justify-center space-x-2"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Share Envelope</span>
        </button>
      </div>
    </div>
  );
};
