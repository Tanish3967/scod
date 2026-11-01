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
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">
              EU eIDAS Qualified Electronic Signature (QES) & TSP Hub
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Tier 3 Qualified Signatures backed by European Union Trusted Lists (EUTL) & Remote HSM hardware tokens.
            </p>
          </div>
        </div>

        <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-mono font-semibold self-start sm:self-auto">
          <Award className="w-4 h-4 text-blue-600" />
          <span>eIDAS Regulation (EU) No 910/2014</span>
        </span>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hardware Token & TSP Form */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <div className="flex items-center space-x-2.5 pb-1 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Trust Service Provider (TSP) Connection</h3>
              <p className="text-[11px] text-slate-400">eIDAS Article 28 certified trust anchor</p>
            </div>
          </div>

          <div className="space-y-3.5 pt-1">
            <div>
              <label className="text-slate-700 block mb-1 font-semibold">Qualified Trust Service Provider (QTSP)</label>
              <select
                value={selectedTSP}
                onChange={(e) => setSelectedTSP(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
              >
                <option value="D-Trust GmbH (Germany / EUTL)">D-Trust GmbH (Germany / EUTL Certified)</option>
                <option value="InfoCert S.p.A. (Italy / EUTL)">InfoCert S.p.A. (Italy / EUTL Certified)</option>
                <option value="Swisscom Trust Services (Switzerland/EU)">Swisscom Trust Services (EU / Swiss Law)</option>
                <option value="SignFlow EU Qualified TSP Node">SignFlow Dedicated EU QTSP Node</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 block mb-1 font-semibold">Signer Qualified PIN / Remote HSM Token</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono tracking-widest focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span className="font-medium text-slate-500">Cryptographic Key Type:</span>
                <span className="font-mono font-bold text-slate-800">RSA-4096 / ECDSA P-384</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-500">EUTL Status:</span>
                <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Active on EU Trusted List</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-500">Signature Format:</span>
                <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">PAdES-B-LTA (Long-Term Validation)</span>
              </div>
            </div>

            <button
              onClick={handleTestQES}
              disabled={isVerifying}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs hover:shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
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
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">X.509 Qualified Certificate Chain</h3>
                <p className="text-[11px] text-slate-400">Cryptographic PKI trust path</p>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
              ✓ Valid CRL / OCSP
            </span>
          </div>

          <div className="space-y-3 text-xs pt-1">
            {/* Root CA */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>1. Root CA: European Union Trusted Root</span>
                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Trusted Anchor</span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">SHA-256: 8941a029fe883019ab921c4409bb1082</p>
            </div>

            {/* Intermediate CA */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>2. Intermediate CA: {selectedTSP.split(' ')[0]} QTSP CA</span>
                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">eIDAS Certified</span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">Subject: CN={selectedTSP.split(' ')[0]} Qualified CA 2026</p>
            </div>

            {/* Signer End Certificate */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1 text-blue-950">
              <div className="flex items-center justify-between font-bold text-blue-900">
                <span>3. End Entity: Sarah Jenkins (SignFlow Signer)</span>
                <span className="font-mono text-[10px] text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">Personal QES Certificate</span>
              </div>
              <p className="text-[10px] font-mono text-blue-600/80">Serial: SF-QES-2026-881940182 • Valid to 2029</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
