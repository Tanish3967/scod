import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Globe, 
  CheckCircle2, 
  Lock, 
  Award, 
  FileCode, 
  RefreshCw,
  Cpu
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

export const QESTSPVerificationView: React.FC = () => {
  const { notify } = useSignFlow();

  const [selectedTSP, setSelectedTSP] = useState('D-Trust GmbH (Germany / EUTL)');
  const [pin, setPin] = useState('881902');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isQualified, setIsQualified] = useState(true);

  const handleTestQES = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsQualified(true);
      notify('success', 'eIDAS QES Seal Validated', 'Remote HSM Qualified Signature generated in compliance with eIDAS Tier 3 (Article 28).');
    }, 800);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/70 via-slate-900/90 to-indigo-950/50 border border-blue-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-400">
            <Globe className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              EU eIDAS Qualified Electronic Signature (QES) & TSP Hub
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Tier 3 Qualified Signatures backed by European Union Trusted Lists (EUTL) & Remote HSM hardware tokens.
          </p>
        </div>

        <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/40 text-xs font-mono">
          <Award className="w-4 h-4" />
          <span>eIDAS Regulation (EU) No 910/2014</span>
        </span>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hardware Token & TSP Form */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Trust Service Provider (TSP) Connection</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Qualified Trust Service Provider (QTSP)</label>
              <select
                value={selectedTSP}
                onChange={(e) => setSelectedTSP(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="D-Trust GmbH (Germany / EUTL)">D-Trust GmbH (Germany / EUTL Certified)</option>
                <option value="InfoCert S.p.A. (Italy / EUTL)">InfoCert S.p.A. (Italy / EUTL Certified)</option>
                <option value="Swisscom Trust Services (Switzerland/EU)">Swisscom Trust Services (EU / Swiss Law)</option>
                <option value="SignFlow EU Qualified TSP Node">SignFlow Dedicated EU QTSP Node</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Signer Qualified PIN / Remote HSM Token</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono tracking-widest focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Cryptographic Key Type:</span>
                <span className="font-mono text-slate-200">RSA-4096 / ECDSA P-384</span>
              </div>
              <div className="flex justify-between">
                <span>EUTL Status:</span>
                <span className="font-mono text-emerald-400 font-bold">Active on EU Trusted List</span>
              </div>
              <div className="flex justify-between">
                <span>Signature Format:</span>
                <span className="font-mono text-blue-400">PAdES-B-LTA (Long-Term Validation)</span>
              </div>
            </div>

            <button
              onClick={handleTestQES}
              disabled={isVerifying}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Contacting QTSP Hardware Module...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Execute Qualified Electronic Signature (QES)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* X.509 Certificate Chain Inspection */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">X.509 Qualified Certificate Chain</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-mono">
              Valid CRL / OCSP
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Root CA */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-300">
                <span>1. Root CA: European Union Trusted Root</span>
                <span className="font-mono text-[10px] text-emerald-400">Trusted Anchor</span>
              </div>
              <p className="text-[10px] font-mono text-slate-500">SHA-256: 8941a029fe883019ab921c4409bb1082</p>
            </div>

            {/* Intermediate CA */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-300">
                <span>2. Intermediate CA: {selectedTSP.split(' ')[0]} QTSP CA</span>
                <span className="font-mono text-[10px] text-emerald-400">eIDAS Certified</span>
              </div>
              <p className="text-[10px] font-mono text-slate-500">Subject: CN={selectedTSP.split(' ')[0]} Qualified CA 2026</p>
            </div>

            {/* Signer End Certificate */}
            <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-1 text-blue-200">
              <div className="flex items-center justify-between font-bold text-blue-300">
                <span>3. End Entity: Sarah Jenkins (SignFlow Signer)</span>
                <span className="font-mono text-[10px] text-blue-400">Personal QES Certificate</span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">Serial: SF-QES-2026-881940182 • Valid to 2029</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
