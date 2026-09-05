import React from 'react';
import { BookOpen, ShieldCheck, Download, Search, FileText, CheckCircle2 } from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { downloadCsvFile } from '../../utils/downloadUtils';

export const NotaryJournalView: React.FC = () => {
  const { notaryJournal, notify } = useSignFlow();

  const handleExportJournal = () => {
    const csvRows = [
      ['Official Electronic Notary Journal', 'Statutory Retention Ledger'],
      ['Export Date', new Date().toISOString()],
      [],
      ['Entry ID', 'Document Title', 'Signer Name', 'Signer Email', 'IDV Method', 'Proof Code', 'Notarial Act', 'Fee', 'Recording Archive ID', 'Signature Hash', 'Timestamp'],
      ...notaryJournal.map(e => [
        e.id,
        e.documentTitle,
        e.signerName,
        e.signerEmail,
        e.idvMethod,
        e.idvProofCode,
        e.notarialAct,
        e.fee,
        e.recordingArchiveId,
        e.notarySignatureHash,
        e.timestamp
      ])
    ];
    downloadCsvFile('SignFlow-Official-Notary-Journal.csv', csvRows);
    notify('success', 'Journal Exported', 'Downloaded signed CSV of electronic notary journal entries.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              Official Electronic Notary Journal
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Immutable, statutory log of all remote notarial acts, signer verification hashes, and recording archives.
          </p>
        </div>

        <button
          onClick={handleExportJournal}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export Statutory Journal</span>
        </button>
      </div>

      {/* Journal Entries Table */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Notarial Ledger Records ({notaryJournal.length})
          </span>
          <span className="text-[10px] text-slate-500 font-mono">10-Year Statutory Retention Enforced</span>
        </div>

        <div className="space-y-3">
          {notaryJournal.map((entry) => (
            <div
              key={entry.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FileText className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{entry.documentTitle}</h4>
                    <p className="text-[10px] text-slate-400">
                      Signer: <strong className="text-slate-300">{entry.signerName}</strong> ({entry.signerEmail})
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-right">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-mono uppercase">
                      {entry.notarialAct}
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{entry.timestamp}</p>
                  </div>
                  <span className="text-sm font-bold font-mono text-white">{entry.fee}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                <div>
                  <span className="text-slate-500">IDV Verification Proof: </span>
                  <span className="text-indigo-300 font-mono text-[10px]">{entry.idvProofCode}</span>
                </div>
                <div>
                  <span className="text-slate-500">A/V Archive ID: </span>
                  <span className="text-slate-300 font-mono text-[10px]">{entry.recordingArchiveId}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
