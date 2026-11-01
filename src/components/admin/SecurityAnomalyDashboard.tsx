import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Globe, Smartphone, Zap } from 'lucide-react';

export const SecurityAnomalyDashboard: React.FC = () => {
  const anomalies = [
    {
      id: 'anom-01',
      type: 'Velocity Anomaly',
      severity: 'low',
      description: 'Signer viewed and completed 8-page NDA in under 12 seconds.',
      actor: 'Amanda Sterling (amanda@apexpartners.io)',
      status: 'Auto-Resolved',
      timestamp: '2 hours ago'
    },
    {
      id: 'anom-02',
      type: 'Geo-IP Coherence',
      severity: 'low',
      description: 'Signer IP (198.51.100.82) resolved to Boston, MA; recipient profile states New York.',
      actor: 'David Vance (Acme Global)',
      status: 'Verified (Travel Flagged)',
      timestamp: 'Yesterday'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">
              Trust & Safety / Anomaly Detection
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Machine learning monitors velocity abuse, suspicious bulk sends, and device fingerprint collisions.
            </p>
          </div>
        </div>

        <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-semibold self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Integrity Score: 99.8%</span>
        </span>
      </div>

      <div className="space-y-3">
        {anomalies.map(anom => (
          <div
            key={anom.id}
            className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                  {anom.type}
                </span>
                <span className="font-bold text-slate-900 font-display">{anom.actor}</span>
              </div>
              <p className="text-slate-600 text-[11.5px]">{anom.description}</p>
            </div>

            <div className="flex items-center space-x-3 text-right shrink-0">
              <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {anom.status}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{anom.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
