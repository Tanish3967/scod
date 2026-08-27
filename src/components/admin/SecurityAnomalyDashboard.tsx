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
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              Trust & Safety / Anomaly Detection
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Machine learning monitors velocity abuse, suspicious bulk sends, and device fingerprint collisions.
          </p>
        </div>

        <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Integrity Score: 99.8%</span>
        </span>
      </div>

      <div className="space-y-3">
        {anomalies.map(anom => (
          <div
            key={anom.id}
            className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] font-bold">
                  {anom.type}
                </span>
                <span className="font-bold text-white">{anom.actor}</span>
              </div>
              <p className="text-slate-400 text-[11px]">{anom.description}</p>
            </div>

            <div className="flex items-center space-x-3 text-right shrink-0">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
                {anom.status}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{anom.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
