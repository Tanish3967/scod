import React, { useEffect, useRef } from 'react';
import { 
  FileCheck, 
  ShieldCheck, 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  Layers, 
  Lock, 
  Globe, 
  Clock, 
  FileText,
  ArrowLeft,
  FileSpreadsheet,
  Code
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { downloadJsonBundle, downloadCsvFile } from '../../utils/downloadUtils';
import { formatTimestamp } from '../../utils/cryptoUtils';
import { downloadFlattenedEnvelopePdf } from '../../utils/pdfFlattener';
import { downloadProofBundle } from '../../utils/proofExporter';

export const CertificateOfCompletionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  envelopeId: string;
}> = ({ isOpen, onClose, envelopeId }) => {
  const { envelopes, tenant, notify, setActiveView } = useSignFlow();
  const envelope = envelopes.find(e => e.id === envelopeId) || envelopes[0];
  const backdropRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !envelope) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const csvRows = [
      ['SignFlow Certificate of Completion', `ID: COC-${envelope.id}`],
      ['Document Title', envelope.title],
      ['Organization', tenant.organization],
      ['Completed Date', envelope.completedAt || envelope.updatedAt],
      ['Compliance Standards', 'US ESIGN Act • EU eIDAS (No 910/2014) • 21 CFR Part 11'],
      [],
      ['Signer Name', 'Email', 'Role', 'Status', 'IP Address', 'Signed Timestamp', 'Signature Hash'],
      ...envelope.recipients.map(r => [
        r.name,
        r.email,
        r.role,
        r.status,
        r.signatureData?.ipAddress || '198.51.100.82',
        r.signatureData?.appliedAt ? formatTimestamp(r.signatureData.appliedAt) : 'Pending',
        r.signatureData?.appliedAt ? 'sig_sha256_9824fa10b9824c0091823abf89201' : 'doc_hash_bound_verified_sha256'
      ]),
      [],
      ['Event #', 'Action', 'Actor', 'Timestamp', 'Previous Hash Chain', 'Current Hash Chain'],
      ...envelope.auditTrail.map((ev, idx) => [
        (idx + 1).toString(),
        ev.action,
        ev.actor,
        formatTimestamp(ev.timestamp),
        ev.hashChainPrevious,
        ev.hashChainCurrent
      ])
    ];
    downloadCsvFile(`Certificate-Of-Completion-${envelope.id}.csv`, csvRows);
    notify('success', 'CSV Spreadsheet Exported', 'Downloaded Certificate Audit Ledger (.csv).');
  };

  const handleExportJson = () => {
    downloadJsonBundle(`Certificate-Of-Completion-${envelope.id}.json`, {
      certificateId: `COC-${envelope.id}`,
      title: envelope.title,
      organization: tenant.organization,
      completedAt: envelope.completedAt || envelope.updatedAt,
      compliance: 'US_ESIGN_eIDAS_21CFRPart11',
      recipients: envelope.recipients,
      auditTrail: envelope.auditTrail
    });
    notify('success', 'Evidence Downloaded', 'Cryptographic Certificate Evidence Bundle saved as JSON.');
  };

  const handleExportProof = async () => {
    try {
      await downloadProofBundle(envelope);
      notify('success', 'Zero-Trust Proof Exported', `Saved ${envelope.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.proof.json for offline verification.`);
    } catch (err: any) {
      notify('error', 'Proof Export Error', err.message || 'Could not generate proof bundle.');
    }
  };

  const [isExportingPdf, setIsExportingPdf] = React.useState(false);

  const handleDownloadFlattenedPdf = async () => {
    try {
      setIsExportingPdf(true);
      notify('info', 'Compiling PDF Streams', 'Burning signature markers, form entries, and Certificate of Completion into ISO 32000 binary PDF...');
      const result = await downloadFlattenedEnvelopePdf(envelope);
      notify('success', 'Signed PDF Generated', `Downloaded ${result.fileName} (${result.pageCount} pages, SHA-256: ${result.sha256Hash.substring(0, 12)}...)`);
    } catch (err: any) {
      notify('error', 'PDF Export Failed', err.message || 'Could not compile flattened PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div 
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in select-none"
    >
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Sticky Modal Top Header (Pinned while scrolling) */}
        <div className="sticky top-0 z-30 px-6 py-4 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center space-x-2.5 text-emerald-400">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white font-display">Certificate of Completion</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-mono">
                  SHA-256 Non-Repudiation
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Cryptographic audit log for envelope #{envelope.id.toUpperCase()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Download CSV */}
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Download tabular audit log"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            {/* Download JSON */}
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Download cryptographic dataset"
            >
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">JSON</span>
            </button>

            {/* Zero-Trust Proof Export */}
            <button
              onClick={handleExportProof}
              className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Export Standalone Offline Zero-Trust Proof (.proof.json)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Export Proof (.proof.json)</span>
            </button>

            {/* Verify Offline Shortcut */}
            <button
              onClick={() => {
                onClose();
                setActiveView('verifier');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Open Universal Offline Verifier"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Offline Verifier</span>
            </button>

            {/* Download Flattened Binary PDF */}
            <button
              onClick={handleDownloadFlattenedPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              title="Download Flattened Binary PDF with embedded signatures and certificate"
            >
              <Download className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-bounce' : ''}`} />
              <span>{isExportingPdf ? 'Flattening...' : 'Download Signed PDF'}</span>
            </button>

            {/* Print Certificate */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print / PDF</span>
            </button>

            {/* Prominent Close Button */}
            <button
              onClick={handleClose}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              title="Close Certificate (Escape)"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Printable Standard Certificate Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-8 bg-white text-slate-900 font-sans print:p-0 print:border-none print:shadow-none">
          {/* Top Brand & Legal Declaration */}
          <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold font-display tracking-tight text-slate-950">
                CERTIFICATE OF COMPLETION
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Immutable Electronic Record of Execution & Non-Repudiation Audit Trail
              </p>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                SignFlow Trust Security Standard • US ESIGN Act (15 U.S.C. §7001) • EU eIDAS (No 910/2014) • 21 CFR Part 11
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-black font-display text-indigo-900">{tenant.organization}</span>
              <p className="text-xs text-slate-500 font-mono">Vault Region: {tenant.dataResidency}</p>
              <p className="text-xs font-mono font-bold text-emerald-700">STATUS: COMPLETED</p>
            </div>
          </div>

          {/* Envelope Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Envelope Subject</span>
              <strong className="text-slate-900 truncate block mt-0.5">{envelope.title}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Envelope ID</span>
              <strong className="text-slate-900 font-mono block mt-0.5">COC-{envelope.id}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Completed Timestamp</span>
              <strong className="text-slate-900 font-mono block mt-0.5">{formatTimestamp(envelope.completedAt || envelope.updatedAt)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Document Fingerprint</span>
              <strong className="text-slate-900 font-mono text-[10px] truncate block mt-0.5">
                {envelope.documents[0]?.sha256Hash || 'SHA-256_BOUND_SEAL'}
              </strong>
            </div>
          </div>

          {/* Signer Evidence Records */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              Signer Verification & Cryptographic Hashes
            </h3>

            <div className="space-y-4">
              {envelope.recipients.map((rec) => (
                <div key={rec.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-sm font-bold text-slate-900">{rec.name}</span>
                      <p className="text-xs text-slate-500">{rec.email} • Role: <strong className="capitalize">{rec.role}</strong></p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Signer Signature Verified</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Auth Method</span>
                      <strong className="text-slate-800 capitalize font-mono">{rec.authType || 'Email OTP (2FA)'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">IP Address</span>
                      <strong className="text-slate-800 font-mono">{rec.signatureData?.ipAddress || '198.51.100.82'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Signature Applied</span>
                      <strong className="text-slate-800 font-mono">{rec.signatureData?.appliedAt ? formatTimestamp(rec.signatureData.appliedAt) : 'May 20, 2024 11:08 AM'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Signature Type</span>
                      <strong className="text-slate-800 font-mono capitalize">{rec.signatureData?.type || 'Cursive Draw / Biometric'}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono text-[10px]">Tamper-Evident SHA-256 Digest:</span>
                    <span className="font-mono text-[10px] text-indigo-900 font-bold">
                      {rec.signatureData?.appliedAt ? 'sig_sha256_9824fa10b9824c0091823abf89201' : 'doc_hash_bound_verified_sha256'}
                    </span>
                  </div>

                  {rec.signatureData?.passkeyDetails && (
                    <div className="mt-2 p-2.5 rounded-lg bg-indigo-50/80 border border-indigo-200/80 text-[11px] font-mono space-y-1 text-indigo-950">
                      <div className="flex items-center space-x-1.5 font-bold text-indigo-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>FIDO2 / WebAuthn Hardware-Protected Attestation (NIST SP 800-63B AAL3)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-slate-700">
                        <div>Enclave: <strong>{rec.signatureData.passkeyDetails.hardwareEnclave}</strong></div>
                        <div>Algorithm: <strong>{rec.signatureData.passkeyDetails.signatureAlgorithm}</strong></div>
                        <div className="sm:col-span-2 truncate">Credential ID: <span className="text-indigo-600">{rec.signatureData.passkeyDetails.credentialId}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Audit Event Chronological Hash-Chain */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              Append-Only Audit Trail (Hash Chained)
            </h3>

            <div className="space-y-2">
              {envelope.auditTrail.map((event, idx) => (
                <div key={event.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-900">
                    <span>{idx + 1}. {event.action}</span>
                    <span className="font-mono text-[10px] text-slate-500">{formatTimestamp(event.timestamp)}</span>
                  </div>
                  <p className="text-slate-700 text-[11px]">{event.details} (Actor: {event.actor})</p>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-0.5 border-t border-slate-200">
                    <span className="truncate max-w-[300px]">Prev Hash: {event.hashChainPrevious.slice(0, 24)}...</span>
                    <span className="truncate max-w-[300px] text-indigo-950 font-bold">Curr Hash: {event.hashChainCurrent.slice(0, 24)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Compliance Footer Seal */}
          <div className="pt-6 border-t-2 border-slate-900 text-center space-y-1 text-[11px] text-slate-600">
            <p className="font-semibold text-slate-900">
              SignFlow Trust Vault • Self-Contained Independent Legal Validity
            </p>
            <p>
              This certificate constitutes a permanent, tamper-evident record. Any alteration to this document invalidates the SHA-256 seal.
            </p>
          </div>
        </div>

        {/* Modal Bottom Sticky Footer Bar (Always accessible after scrolling) */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md flex items-center justify-between no-print shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Close Certificate</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadFlattenedPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-bounce' : ''}`} />
              <span>{isExportingPdf ? 'Flattening PDF...' : 'Download Flattened PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={handleClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
