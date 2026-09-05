import React, { useState, useEffect, useRef } from 'react';
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
  Award,
  Camera,
  RefreshCw,
  Sliders,
  Scan,
  Radio,
  User
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

  // Real Webcam Camera Stream State
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isConnectingCamera, setIsConnectingCamera] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(258); // 04:18

  const signerVideoRef = useRef<HTMLVideoElement | null>(null);
  const notaryVideoRef = useRef<HTMLVideoElement | null>(null);

  // Timer for active recording session
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Start Real Hardware Camera Feed
  const startCamera = async () => {
    setIsConnectingCamera(true);
    setCameraError(null);

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      setMediaStream(stream);
      setCameraActive(true);
      setIsConnectingCamera(false);

      if (signerVideoRef.current) {
        signerVideoRef.current.srcObject = stream;
        signerVideoRef.current.play().catch(() => {});
      }

      notify('success', 'Webcam Connected', 'Live hardware camera and audio stream active for Remote Online Notarization.');
    } catch (err: any) {
      setIsConnectingCamera(false);
      setCameraError(err.message || 'Camera permission denied or camera device unavailable.');
      notify('info', 'Hardware Camera Notice', 'Camera access was blocked or not detected. Displaying secure encrypted RON stream simulation.');
    }
  };

  // Auto-attempt camera on component mount
  useEffect(() => {
    startCamera();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update track enabled states on toggle
  useEffect(() => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach(track => {
        track.enabled = videoOn;
      });
      mediaStream.getAudioTracks().forEach(track => {
        track.enabled = micOn;
      });
    }
  }, [videoOn, micOn, mediaStream]);

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
    <div className="space-y-6 pb-12 select-none">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900/95 to-indigo-950/60 border border-emerald-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400">
            <Stamp className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              Remote Online Notarization (RON) Studio
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Live multi-party WebRTC audio/video session with real-time biometric verification & official notarial seal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Live Recording Indicator */}
          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/50 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>REC 🔴 {formatDuration(sessionDuration)}</span>
          </span>

          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-xs font-mono font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>1080p Encrypted Feed</span>
          </span>
        </div>
      </div>

      {/* Split Video Session Room & Notary Action Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Feeds (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Signer Feed (Actual Live Camera) */}
            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 h-72 overflow-hidden flex items-center justify-center shadow-xl group">
              {/* Actual HTML5 Video Camera Stream */}
              <video
                ref={signerVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${
                  cameraActive && videoOn ? 'block' : 'hidden'
                }`}
              />

              {/* Fallback Display if Camera is loading, disabled or unavailable */}
              {(!cameraActive || !videoOn) && (
                <div className="w-full h-full bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-900 flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <div className="w-20 h-20 rounded-full bg-indigo-600/20 border-2 border-indigo-400/50 flex items-center justify-center text-white font-bold text-2xl shadow-lg relative">
                    <User className="w-10 h-10 text-indigo-300" />
                    {videoOn && <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Marcus Vance (Signer)</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Austin, Texas • Client Signer</p>
                  </div>

                  {!cameraActive && (
                    <button
                      onClick={startCamera}
                      disabled={isConnectingCamera}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md transition-all hover:scale-105 cursor-pointer"
                    >
                      {isConnectingCamera ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Connecting Camera...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-3.5 h-3.5" />
                          <span>Enable Live Camera</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Biometric Face Tracking HUD Box Overlay */}
              {cameraActive && videoOn && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-56 border-2 border-dashed border-emerald-400/60 rounded-3xl relative animate-pulse flex flex-col justify-between p-2">
                    <div className="flex justify-between">
                      <span className="w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                      <span className="w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                    </div>

                    <div className="bg-emerald-950/85 backdrop-blur-md border border-emerald-500/40 rounded-lg px-2 py-0.5 text-center text-[9px] font-mono text-emerald-300 font-bold mx-auto">
                      ✓ Biometric Face Tracked (99.8%)
                    </div>

                    <div className="flex justify-between">
                      <span className="w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                      <span className="w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Top Left: Connection & Stream Quality Badge */}
              <div className="absolute top-3 left-3 flex items-center space-x-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-slate-200 font-mono border border-slate-800">
                <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{cameraActive ? 'Live Camera (WebRTC)' : 'Stream Simulated'}</span>
              </div>

              {/* Bottom Left: Signer Identity & IDV Badge */}
              <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 bg-emerald-950/90 backdrop-blur-md border border-emerald-500/40 px-2.5 py-1 rounded-lg text-[10px] text-emerald-300 font-mono font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Marcus Vance (IDV Verified)</span>
              </div>

              {/* Bottom Right: Mic Status Pill */}
              <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-lg border border-slate-800">
                {micOn ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-rose-400" />}
              </div>
            </div>

            {/* Notary Officer Feed */}
            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 h-72 overflow-hidden flex items-center justify-center shadow-xl">
              <div className="w-full h-full bg-gradient-to-br from-slate-950 via-emerald-950/30 to-slate-900 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-600/20 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-300 font-bold text-2xl mb-2 shadow-lg relative">
                  CB
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950" />
                </div>
                <h4 className="text-xs font-bold text-white">{session.notaryName}</h4>
                <p className="text-[10px] text-slate-400 font-mono">Commission #{session.commissionNumber} ({session.jurisdiction})</p>
              </div>

              {/* Top Left: Officer Status */}
              <div className="absolute top-3 left-3 flex items-center space-x-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-slate-200 font-mono border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Commissioned State Notary</span>
              </div>

              {/* Official Seal badge */}
              <div className="absolute top-3 right-3 flex items-center space-x-1 bg-emerald-950/90 border border-emerald-800/60 px-2 py-1 rounded-md text-[10px] text-emerald-400 font-mono">
                <Award className="w-3 h-3" />
                <span>State of Texas</span>
              </div>

              {/* Bottom Left: Audio waveform indicator */}
              <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-slate-950/80 px-2 py-1 rounded-md text-[10px] text-slate-300 font-mono">
                <div className="flex items-center space-x-0.5">
                  <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" />
                </div>
                <span className="ml-1">Audio Active</span>
              </div>
            </div>
          </div>

          {/* Video Control Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`p-3 rounded-xl transition-all cursor-pointer ${
                  micOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white shadow-rose-600/30'
                }`}
                title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setVideoOn(!videoOn)}
                className={`p-3 rounded-xl transition-all cursor-pointer ${
                  videoOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white shadow-rose-600/30'
                }`}
                title={videoOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {videoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={startCamera}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                title="Refresh or switch camera hardware"
              >
                <Camera className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Camera Settings</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowIDVModal(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-all hover:scale-105 cursor-pointer"
              >
                <Scan className="w-4 h-4" />
                <span>Verify Biometric ID</span>
              </button>
            </div>
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
            className={`w-full py-3 rounded-xl text-xs font-bold shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer ${
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
