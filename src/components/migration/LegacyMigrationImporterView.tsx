import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileCheck, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  Sparkles, 
  Database,
  FileCode,
  ShieldCheck,
  Download,
  AlertCircle,
  FileArchive,
  Check,
  Play
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { downloadJsonBundle } from '../../utils/downloadUtils';

interface MigrationJob {
  id: string;
  sourcePlatform: 'DocuSign' | 'Adobe Sign' | 'HelloSign' | 'PandaDoc';
  envelopeTitle: string;
  envelopesCount: number;
  status: 'pending' | 'converting' | 'completed';
  convertedAt?: string;
  auditTrailPreserved: boolean;
  sha256Hash: string;
}

export const LegacyMigrationImporterView: React.FC = () => {
  const { notify, createNewEnvelope } = useSignFlow();

  const [selectedPlatform, setSelectedPlatform] = useState<'DocuSign' | 'Adobe Sign' | 'HelloSign' | 'PandaDoc'>('DocuSign');
  const [migrationJobs, setMigrationJobs] = useState<MigrationJob[]>([
    {
      id: 'mig-1',
      sourcePlatform: 'DocuSign',
      envelopeTitle: 'DocuSign Q4 Enterprise Master Archive',
      envelopesCount: 142,
      status: 'completed',
      convertedAt: 'Yesterday • 4:15 PM',
      auditTrailPreserved: true,
      sha256Hash: '9f82ab4102948bb109e248c8949102b4a18e0019283f9821'
    },
    {
      id: 'mig-2',
      sourcePlatform: 'Adobe Sign',
      envelopeTitle: 'Adobe Sign NDAs & Contractor Agreements',
      envelopesCount: 88,
      status: 'completed',
      convertedAt: '3 days ago',
      auditTrailPreserved: true,
      sha256Hash: '881ab92c01994e810a9c8192739281a02938475910294812'
    },
    {
      id: 'mig-3',
      sourcePlatform: 'HelloSign',
      envelopeTitle: 'HelloSign Executive Offer Letters 2025-2026',
      envelopesCount: 45,
      status: 'completed',
      convertedAt: '5 days ago',
      auditTrailPreserved: true,
      sha256Hash: 'c719e0819283410294819a827361928475910294810293841'
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [conversionStep, setConversionStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState(0);

  const handleSimulateUpload = () => {
    setIsProcessing(true);
    setProgressPercent(15);
    setConversionStep('1/4 Parsing legacy metadata & audit trail XML...');

    setTimeout(() => {
      setProgressPercent(45);
      setConversionStep('2/4 Extracting embedded signatures & signer certificates...');
    }, 600);

    setTimeout(() => {
      setProgressPercent(80);
      setConversionStep('3/4 Re-anchoring SHA-256 Merkle chain non-repudiation stamps...');
    }, 1200);

    setTimeout(() => {
      setProgressPercent(100);
      setConversionStep('4/4 Creating SignFlow Native Envelopes...');
      
      const newJob: MigrationJob = {
        id: 'mig-' + (migrationJobs.length + 1),
        sourcePlatform: selectedPlatform,
        envelopeTitle: `${selectedPlatform} Active Template & Signed Vault Export`,
        envelopesCount: selectedPlatform === 'DocuSign' ? 64 : selectedPlatform === 'Adobe Sign' ? 48 : 32,
        status: 'completed',
        convertedAt: 'Just now',
        auditTrailPreserved: true,
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      };

      setMigrationJobs(prev => [newJob, ...prev]);
      setIsProcessing(false);
      setProgressPercent(0);
      setConversionStep('');
      notify('success', 'Legacy Migration Completed!', `${newJob.envelopesCount} ${selectedPlatform} envelopes converted to SignFlow format with unbroken SHA-256 audit trails.`);
    }, 1800);
  };

  const handleExportManifest = (job: MigrationJob) => {
    const payload = {
      manifestId: job.id,
      platform: job.sourcePlatform,
      title: job.envelopeTitle,
      envelopesCount: job.envelopesCount,
      convertedAt: job.convertedAt,
      rootSha256: job.sha256Hash,
      complianceStatus: 'US ESIGN Act §101 & EU eIDAS Qualified Legacy Import Validated'
    };
    downloadJsonBundle(`SignFlow-Migration-Manifest-${job.id}.json`, payload);
    notify('success', 'Manifest Exported', `Downloaded migration receipt for ${job.envelopeTitle}.`);
  };

  const handleImportToVault = (job: MigrationJob) => {
    createNewEnvelope({
      title: `[Migrated from ${job.sourcePlatform}] ${job.envelopeTitle}`,
      description: `Imported historical agreement batch containing ${job.envelopesCount} executed records with preserved Merkle audit trail.`,
      tags: ['Migrated', job.sourcePlatform, 'Legacy-Archive']
    });
    notify('success', 'Imported into Envelopes Vault', `Created live reference envelope in SignFlow Vault.`);
  };

  const totalMigratedEnvelopes = migrationJobs.reduce((acc, curr) => acc + curr.envelopesCount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400">
            <UploadCloud className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              Legacy DocuSign & Adobe Sign Migration Assistant
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Migrate legacy templates, active envelopes, and signed PDF archives into SignFlow while preserving original cryptographic evidence and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleSimulateUpload}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Converting Archives...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Import {selectedPlatform} Bundle</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Migration Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Total Envelopes Migrated</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-display text-white">{totalMigratedEnvelopes}</span>
            <span className="text-xs text-emerald-400 font-semibold">100% Retained</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Legacy Platforms Supported</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-display text-indigo-400">4 Platforms</span>
            <span className="text-xs text-slate-400 font-mono">DocuSign, Adobe, HelloSign, PandaDoc</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Audit Chain Integrity</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-display text-emerald-400">SHA-256 Merkle</span>
            <span className="text-xs text-emerald-300 font-mono">Zero Chain Breaks</span>
          </div>
        </div>
      </div>

      {/* Migration Dropzone & Jobs List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upload Box & Platform Selection */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">1. Select Source Platform</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {(['DocuSign', 'Adobe Sign', 'HelloSign', 'PandaDoc'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                    selectedPlatform === p
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/80 border-2 border-dashed border-slate-800 text-center space-y-3 mt-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
                <FileArchive className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Drop {selectedPlatform} Archive File</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Supports .zip, .json export, or .csv batch manifest</p>
              </div>
              <button
                onClick={handleSimulateUpload}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer w-full"
              >
                Select File & Run Converter
              </button>
            </div>
          </div>

          {isProcessing && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-indigo-300 font-medium">
                <span>{conversionStep}</span>
                <span className="font-mono">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Converted Jobs Table */}
        <div className="lg:col-span-2 bg-slate-900/70 rounded-3xl border border-slate-800 shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Imported Legacy Archives ({migrationJobs.length})</h3>
            <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
              100% Audit Trail Retention
            </span>
          </div>

          <div className="space-y-3">
            {migrationJobs.map(job => (
              <div key={job.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase ${
                        job.sourcePlatform === 'DocuSign' ? 'bg-blue-950 text-blue-400 border border-blue-800/40' :
                        job.sourcePlatform === 'Adobe Sign' ? 'bg-red-950 text-red-400 border border-red-800/40' :
                        job.sourcePlatform === 'HelloSign' ? 'bg-amber-950 text-amber-400 border border-amber-800/40' :
                        'bg-purple-950 text-purple-400 border border-purple-800/40'
                      }`}>
                        {job.sourcePlatform}
                      </span>
                      <h4 className="font-bold text-slate-100">{job.envelopeTitle}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400">{job.envelopesCount} Envelopes Converted • {job.convertedAt}</p>
                    <p className="text-[10px] font-mono text-slate-500 truncate max-w-md">Root Hash: {job.sha256Hash}</p>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    <button
                      onClick={() => handleImportToVault(job)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1 transition-all cursor-pointer"
                      title="Create Vault Envelope"
                    >
                      <Play className="w-3 h-3" />
                      <span>Open in Vault</span>
                    </button>
                    <button
                      onClick={() => handleExportManifest(job)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="Download Manifest JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/60 text-emerald-400 font-semibold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Cryptographic evidence sealed & verifiable under US ESIGN Act §101</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
