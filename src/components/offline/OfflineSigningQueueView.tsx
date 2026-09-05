import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  HardDrive, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight,
  Database,
  Smartphone,
  Plus,
  Lock,
  Layers,
  FileText,
  X
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

interface OfflineEnvelopeRecord {
  id: string;
  title: string;
  signerName: string;
  offlineCapturedAt: string;
  localSha256: string;
  cloudLedgerHash?: string;
  status: 'cached' | 'synced';
  deviceInfo: string;
}

export const OfflineSigningQueueView: React.FC = () => {
  const { notify } = useSignFlow();

  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [newTitle, setNewTitle] = useState('Remote Aviation Maintenance Release');
  const [newSigner, setNewSigner] = useState('Captain James Morrison');

  const [offlineQueue, setOfflineQueue] = useState<OfflineEnvelopeRecord[]>([
    {
      id: 'off-101',
      title: 'Commercial On-Site Inspection Waiver',
      signerName: 'Marcus Vance',
      offlineCapturedAt: '12 mins ago',
      localSha256: '9f82ab4102948bb109e248c8949102b',
      cloudLedgerHash: '9f82ab4102948bb109e248c8949102b',
      status: 'cached',
      deviceInfo: 'iPad Pro (Field Ops - GPS Tagged)'
    },
    {
      id: 'off-102',
      title: 'Field Service Equipment Release Form',
      signerName: 'Carlos Ramirez',
      offlineCapturedAt: '25 mins ago',
      localSha256: '881ab92c01994e810a9c8192739281a',
      cloudLedgerHash: '881ab92c01994e810a9c8192739281a',
      status: 'cached',
      deviceInfo: 'Surface Pro Rugged Tablet'
    },
    {
      id: 'off-103',
      title: 'Offshore Drilling Safety Protocols Acknowledgment',
      signerName: 'Dr. Sarah Jenkins',
      offlineCapturedAt: '2 hours ago',
      localSha256: '310928f810928bb81920491823901b8',
      cloudLedgerHash: '310928f810928bb81920491823901b8',
      status: 'synced',
      deviceInfo: 'Offline Field Kiosk #04'
    }
  ]);

  const handleToggleOffline = () => {
    const nextState = !isOfflineMode;
    setIsOfflineMode(nextState);
    if (nextState) {
      notify('warning', 'Offline PWA Mode Active', 'Device disconnected from internet. Signatures will be cryptographically queued locally.');
    } else {
      notify('info', 'Network Restored', 'Online connection detected. You can now sync local cached envelopes.');
    }
  };

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setOfflineQueue(prev => prev.map(item => ({ ...item, status: 'synced' })));
      notify('success', 'All Offline Envelopes Synced!', 'Local hash chains reconciled with central ledger. Certificates generated.');
    }, 1200);
  };

  const handleCaptureOfflineSign = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: OfflineEnvelopeRecord = {
      id: 'off-' + (100 + offlineQueue.length + 1),
      title: newTitle,
      signerName: newSigner,
      offlineCapturedAt: 'Just now (Offline Storage)',
      localSha256: 'a192847109283bb9102948c81920391',
      cloudLedgerHash: 'a192847109283bb9102948c81920391',
      status: 'cached',
      deviceInfo: 'Local Browser Sandbox PWA'
    };
    setOfflineQueue(prev => [newRecord, ...prev]);
    setShowCaptureModal(false);
    notify('success', 'Offline Signature Captured', `Recorded locally with SHA-256 seal. Added to sync queue.`);
  };

  const pendingCount = offlineQueue.filter(i => i.status === 'cached').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400">
            <Smartphone className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              Offline Mobile Signing PWA & Cryptographic Sync Queue
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Capture legally binding signatures without internet in remote field locations with automatic hash-chain reconciliation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowCaptureModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Capture Offline Signature</span>
          </button>

          <button
            onClick={handleToggleOffline}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              isOfflineMode
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
            }`}
          >
            {isOfflineMode ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isOfflineMode ? 'Simulating Offline' : 'Online Connected'}</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={isSyncing || pendingCount === 0}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Pending ({pendingCount})</span>
          </button>
        </div>
      </div>

      {/* Storage & Network Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">IndexedDB Offline Storage</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-display text-white">3.8 MB</span>
            <span className="text-xs text-slate-400 font-mono">/ 50 MB Cache Quota</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">PWA Service Worker Status</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-display text-emerald-400">Active</span>
            <span className="text-xs text-emerald-300 font-mono">Asset Cache v2.4</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Cryptographic Proof Chain</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-display text-indigo-400">0 Collisions</span>
            <span className="text-xs text-slate-400 font-mono">100% Hash Matched</span>
          </div>
        </div>
      </div>

      {/* Queue Card */}
      <div className="bg-slate-900/70 rounded-3xl border border-slate-800 shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Local Encrypted Queue (IndexedDB Store)</h3>
          <span className="text-xs font-mono font-bold text-slate-400">
            {pendingCount} Pending Sync • {offlineQueue.length - pendingCount} Reconciled
          </span>
        </div>

        <div className="space-y-3">
          {offlineQueue.map(item => (
            <div key={item.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-100">{item.title}</h4>
                  {item.status === 'cached' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800/40">
                      Local Offline Cache
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                      Synced to Ledger
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">Signer: <strong className="text-slate-200">{item.signerName}</strong> • {item.deviceInfo}</p>
                <p className="text-[10px] font-mono text-slate-500">Local SHA-256 Digest: {item.localSha256}</p>
              </div>

              <div>
                {item.status === 'cached' ? (
                  <button
                    onClick={handleSyncAll}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Sync to Cloud
                  </button>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Cryptographically Reconciled</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Capture Offline Signature Modal */}
      {showCaptureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Capture Remote Field Signature</h3>
              <button onClick={() => setShowCaptureModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCaptureOfflineSign} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Agreement Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Signer Full Name</label>
                <input
                  type="text"
                  value={newSigner}
                  onChange={(e) => setNewSigner(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-[11px] space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Offline Non-Repudiation Envelope</span>
                </div>
                <p>Captures hardware timestamp, GPS geolocation coordinates, and creates local SHA-256 seal stored in IndexedDB.</p>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCaptureModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Save to Offline Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
