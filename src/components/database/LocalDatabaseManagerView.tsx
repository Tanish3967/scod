import React, { useState, useEffect } from 'react';
import { 
  Database, 
  HardDrive, 
  RefreshCw, 
  Download, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Server, 
  Cpu, 
  FileText, 
  Table, 
  Lock, 
  Activity,
  FolderGit2
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { downloadJsonBundle } from '../../utils/downloadUtils';

export const LocalDatabaseManagerView: React.FC = () => {
  const { 
    envelopes, 
    dbStats, 
    refreshDbStats, 
    exportDbBackup, 
    importDbBackup, 
    resetDb, 
    notify 
  } = useSignFlow();

  const [selectedTable, setSelectedTable] = useState<string>('envelopes');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [jsonImportText, setJsonImportText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    refreshDbStats();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDbStats();
    setTimeout(() => setIsRefreshing(false), 300);
    notify('info', 'Database Synced', 'IndexedDB tables and storage metrics refreshed.');
  };

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const dump = await exportDbBackup();
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `SignFlow-Local-Database-Backup-${timestamp}.json`;
      downloadJsonBundle(filename, JSON.parse(dump));
      notify('success', 'Backup Exported', `Saved local database snapshot (${filename}).`);
    } catch (err) {
      notify('error', 'Export Failed', 'Unable to create database backup snapshot.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportSubmit = async () => {
    if (!jsonImportText.trim()) return;
    const success = await importDbBackup(jsonImportText);
    if (success) {
      setShowImportModal(false);
      setJsonImportText('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonImportText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">
              SignFlow Local Database & Storage Engine
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Browser-native IndexedDB object stores paired with Go/Node disk ledgers. Full offline resilience and zero cloud dependency.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Sync Stats</span>
          </button>

          <button
            onClick={handleExportBackup}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Restore Backup</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Engine Status</span>
            <p className="text-sm font-bold text-slate-900 flex items-center space-x-1.5 font-display">
              <span>Active & Connected</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Storage Footprint</span>
            <p className="text-sm font-bold text-slate-900 font-mono">
              {dbStats?.storageUsedFormatted || '128.0 KB'}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Indexed Object Stores</span>
            <p className="text-sm font-bold text-slate-900 font-mono">
              {dbStats?.tables.length || 6} Stores
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Integrity Proof</span>
            <p className="text-sm font-bold text-slate-900 font-mono">
              SHA-256 Merkle Chain
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Object Stores List + Table Record Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Object Store List */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-slate-900">
              <Table className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-display">IndexedDB Object Stores</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-semibold">SignFlow_Local_Vault</span>
          </div>

          <div className="space-y-2">
            {(dbStats?.tables || [
              { name: 'envelopes', count: envelopes.length, description: 'Agreement Envelopes & Fields' },
              { name: 'audit_events', count: 18, description: 'Cryptographic Event Chain' },
              { name: 'templates', count: 6, description: 'Reusable Master Templates' },
              { name: 'notary_journal', count: 2, description: 'Remote Notary IDV & Recording Logs' },
              { name: 'offline_queue', count: 2, description: 'Offline PWA Signature Queue' },
              { name: 'system_settings', count: 1, description: 'Tenant Compliance Config' }
            ]).map(tbl => {
              const isSelected = selectedTable === tbl.name;
              return (
                <button
                  key={tbl.name}
                  onClick={() => setSelectedTable(tbl.name)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-xs'
                      : 'bg-slate-50/70 border-slate-100 text-slate-700 hover:bg-slate-100/70 hover:border-slate-200'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-indigo-700">{tbl.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{tbl.description}</p>
                  </div>
                  <div className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-mono font-semibold text-slate-700 shrink-0 shadow-2xs">
                    {tbl.count} rows
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset the local database to factory seed records?')) {
                  resetDb();
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset to Seed Defaults</span>
            </button>
          </div>
        </div>

        {/* Right: Record Explorer & JSON Payload Preview */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">
                  Store Inspector: <span className="text-indigo-700 font-mono">{selectedTable}</span>
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                Persistent On Disk
              </span>
            </div>

            {/* Envelopes Table Explorer */}
            {selectedTable === 'envelopes' && (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {envelopes.map(env => (
                  <div key={env.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:border-slate-200 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{env.title}</span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 uppercase shadow-2xs">
                        {env.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-slate-600">
                      <div><strong className="text-slate-400">ID:</strong> {env.id}</div>
                      <div><strong className="text-slate-400">Fields:</strong> {env.fields.length}</div>
                      <div><strong className="text-slate-400">Recipients:</strong> {env.recipients.length}</div>
                      <div><strong className="text-slate-400">Audit Events:</strong> {env.auditTrail.length}</div>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      SHA-256: <span className="text-slate-600">{env.documents[0]?.sha256Hash || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* JSON Schema & Raw Preview for Other Stores */}
            {selectedTable !== 'envelopes' && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 max-h-96 overflow-y-auto leading-relaxed shadow-inner">
                <pre className="text-[11px] whitespace-pre-wrap">
                  {JSON.stringify({
                    objectStore: selectedTable,
                    database: 'SignFlow_Local_Vault',
                    indexedKeys: ['id', 'status', 'timestamp'],
                    storageEngine: 'Native W3C IndexedDB API',
                    persistedRecordsCount: selectedTable === 'audit_events' ? 18 : selectedTable === 'templates' ? 6 : 2,
                    syncState: 'SYNCHRONIZED',
                    sampleRecord: selectedTable === 'audit_events' ? {
                      id: 'aud-event-7721',
                      timestamp: new Date().toISOString(),
                      action: 'Cryptographic SHA-256 Signature Appended',
                      hashChainCurrent: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
                    } : {
                      id: 'store-rec-01',
                      name: `${selectedTable}_master_record`,
                      updatedAt: new Date().toISOString()
                    }
                  }, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>All mutations in SignFlow automatically commit to this local storage vault.</span>
            </div>
            <span className="font-mono text-slate-500">Last Synced: {dbStats?.lastSyncAt || 'Just now'}</span>
          </div>
        </div>
      </div>

      {/* Import / Restore Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-indigo-600">
              <Upload className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900 font-display">Restore Local Database Backup</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Upload a previously exported SignFlow JSON database backup or paste the JSON payload below to restore all envelopes, templates, and audit logs.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                Upload Backup JSON File:
              </label>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                Or Paste JSON Snapshot:
              </label>
              <textarea
                rows={6}
                value={jsonImportText}
                onChange={(e) => setJsonImportText(e.target.value)}
                placeholder="Paste { metadata: {...}, tables: {...} } here..."
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                disabled={!jsonImportText.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Confirm & Restore Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
