import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileCheck, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lock, 
  Fingerprint, 
  Terminal, 
  Sparkles, 
  ArrowLeft, 
  Layers, 
  Hash, 
  ExternalLink,
  Download
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { ZeroTrustProofBundle } from '../../types/signflow';
import { verifyZeroTrustProofOffline, generateZeroTrustProofBundle } from '../../utils/proofExporter';
import { formatTimestamp } from '../../utils/cryptoUtils';

export const UniversalProofVerifierView: React.FC = () => {
  const { setActiveView, activeEnvelope, envelopes } = useSignFlow();

  const [proofBundle, setProofBundle] = useState<ZeroTrustProofBundle | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    merkleTreeValid: boolean;
    hashChainValid: boolean;
    signaturesValid: boolean;
    contentIntegrityValid: boolean;
    errors: string[];
    details: any;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleRunVerification = async (bundle: ZeroTrustProofBundle) => {
    setIsVerifying(true);
    setProofBundle(bundle);
    try {
      const result = await verifyZeroTrustProofOffline(bundle);
      setVerificationResult(result);
    } catch (err: any) {
      setVerificationResult({
        valid: false,
        merkleTreeValid: false,
        hashChainValid: false,
        signaturesValid: false,
        contentIntegrityValid: false,
        errors: [err?.message || 'Verification calculation failed'],
        details: { verifiedAt: new Date().toISOString() }
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        handleRunVerification(json);
      } catch (err) {
        alert('Invalid JSON file format. Please upload a valid contract.proof.json file.');
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSampleProof = async () => {
    const targetEnv = activeEnvelope || envelopes[0];
    if (!targetEnv) return;
    const sample = await generateZeroTrustProofBundle(targetEnv);
    handleRunVerification(sample);
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/50 shadow-2xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">
                Zero-Trust Universal Cryptographic Verifier
              </h2>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                RFC-3161 & Merkle Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              100% Offline client-side verification. Validates Merkle tree hashes, signer non-repudiation, and tamper seals without contacting SignFlow servers.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={handleLoadSampleProof}
            className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Load Active Envelope Proof</span>
          </button>
          <button
            onClick={() => setActiveView('dashboard')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Dropzone Container */}
      {!proofBundle && (
        <div 
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const file = e.dataTransfer.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                try {
                  const json = JSON.parse(event.target?.result as string);
                  handleRunVerification(json);
                } catch {
                  alert('Invalid JSON file format.');
                }
              };
              reader.readAsText(file);
            }
          }}
          className={`p-12 rounded-3xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center space-y-4 ${
            dragActive 
              ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]' 
              : 'border-slate-300 bg-slate-50/60 hover:bg-slate-50'
          }`}
        >
          <div className="w-16 h-16 rounded-3xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center shadow-xs">
            <Upload className="w-8 h-8 stroke-[1.75]" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-sm font-bold text-slate-800">
              Drag & Drop <span className="font-mono text-indigo-600">contract.proof.json</span> Here
            </h3>
            <p className="text-xs text-slate-500">
              Or select a proof bundle exported from the Certificate of Completion modal.
            </p>
          </div>
          <label className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-all shadow-md">
            <span>Browse Proof File</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}

      {/* Verification Results Panel */}
      {proofBundle && verificationResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Verification Status Badge */}
          <div className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            verificationResult.valid 
              ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-100 shadow-emerald-900/20' 
              : 'bg-rose-950/90 border-rose-500/60 text-rose-100 shadow-rose-900/20'
          }`}>
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                verificationResult.valid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40' : 'bg-rose-500/20 text-rose-400 border border-rose-400/40'
              }`}>
                {verificationResult.valid ? <CheckCircle2 className="w-8 h-8 stroke-[2.5]" /> : <XCircle className="w-8 h-8 stroke-[2.5]" />}
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight">
                  {verificationResult.valid ? '✓ 100% CRYPTOGRAPHICALLY VALID & TAMPER-FREE' : '✗ VERIFICATION FAILED'}
                </h3>
                <p className="text-xs opacity-90 mt-0.5 font-mono">
                  Verification Code: {proofBundle.tamperProofVerificationCode}
                </p>
              </div>
            </div>

            <button
              onClick={() => { setProofBundle(null); setVerificationResult(null); }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer shrink-0"
            >
              Verify Another Document
            </button>
          </div>

          {/* 4-Pillar Cryptographic Checklist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Merkle Tree Integrity</span>
                {verificationResult.merkleTreeValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
              </div>
              <p className="text-[11px] text-slate-500">
                {verificationResult.details.totalLeafNodes} leaves recomputed to root hash.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Ledger Hash Continuity</span>
                {verificationResult.hashChainValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
              </div>
              <p className="text-[11px] text-slate-500">
                {verificationResult.details.totalLedgerBlocks} chronological blocks unbroken.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Signer Non-Repudiation</span>
                {verificationResult.signaturesValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
              </div>
              <p className="text-[11px] text-slate-500">
                {verificationResult.details.totalSignatures} authenticated signatory credentials.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Document Digest Check</span>
                {verificationResult.contentIntegrityValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
              </div>
              <p className="text-[11px] text-slate-500">
                SHA-256 binary page matching active.
              </p>
            </div>
          </div>

          {/* Technical Evidence Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Merkle Leaf Nodes Table */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Merkle Tree Leaf Evidence ({proofBundle.leafNodes.length})</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Pairwise SHA-256</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {proofBundle.leafNodes.map((leaf, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 text-[11px]">{leaf.identifier}</div>
                      <div className="font-mono text-[9px] text-slate-500 truncate max-w-xs">{leaf.sha256Hash}</div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      Leaf #{leaf.index}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Signatory Non-Repudiation Credentials */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Fingerprint className="w-4 h-4 text-purple-600" />
                  <span>Signatory Cryptographic Identities ({proofBundle.actorSignatures.length})</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">ESIGN / eIDAS Tier 3</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {proofBundle.actorSignatures.map((sig, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px]">{sig.name} ({sig.role.toUpperCase()})</span>
                      <span className="text-[9px] font-mono px-2 py-0.2 rounded-full bg-slate-200 text-slate-700">
                        {sig.authType}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Timestamp: {formatTimestamp(sig.appliedAt)} | IP: {sig.ipAddress}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CLI Instructions Snippet */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300 font-mono">
                Verify this proof in any terminal: <strong className="text-emerald-400 font-semibold">npm run verify -- &lt;proof.json&gt;</strong>
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono shrink-0">
              30+ Year Long-Term Validation (LTV)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
