import React, { useState } from 'react';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Stamp, 
  ShieldCheck, 
  CheckCircle2, 
  Users, 
  FileText, 
  Clock, 
  AlertCircle,
  Award
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { IDVBiometricCheckModal } from './IDVBiometricCheckModal';

export const NotarySessionView: React.FC = () => {
  const { notarySessions, affixNotarySeal, startNotarySession, notify } = useSignFlow();
  const session = notarySessions[0];

  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [isIDVVerified, setIsIDVVerified] = useState(true);
  const [showIDVModal, setShowIDVModal] = useState(false);
  const [sealAffixed, setSealAffixed] = useState(session?.status === 'seal_affixed');

  if (!session) {
    return <div className="p-8 text-center text-slate-400">No active RON session scheduled.</div>;
  }

  const handleAffixSeal = () => {
    affixNotarySeal(session.id, {
      notaryPublicName: session.notaryName,
      county: 'Travis',
      state: 'Texas',
      commissionExpires: '2028-11-15'
    });
    setSealAffixed(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-indigo-950/50 border border-emerald-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400">
            <Stamp className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              Remote Online Notarization (RON) Studio
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Live multi-party audio/video session with official notarial journal & digital seal application.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>1080p Encrypted Session</span>
          </span>
        </div>
      </div>

      {/* Split Video Session Room & Notary Action Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Feeds (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Signer Feed */}
            <div className="relative rounded-2xl bg-slate-900 border border-slate-800 h-64 overflow-hidden flex items-center justify-center shadow-lg">
              {videoOn ? (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-950 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-indigo-600/30 border-2 border-indigo-400/50 flex items-center justify-center text-white font-bold text-2xl mb-2">
                    MV
                  </div>
                  <h4 className="text-xs font-bold text-white">Marcus Vance (Signer)</h4>
                  <p className="text-[10px] text-slate-400">Client Signer • Austin, Texas</p>
                </div>
              ) : (
                <div className="text-slate-500 text-xs">Video Feed Paused</div>
              )}

              {/* Status Badge */}
              <div className="absolute top-3 left-3 flex items-center space-x-1 bg-slate-950/80 px-2 py-1 rounded-md text-[10px] text-slate-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Connected (WebRTC)</span>
              </div>

              {/* IDV Badge */}
              <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-emerald-950/90 border border-emerald-800/60 px-2 py-1 rounded-md text-[10px] text-emerald-400 font-mono">
                <ShieldCheck className="w-3 h-3" />
                <span>IDV Biometric Pass (99.6%)</span>
              </div>
            </div>

            {/* Notary Officer Feed */}
            <div className="relative rounded-2xl bg-slate-900 border border-slate-800 h-64 overflow-hidden flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-950 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-600/30 border-2 border-emerald-400/50 flex items-center justify-center text-white font-bold text-2xl mb-2">
                  CB
                </div>
                <h4 className="text-xs font-bold text-white">{session.notaryName}</h4>
                <p className="text-[10px] text-slate-400">Commission #{session.commissionNumber} ({session.jurisdiction})</p>
              </div>

              {/* Official Seal badge */}
              <div className="absolute top-3 right-3 flex items-center space-x-1 bg-emerald-950/80 border border-emerald-800/60 px-2 py-1 rounded-md text-[10px] text-emerald-400 font-mono">
                <Award className="w-3 h-3" />
                <span>Active State Commission</span>
              </div>
            </div>
          </div>

          {/* Video Control Bar */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center space-x-4">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`p-3 rounded-xl transition-all ${
                micOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
              }`}
            >
              {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setVideoOn(!videoOn)}
              className={`p-3 rounded-xl transition-all ${
                videoOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
              }`}
            >
              {videoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowIDVModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Biometric ID</span>
            </button>
          </div>
        </div>

        {/* Notary Public Console & Seal Stamping (1 Col) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <Stamp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Notary Public Console</h3>
          </div>

          {/* Notarial Certificate Checklist */}
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-300">
              <span>Signer Identity Confirmation:</span>
              <span className="text-emerald-400 font-semibold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Passed
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-300">
              <span>Credential Analysis (IDV):</span>
              <span className="text-emerald-400 font-semibold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-300">
              <span>Audio/Video Recording:</span>
              <span className="text-emerald-400 font-mono text-[10px]">Archived (10-Yr Ret.)</span>
            </div>
          </div>

          {/* Official Digital Seal Graphic */}
          <div className="p-4 rounded-xl bg-white text-slate-900 border-2 border-emerald-600 text-center space-y-1 shadow-md">
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-900 border-b border-emerald-200 pb-1">
              NOTARY PUBLIC, STATE OF TEXAS
            </div>
            <div className="text-xs font-serif font-black uppercase text-slate-900">
              {session.sealDetails.notaryPublicName}
            </div>
            <div className="text-[9px] font-mono text-slate-700">
              Commission ID: {session.commissionNumber}
            </div>
            <div className="text-[9px] font-mono text-slate-700">
              My Commission Expires: {session.sealDetails.commissionExpires}
            </div>
            {sealAffixed && (
              <div className="mt-1 inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px] uppercase">
                ✓ AFFIXED & HASH-LOCKED
              </div>
            )}
          </div>

          {/* Action to Affix Seal */}
          <button
            onClick={handleAffixSeal}
            disabled={sealAffixed}
            className={`w-full py-3 rounded-xl text-xs font-bold shadow-lg flex items-center justify-center space-x-2 transition-all ${
              sealAffixed
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:scale-[1.02]'
            }`}
          >
            <Stamp className="w-4 h-4" />
            <span>{sealAffixed ? 'Digital Seal Permanently Affixed' : 'Affix Official Notary Seal'}</span>
          </button>
        </div>
      </div>

      <IDVBiometricCheckModal
        isOpen={showIDVModal}
        onClose={() => setShowIDVModal(false)}
        onVerified={() => {
          setIsIDVVerified(true);
          notify('success', 'Biometrics Verified', 'Identity proof added to electronic notary journal.');
        }}
        signerName="Marcus Vance"
      />
    </div>
  );
};
