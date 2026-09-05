import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Share2, 
  MousePointer2, 
  PenTool, 
  Sparkles, 
  CheckCircle2, 
  PhoneOff, 
  MessageSquare,
  Eye,
  Radio,
  FileText,
  ShieldCheck,
  Highlighter,
  Lock,
  Unlock,
  Volume2,
  Download,
  Flame,
  Check,
  Plus,
  Send,
  HelpCircle,
  Activity,
  Layers,
  FileCheck2,
  Clock,
  ChevronRight,
  RefreshCw,
  Zap,
  Target,
  FileSignature,
  FileSpreadsheet,
  FileCode,
  Crosshair,
  Wifi
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { downloadJsonBundle, downloadCsvFile } from '../../utils/downloadUtils';

interface Participant {
  id: string;
  name: string;
  role: string;
  color: string;
  cursorX: number;
  cursorY: number;
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeaking: boolean;
  avatar: string;
}

interface ClauseAnnotation {
  id: string;
  author: string;
  authorRole: string;
  authorColor: string;
  clauseId: string;
  clauseTitle: string;
  highlightColor: 'purple' | 'green' | 'yellow' | 'rose';
  textSnippet: string;
  note: string;
  time: string;
}

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  badgeColor: string;
}

export const CoBrowsingRoomView: React.FC = () => {
  const { notify } = useSignFlow();

  // Control Bar States
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isLaserPointerActive, setIsLaserPointerActive] = useState(true);
  const [isFollowPresenterMode, setIsFollowPresenterMode] = useState(true);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<'purple' | 'green' | 'yellow' | 'rose'>('purple');
  const [activeSectionFocus, setActiveSectionFocus] = useState<string>('sec-liability');
  
  // Live Timer
  const [sessionSeconds, setSessionSeconds] = useState(268); // 04:28

  // Interactive Signing Sequence: 0 = Provider (Alex), 1 = Customer (David), 2 = Cryptographic Seal Complete
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  // AI Assistant in-room drawer
  const [showRoomAICopilot, setShowRoomAICopilot] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Mouse coords for laser pointer & click ripple
  const canvasRef = useRef<HTMLDivElement>(null);
  const [userLaserPos, setUserLaserPos] = useState({ x: 420, y: 290 });
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Room Annotations & Highlights
  const [annotations, setAnnotations] = useState<ClauseAnnotation[]>([
    {
      id: 'ann-1',
      author: 'Sarah Jenkins',
      authorRole: 'General Counsel',
      authorColor: 'text-purple-700 bg-purple-100 border-purple-200',
      clauseId: 'sec-liability',
      clauseTitle: 'Section 4.1 — Limitation of Liability',
      highlightColor: 'purple',
      textSnippet: 'Aggregate cumulative liability capped at total fees paid in preceding 12 months.',
      note: 'Mutual standard approved by legal team. No further redlines needed.',
      time: '2 mins ago'
    },
    {
      id: 'ann-2',
      author: 'David Vance',
      authorRole: 'Customer Signer',
      authorColor: 'text-emerald-700 bg-emerald-100 border-emerald-200',
      clauseId: 'sec-indemnity',
      clauseTitle: 'Section 7.3 — Mutual Indemnification',
      highlightColor: 'green',
      textSnippet: 'Each party defends and indemnifies against third-party IP infringement claims.',
      note: 'Reciprocal IP defense agreed for Cloud deployment.',
      time: 'Just now'
    }
  ]);

  const [newAnnotationNote, setNewAnnotationNote] = useState('');
  const [targetClauseForNote, setTargetClauseForNote] = useState<'sec-liability' | 'sec-indemnity' | 'sec-governing' | 'sec-sla'>('sec-governing');

  // Real-time Audit Stream
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([
    {
      id: 'aud-1',
      timestamp: '15:47:12',
      actor: 'System',
      action: 'Room #ROOM-992 session initiated with 1080p encrypted WebRTC mesh',
      badgeColor: 'bg-slate-100 text-slate-700'
    },
    {
      id: 'aud-2',
      timestamp: '15:48:05',
      actor: 'Sarah Jenkins (Legal)',
      action: 'Applied Purple Highlight to Section 4.1 (Limitation of Liability)',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'aud-3',
      timestamp: '15:49:30',
      actor: 'David Vance (Customer)',
      action: 'Applied Green Highlight to Section 7.3 (Reciprocal Indemnity)',
      badgeColor: 'bg-emerald-100 text-emerald-700'
    },
    {
      id: 'aud-4',
      timestamp: '15:51:10',
      actor: 'Alex Rivera (Presenter)',
      action: 'Activated Follow Presenter Viewport Synchronization',
      badgeColor: 'bg-indigo-100 text-indigo-700'
    }
  ]);

  // Simulated co-browsing participants with animated cursors & audio pulses
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'p-1',
      name: 'Alex Rivera (You)',
      role: 'Host / Provider Signer',
      color: 'bg-indigo-600 text-white',
      cursorX: 420,
      cursorY: 280,
      isMuted: false,
      isVideoOn: true,
      isSpeaking: true,
      avatar: 'AR'
    },
    {
      id: 'p-2',
      name: 'Sarah Jenkins',
      role: 'General Counsel',
      color: 'bg-purple-600 text-white',
      cursorX: 560,
      cursorY: 330,
      isMuted: false,
      isVideoOn: true,
      isSpeaking: false,
      avatar: 'SJ'
    },
    {
      id: 'p-3',
      name: 'David Vance',
      role: 'Customer Authorized Signer',
      color: 'bg-emerald-600 text-white',
      cursorX: 310,
      cursorY: 510,
      isMuted: true,
      isVideoOn: false,
      isSpeaking: false,
      avatar: 'DV'
    }
  ]);

  // Session timer clock
  useEffect(() => {
    const timer = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Subtle natural cursor movement simulation for co-signers
  useEffect(() => {
    const interval = setInterval(() => {
      setParticipants(prev => prev.map(p => {
        if (p.id === 'p-1') return p;
        return {
          ...p,
          cursorX: Math.max(100, Math.min(620, p.cursorX + (Math.random() * 60 - 30))),
          cursorY: Math.max(140, Math.min(540, p.cursorY + (Math.random() * 50 - 25))),
          isSpeaking: Math.random() > 0.60
        };
      }));
    }, 1400);

    return () => clearInterval(interval);
  }, []);

  // Handle laser pointer tracking and particle ripples
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setUserLaserPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !isLaserPointerActive) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev.slice(-4), newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1000);
  };

  const appendAudit = (actor: string, action: string, badgeColor: string = 'bg-indigo-100 text-indigo-700') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setAuditLog(prev => [
      {
        id: 'aud-' + Date.now(),
        timestamp: timeStr,
        actor,
        action,
        badgeColor
      },
      ...prev.slice(0, 19)
    ]);
  };

  const handleAdvanceSignerTurn = () => {
    if (currentTurnIndex === 0) {
      setCurrentTurnIndex(1);
      appendAudit('Alex Rivera (Provider)', 'Signed Provider Block and handed turn to David Vance', 'bg-indigo-100 text-indigo-700');
      notify('info', 'Turn Passed to David Vance', 'David Vance (Customer Signer) is now active to execute signature.');
    } else if (currentTurnIndex === 1) {
      setCurrentTurnIndex(2);
      appendAudit('David Vance (Customer)', 'Signed Customer Block • Cryptographic Seal Issued', 'bg-emerald-100 text-emerald-700');
      notify('success', 'All Parties Signed & Sealed!', 'Co-Browsing agreement fully executed. Cryptographic Certificate of Completion issued.');
    } else {
      setCurrentTurnIndex(0);
      appendAudit('Alex Rivera (Host)', 'Reset signing session to initial state for demo testing', 'bg-slate-100 text-slate-700');
      notify('info', 'Signing Flow Reset', 'Ready for another live sequence demonstration.');
    }
  };

  const handleAskAICopilot = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || aiQuestion;
    if (!query.trim()) return;

    setIsAiThinking(true);
    setAiAnswer(null);

    setTimeout(() => {
      setIsAiThinking(false);
      if (query.toLowerCase().includes('liability') || query.toLowerCase().includes('cap')) {
        setAiAnswer(`**Section 4.1 Analysis**: The 12-month trailing fee liability cap is fully market standard (92nd percentile in SaaS MSAs). Exceptions for confidentiality and gross misconduct are balanced symmetrically across both parties.`);
      } else if (query.toLowerCase().includes('indemn') || query.toLowerCase().includes('ip')) {
        setAiAnswer(`**Section 7.3 Analysis**: Reciprocal indemnification covers third-party IP claims without unilateral defense carve-outs. Customer defense triggers are explicitly tied to authorized SaaS platform usage.`);
      } else if (query.toLowerCase().includes('delaware') || query.toLowerCase().includes('govern') || query.toLowerCase().includes('law')) {
        setAiAnswer(`**Section 9.1 Analysis**: Delaware Chancery Court jurisdiction with AAA commercial expedited arbitration is compliant and universally accepted for enterprise SaaS contracts.`);
      } else {
        setAiAnswer(`**Live Clause Review**: The clause language adheres to SignFlow standard playbooks with bilateral risk distribution and certified compliance under ESIGN / eIDAS Art 28.`);
      }
      appendAudit('AI Legal Copilot', `Generated analysis for query: "${query.substring(0, 35)}..."`, 'bg-purple-100 text-purple-700');
    }, 600);
  };

  const handleApplyClauseHighlight = (clauseId: 'sec-liability' | 'sec-indemnity' | 'sec-governing' | 'sec-sla', color: 'purple' | 'green' | 'yellow' | 'rose') => {
    const titles = {
      'sec-liability': 'Section 4.1 — Limitation of Liability',
      'sec-indemnity': 'Section 7.3 — Mutual Indemnification',
      'sec-governing': 'Section 9.1 — Governing Law & Arbitration',
      'sec-sla': 'Section 5.2 — Uptime SLA & Service Credits'
    };

    const snippets = {
      'sec-liability': 'Aggregate cumulative liability capped at total fees paid in preceding 12 months.',
      'sec-indemnity': 'Each party defends and indemnifies against third-party IP infringement claims.',
      'sec-governing': 'Delaware Chancery Court jurisdiction with AAA commercial arbitration rules.',
      'sec-sla': '99.95% availability guarantee backed by tiered invoice service credits.'
    };

    const authors = {
      purple: { name: 'Sarah Jenkins', role: 'General Counsel', colorClass: 'text-purple-700 bg-purple-100 border-purple-200' },
      green: { name: 'David Vance', role: 'Customer Signer', colorClass: 'text-emerald-700 bg-emerald-100 border-emerald-200' },
      yellow: { name: 'Alex Rivera', role: 'Provider Host', colorClass: 'text-amber-700 bg-amber-100 border-amber-200' },
      rose: { name: 'Sarah Jenkins', role: 'Risk & Compliance', colorClass: 'text-rose-700 bg-rose-100 border-rose-200' }
    };

    const authorInfo = authors[color];
    const newAnn: ClauseAnnotation = {
      id: 'ann-' + Date.now(),
      author: authorInfo.name,
      authorRole: authorInfo.role,
      authorColor: authorInfo.colorClass,
      clauseId,
      clauseTitle: titles[clauseId],
      highlightColor: color,
      textSnippet: snippets[clauseId],
      note: `Marked during live negotiation review (${authorInfo.role})`,
      time: 'Just now'
    };

    setAnnotations(prev => [newAnn, ...prev.filter(a => a.clauseId !== clauseId || a.highlightColor !== color)]);
    appendAudit(authorInfo.name, `Applied ${color.toUpperCase()} Highlight to ${titles[clauseId]}`, color === 'purple' ? 'bg-purple-100 text-purple-700' : color === 'green' ? 'bg-emerald-100 text-emerald-700' : color === 'rose' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700');
    notify('success', 'Clause Highlighted for Room', `Applied ${color} highlight with attribution badge to ${titles[clauseId]}.`);
  };

  const handleAddCustomAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnotationNote.trim()) return;

    const titles = {
      'sec-liability': 'Section 4.1 — Limitation of Liability',
      'sec-indemnity': 'Section 7.3 — Mutual Indemnification',
      'sec-governing': 'Section 9.1 — Governing Law & Arbitration',
      'sec-sla': 'Section 5.2 — Uptime SLA & Service Credits'
    };

    const snippets = {
      'sec-liability': 'Aggregate cumulative liability capped at total fees paid in preceding 12 months.',
      'sec-indemnity': 'Each party defends and indemnifies against third-party IP infringement claims.',
      'sec-governing': 'Delaware Chancery Court jurisdiction with AAA commercial arbitration rules.',
      'sec-sla': '99.95% availability guarantee backed by tiered invoice service credits.'
    };

    const newAnn: ClauseAnnotation = {
      id: 'ann-' + Date.now(),
      author: 'Alex Rivera (You)',
      authorRole: 'Host / Presenter',
      authorColor: 'text-indigo-700 bg-indigo-100 border-indigo-200',
      clauseId: targetClauseForNote,
      clauseTitle: titles[targetClauseForNote],
      highlightColor: selectedHighlightColor,
      textSnippet: snippets[targetClauseForNote],
      note: newAnnotationNote,
      time: 'Just now'
    };

    setAnnotations(prev => [newAnn, ...prev]);
    appendAudit('Alex Rivera (You)', `Posted synchronized note on ${titles[targetClauseForNote]}`, 'bg-indigo-100 text-indigo-700');
    setNewAnnotationNote('');
    notify('success', 'Room Note Synchronized', 'All participants received the annotated note.');
  };

  const jumpToSection = (sectionKey: string) => {
    setActiveSectionFocus(sectionKey);
    appendAudit('Alex Rivera (Presenter)', `Focused viewport to ${sectionKey.replace('sec-', '').toUpperCase()}`, 'bg-slate-100 text-slate-700');
    notify('info', 'Presenter Viewport Synced', `All participant screens aligned to ${sectionKey.replace('sec-', '').toUpperCase()}.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Session Control Bar */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping absolute inset-0 opacity-75" />
            <div className="w-3.5 h-3.5 rounded-full bg-rose-600 relative" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-sm font-bold text-slate-900 font-display">
                Live Co-Browsing Room #ROOM-992
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-600 border border-rose-200 uppercase flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                <span>REC {formatTimer(sessionSeconds)}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase">
                1080p WebRTC Encrypted
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                18ms Latency • 0% Loss
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Enterprise Master Services Agreement • Multi-Cursor, Real-Time Laser & Viewport Sync Active
            </p>
          </div>
        </div>

        {/* Media & Interactive Tools */}
        <div className="flex items-center space-x-2 self-start md:self-auto flex-wrap gap-y-2">
          {/* Mute toggle */}
          <button
            onClick={() => {
              setIsMicOn(!isMicOn);
              notify('info', isMicOn ? 'Microphone Muted' : 'Microphone Active', 'WebRTC audio stream updated.');
            }}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              isMicOn
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
            }`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicOn ? <Mic className="w-4 h-4 text-emerald-600" /> : <MicOff className="w-4 h-4 text-rose-600" />}
          </button>

          {/* Video toggle */}
          <button
            onClick={() => {
              setIsVideoOn(!isVideoOn);
              notify('info', isVideoOn ? 'Camera Paused' : 'Camera Streaming', 'WebRTC video stream updated.');
            }}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              isVideoOn
                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
            }`}
            title={isVideoOn ? 'Stop Camera' : 'Start Camera'}
          >
            {isVideoOn ? <Video className="w-4 h-4 text-blue-600" /> : <VideoOff className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Laser Pointer */}
          <button
            onClick={() => {
              setIsLaserPointerActive(!isLaserPointerActive);
              appendAudit('Alex Rivera (You)', isLaserPointerActive ? 'Deactivated Laser Pointer' : 'Activated Laser Pointer', 'bg-rose-100 text-rose-700');
            }}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              isLaserPointerActive
                ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLaserPointerActive ? 'animate-pulse' : ''}`} />
            <span>Laser Pointer {isLaserPointerActive ? 'ON' : 'OFF'}</span>
          </button>

          {/* Follow Presenter Mode */}
          <button
            onClick={() => {
              const next = !isFollowPresenterMode;
              setIsFollowPresenterMode(next);
              appendAudit('Alex Rivera (You)', next ? 'Locked Viewport to Presenter' : 'Switched to Free Scroll Mode', 'bg-indigo-100 text-indigo-700');
              notify('info', next ? 'Follow Presenter Locked' : 'Free Scroll Unlocked', next ? 'All participant viewports locked in sync.' : 'Participants can browse independently.');
            }}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              isFollowPresenterMode
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isFollowPresenterMode ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isFollowPresenterMode ? 'Follow Presenter (Locked)' : 'Free Scroll Mode'}</span>
          </button>

          {/* AI Room Copilot Trigger */}
          <button
            onClick={() => setShowRoomAICopilot(!showRoomAICopilot)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              showRoomAICopilot
                ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Legal Copilot</span>
          </button>
        </div>
      </div>

      {/* Turn-Based Multi-Signer Sequencer Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Turn Sequence:</span>
          </span>

          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className={`px-2.5 py-1 rounded-xl font-semibold flex items-center space-x-1 transition-all ${
              currentTurnIndex === 0 
                ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200' 
                : 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-200'
            }`}>
              {currentTurnIndex > 0 ? <Check className="w-3 h-3 text-emerald-700" /> : <span className="w-2 h-2 rounded-full bg-white animate-ping mr-0.5" />}
              <span>1. Alex Rivera (Provider)</span>
            </span>

            <span className="text-slate-300">→</span>

            <span className={`px-2.5 py-1 rounded-xl font-semibold flex items-center space-x-1 transition-all ${
              currentTurnIndex === 1 
                ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200 animate-pulse' 
                : currentTurnIndex > 1 
                ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-200' 
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
              {currentTurnIndex > 1 ? <Check className="w-3 h-3 text-emerald-700" /> : null}
              <span>2. David Vance (Customer)</span>
            </span>

            <span className="text-slate-300">→</span>

            <span className={`px-2.5 py-1 rounded-xl font-semibold flex items-center space-x-1 transition-all ${
              currentTurnIndex === 2 
                ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-200' 
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
              {currentTurnIndex === 2 ? <ShieldCheck className="w-3 h-3 text-white" /> : null}
              <span>3. Cryptographic Seal</span>
            </span>
          </div>

          <button
            onClick={handleAdvanceSignerTurn}
            className="ml-2 px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold shadow-xs flex items-center space-x-1 transition-all cursor-pointer"
          >
            <PenTool className="w-3 h-3" />
            <span>
              {currentTurnIndex === 0 ? 'Execute Step 1 (Sign as Provider)' : currentTurnIndex === 1 ? 'Execute Step 2 (Sign as Customer)' : 'Reset Demo Sequence'}
            </span>
          </button>
        </div>

        {/* Audit Evidence Export Actions */}
        <div className="flex items-center space-x-2">
          {/* Export CSV Button */}
          <button
            onClick={() => {
              const csvRows = [
                ['SignFlow Co-Browsing Room Audit Log', 'Session: ROOM-992'],
                ['Agreement Title', 'Enterprise Master Services Agreement'],
                ['Export Timestamp', new Date().toISOString()],
                ['Session Duration', formatTimer(sessionSeconds)],
                ['Recording Hash', 'sha256-8a01bf2848c909e4a11209bca7892182049c819203a98102'],
                ['Turn Execution Status', currentTurnIndex === 2 ? 'COMPLETED_ALL_SIGNATURES' : 'IN_PROGRESS'],
                [],
                ['Participant ID', 'Name', 'Role', 'Status', 'Speaking Presence'],
                ...participants.map(p => [
                  p.id,
                  p.name,
                  p.role,
                  currentTurnIndex >= (p.id === 'p-1' ? 1 : p.id === 'p-3' ? 2 : 1) ? 'SIGNED_IN_ROOM' : 'ATTENDED',
                  p.isSpeaking ? 'Active Voice' : 'Silent'
                ]),
                [],
                ['Annotation ID', 'Author', 'Role', 'Clause Section', 'Highlighted Text Snippet', 'Annotation Note', 'Logged Time'],
                ...annotations.map(a => [
                  a.id,
                  a.author,
                  a.authorRole,
                  a.clauseTitle,
                  a.textSnippet,
                  a.note,
                  a.time
                ]),
                [],
                ['Audit Event ID', 'Timestamp', 'Actor', 'Action Description'],
                ...auditLog.map(l => [
                  l.id,
                  l.timestamp,
                  l.actor,
                  l.action
                ])
              ];
              downloadCsvFile('SignFlow-CoBrowsing-Room-992-Audit-Log.csv', csvRows);
              notify('success', 'CSV Spreadsheet Exported', 'Downloaded SignFlow Co-Browsing Room Audit Log (.csv).');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          {/* Export JSON Button */}
          <button
            onClick={() => {
              const exportData = {
                sessionId: 'ROOM-992',
                agreementTitle: 'Enterprise Master Services Agreement',
                timestamp: new Date().toISOString(),
                duration: formatTimer(sessionSeconds),
                recordingHash: 'sha256-8a01bf2848c909e4a11209bca7892182049c819203a98102',
                complianceStandard: 'ESIGN_eIDAS_Article28_Verified',
                participants: participants.map(p => ({
                  id: p.id,
                  name: p.name,
                  role: p.role,
                  status: currentTurnIndex >= (p.id === 'p-1' ? 1 : p.id === 'p-3' ? 2 : 1) ? 'SIGNED_IN_ROOM' : 'ATTENDED'
                })),
                turnExecutionStatus: currentTurnIndex === 2 ? 'COMPLETED_ALL_SIGNATURES' : 'IN_PROGRESS',
                synchronizedAnnotations: annotations,
                auditEvents: auditLog
              };
              downloadJsonBundle('SignFlow-CoBrowsing-Room-992-Audit-Evidence.json', exportData);
              notify('success', 'JSON Bundle Exported', 'Downloaded Co-Browsing Room Evidence Bundle (.json).');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Synchronized Clause Highlighter Toolbar & Viewport Quick-Jump */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <div className="flex items-center space-x-1.5 font-bold">
            <Highlighter className="w-4 h-4 text-amber-400" />
            <span>Clause Highlighter:</span>
          </div>

          {/* Palette Color Selectors */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedHighlightColor('purple')}
              className={`px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                selectedHighlightColor === 'purple'
                  ? 'bg-purple-600 text-white border-white shadow-xs scale-105 ring-2 ring-purple-300'
                  : 'bg-purple-950/80 text-purple-200 border-purple-800 hover:bg-purple-900'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
              <span>Purple (Legal Counsel)</span>
            </button>

            <button
              onClick={() => setSelectedHighlightColor('green')}
              className={`px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                selectedHighlightColor === 'green'
                  ? 'bg-emerald-600 text-white border-white shadow-xs scale-105 ring-2 ring-emerald-300'
                  : 'bg-emerald-950/80 text-emerald-200 border-emerald-800 hover:bg-emerald-900'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span>Green (Customer Signer)</span>
            </button>

            <button
              onClick={() => setSelectedHighlightColor('yellow')}
              className={`px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                selectedHighlightColor === 'yellow'
                  ? 'bg-amber-500 text-slate-950 border-white shadow-xs scale-105 ring-2 ring-amber-300'
                  : 'bg-amber-950/80 text-amber-200 border-amber-800 hover:bg-amber-900'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>Yellow (Standard)</span>
            </button>

            <button
              onClick={() => setSelectedHighlightColor('rose')}
              className={`px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                selectedHighlightColor === 'rose'
                  ? 'bg-rose-600 text-white border-white shadow-xs scale-105 ring-2 ring-rose-300'
                  : 'bg-rose-950/80 text-rose-200 border-rose-800 hover:bg-rose-900'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
              <span>Rose (Critical Risk)</span>
            </button>
          </div>
        </div>

        {/* Viewport Presenter Jumps */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-300 text-[11px] font-medium">Presenter Focus:</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => jumpToSection('sec-liability')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                activeSectionFocus === 'sec-liability' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Sec 4.1 (Liability)
            </button>
            <button
              onClick={() => jumpToSection('sec-indemnity')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                activeSectionFocus === 'sec-indemnity' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Sec 7.3 (Indemnity)
            </button>
            <button
              onClick={() => jumpToSection('sec-governing')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                activeSectionFocus === 'sec-governing' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Sec 9.1 (Governing)
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Interactive Document Canvas with Multi-Cursors & Laser Dot */}
        <div 
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onClick={handleCanvasClick}
          className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs relative overflow-hidden min-h-[680px] select-none"
        >
          {/* Laser Pointer HUD Coordinates Badge */}
          {isLaserPointerActive && (
            <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-slate-900/90 text-white text-[10px] font-mono flex items-center space-x-2 backdrop-blur-xs border border-slate-700">
              <Crosshair className="w-3 h-3 text-rose-400 animate-spin" />
              <span>Laser Tracking: ({Math.round(userLaserPos.x)}px, {Math.round(userLaserPos.y)}px)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            </div>
          )}

          {/* Animated Laser Dot Pointer */}
          {isLaserPointerActive && (
            <div
              style={{
                transform: `translate3d(${userLaserPos.x}px, ${userLaserPos.y}px, 0)`,
                transition: 'transform 0.04s ease-out'
              }}
              className="absolute pointer-events-none z-40 -ml-2.5 -mt-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-rose-500 opacity-75 animate-ping absolute inset-0" />
              <div className="w-5 h-5 rounded-full bg-rose-600 border-2 border-white shadow-xl shadow-rose-600/70 relative flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
          )}

          {/* Click Ripple Wave Particles */}
          {ripples.map(r => (
            <div
              key={r.id}
              style={{
                left: r.x,
                top: r.y,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute pointer-events-none z-35"
            >
              <div className="w-16 h-16 rounded-full border-2 border-rose-500 animate-ping opacity-80" />
              <div className="w-8 h-8 rounded-full bg-rose-500/30 animate-pulse" />
            </div>
          ))}

          {/* Multi-Signer Presence Cursors */}
          {participants.map(p => (
            <div
              key={p.id}
              style={{
                transform: `translate3d(${p.cursorX}px, ${p.cursorY}px, 0)`,
                transition: 'transform 0.4s cubic-bezier(0.2, 0, 0.2, 1)'
              }}
              className="absolute pointer-events-none z-30 flex items-center space-x-1.5"
            >
              <MousePointer2 className={`w-4 h-4 drop-shadow-sm ${p.id === 'p-2' ? 'text-purple-600 fill-purple-600' : p.id === 'p-3' ? 'text-emerald-600 fill-emerald-600' : 'text-indigo-600 fill-indigo-600'}`} />
              <div className="flex items-center space-x-1">
                <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold shadow-xs whitespace-nowrap ${p.color}`}>
                  {p.name}
                </span>
                {p.isSpeaking && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                )}
              </div>
            </div>
          ))}

          {/* Viewport Sync Framing indicator */}
          {isFollowPresenterMode && (
            <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold flex items-center space-x-1.5 shadow-2xs">
              <Lock className="w-3 h-3 text-indigo-600" />
              <span>Synchronized Viewport (Presenter: Alex Rivera)</span>
            </div>
          )}

          {/* Document Content */}
          <div className="max-w-2xl mx-auto space-y-6 text-slate-800 text-xs leading-relaxed font-serif pt-6">
            <div className="text-center pb-4 border-b border-slate-100 font-sans">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                Legally Binding SaaS Agreement
              </span>
              <h3 className="text-base font-bold tracking-tight text-slate-900 mt-2">
                ENTERPRISE MASTER SERVICES AGREEMENT
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Session Room #ROOM-992 • Delaware Governing Law • Verified Cloud Repository
              </p>
            </div>

            <p className="font-sans text-slate-600">
              This Master Services Agreement is entered into by and between <strong>Acme Global Inc.</strong> ("Provider") and <strong>Delta Enterprises LLC</strong> ("Customer").
            </p>

            {/* Clause 1: Limitation of Liability */}
            <div className={`p-4 rounded-2xl transition-all font-sans space-y-2 relative border ${
              activeSectionFocus === 'sec-liability' ? 'ring-2 ring-indigo-400 shadow-xs' : ''
            } ${
              annotations.some(a => a.clauseId === 'sec-liability' && a.highlightColor === 'purple')
                ? 'bg-purple-50/80 border-purple-300'
                : annotations.some(a => a.clauseId === 'sec-liability' && a.highlightColor === 'green')
                ? 'bg-emerald-50/80 border-emerald-300'
                : annotations.some(a => a.clauseId === 'sec-liability' && a.highlightColor === 'rose')
                ? 'bg-rose-50/80 border-rose-300'
                : 'bg-amber-50/80 border-amber-300'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>4.1. Limitation of Aggregate Liability</span>
                </span>
                
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
                    Sarah Jenkins (Legal Counsel)
                  </span>
                  <button
                    onClick={() => handleApplyClauseHighlight('sec-liability', selectedHighlightColor)}
                    className="text-[10px] bg-white hover:bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-bold text-slate-700 cursor-pointer"
                  >
                    + Apply {selectedHighlightColor}
                  </button>
                </div>
              </div>
              
              <p className="text-[11.5px] text-slate-900 leading-relaxed font-medium">
                "EXCEPT FOR CONFIDENTIALITY BREACHES OR WILLFUL MISCONDUCT, EACH PARTY'S AGGREGATE LIABILITY SHALL BE CAPPED AT TOTAL FEES PAID IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM."
              </p>
              
              <div className="text-[10px] text-slate-500 flex items-center space-x-2 pt-1 border-t border-slate-200/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Reviewed & Approved by Legal Counsel Sarah Jenkins • Trailing 12-month standard cap</span>
              </div>
            </div>

            {/* Clause 2: Mutual Indemnification */}
            <div className={`p-4 rounded-2xl transition-all font-sans space-y-2 relative border ${
              activeSectionFocus === 'sec-indemnity' ? 'ring-2 ring-indigo-400 shadow-xs' : ''
            } ${
              annotations.some(a => a.clauseId === 'sec-indemnity' && a.highlightColor === 'green')
                ? 'bg-emerald-50/80 border-emerald-300'
                : annotations.some(a => a.clauseId === 'sec-indemnity' && a.highlightColor === 'purple')
                ? 'bg-purple-50/80 border-purple-300'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>7.3. Reciprocal Indemnification & IP Defense</span>
                </span>
                
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    David Vance (Customer Signer)
                  </span>
                  <button
                    onClick={() => handleApplyClauseHighlight('sec-indemnity', selectedHighlightColor)}
                    className="text-[10px] bg-white hover:bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-bold text-slate-700 cursor-pointer"
                  >
                    + Apply {selectedHighlightColor}
                  </button>
                </div>
              </div>
              
              <p className="text-[11.5px] text-slate-900 leading-relaxed font-medium">
                "EACH PARTY SHALL DEFEND, INDEMNIFY, AND HOLD HARMLESS THE OTHER AGAINST THIRD-PARTY CLAIMS ARISING OUT OF INTELLECTUAL PROPERTY INFRINGEMENT."
              </p>

              <div className="text-[10px] text-slate-500 flex items-center space-x-2 pt-1 border-t border-slate-200/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Reciprocal defense agreed for Cloud deployment • Bilateral protection</span>
              </div>
            </div>

            {/* Clause 3: Governing Law & Jurisdiction */}
            <div className={`p-4 rounded-2xl transition-all font-sans space-y-2 relative border ${
              activeSectionFocus === 'sec-governing' ? 'ring-2 ring-indigo-400 shadow-xs' : ''
            } ${
              annotations.some(a => a.clauseId === 'sec-governing')
                ? 'bg-amber-50/80 border-amber-300'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>9.1. Governing Law & Arbitration</span>
                </span>
                
                <button
                  onClick={() => handleApplyClauseHighlight('sec-governing', selectedHighlightColor)}
                  className="text-[10px] bg-white hover:bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-bold text-slate-700 cursor-pointer"
                >
                  + Apply {selectedHighlightColor} Highlight
                </button>
              </div>
              
              <p className="text-[11.5px] text-slate-900 leading-relaxed font-medium">
                "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws principles. Any dispute shall be resolved through binding commercial arbitration."
              </p>
            </div>

            {/* Signature Blocks with Live Turn Status */}
            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 font-sans">
              {/* Provider Block */}
              <div className={`p-4 rounded-2xl border-2 transition-all text-center space-y-2 ${
                currentTurnIndex > 0
                  ? 'bg-indigo-50/50 border-indigo-300 shadow-xs'
                  : 'border-dashed border-indigo-400 bg-indigo-50/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                    1. Provider Authorized Signature
                  </span>
                  {currentTurnIndex > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[9px]">
                      ✓ Signed in Room
                    </span>
                  )}
                </div>

                <div className="h-12 flex items-center justify-center text-indigo-900 font-display text-xl italic font-bold">
                  {currentTurnIndex > 0 ? 'Alex Rivera' : (
                    <button
                      onClick={handleAdvanceSignerTurn}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Click to Sign as Provider
                    </button>
                  )}
                </div>
                <span className="text-[9.5px] font-mono text-slate-400 block">
                  {currentTurnIndex > 0 ? 'Signed in Co-Browsing Room • Verified IP 198.51.100.82' : 'Turn 1 Active • Awaiting Provider'}
                </span>
              </div>

              {/* Customer Block */}
              <div className={`p-4 rounded-2xl border-2 transition-all text-center space-y-2 ${
                currentTurnIndex >= 2
                  ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                  : currentTurnIndex === 1
                  ? 'border-dashed border-emerald-500 bg-emerald-50/30 animate-pulse'
                  : 'border-dashed border-slate-200 bg-slate-50/50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    2. Customer Authorized Signature
                  </span>
                  {currentTurnIndex >= 2 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[9px]">
                      ✓ Signed in Room
                    </span>
                  )}
                </div>

                <div className="h-12 flex items-center justify-center text-emerald-900 font-display text-xl italic font-bold">
                  {currentTurnIndex >= 2 ? (
                    'David Vance'
                  ) : currentTurnIndex === 1 ? (
                    <button
                      onClick={handleAdvanceSignerTurn}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer animate-bounce"
                    >
                      Click to Execute Customer Signature
                    </button>
                  ) : (
                    <span className="text-slate-400 text-xs font-sans italic">Awaiting Turn 2...</span>
                  )}
                </div>

                <span className="text-[9.5px] font-mono text-slate-400 block">
                  {currentTurnIndex >= 2 
                    ? 'Signed in Room • SMS OTP Verified (+1 555-0192)' 
                    : currentTurnIndex === 1 
                    ? 'Turn 2 Active • Ready to Sign' 
                    : 'Next in Queue'}
                </span>
              </div>
            </div>

            {/* Cryptographic Seal Completion Banner */}
            {currentTurnIndex === 2 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md flex items-center justify-between font-sans">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Agreement Fully Executed & Sealed</h4>
                    <p className="text-[11px] text-emerald-100 font-mono">
                      SHA256: 8a01bf2848c909e4a11209bca7892182049c819203a98102
                    </p>
                  </div>
                </div>
                
                <span className="px-3 py-1 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-2xs">
                  Certificate Ready
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Live Participants, Voice Waves, Notes & AI Copilot */}
        <div className="space-y-4">
          {/* Active Participants with Voice Waves */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Room Participants ({participants.length})</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-600 font-semibold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>WebRTC Mesh</span>
              </span>
            </div>

            <div className="space-y-2.5">
              {participants.map(p => (
                <div key={p.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shadow-xs ${p.color}`}>
                        {p.avatar}
                      </div>
                      {p.isSpeaking && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-ping" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <p className="font-bold text-slate-900 truncate">{p.name}</p>
                        {p.isSpeaking && (
                          <div className="flex items-end space-x-0.5 h-3">
                            <span className="w-0.5 h-2 bg-emerald-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <span className="w-0.5 h-3 bg-emerald-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <span className="w-0.5 h-1.5 bg-emerald-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{p.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 text-slate-400">
                    {p.isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-500" /> : <Mic className="w-3.5 h-3.5 text-emerald-500" />}
                    {p.isVideoOn ? <Video className="w-3.5 h-3.5 text-blue-500" /> : <VideoOff className="w-3.5 h-3.5 text-slate-300" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Synchronized Room Notes & Highlights */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span>Room Notes ({annotations.length})</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Sync: 100%</span>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 text-xs">
              {annotations.map(a => (
                <div key={a.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`px-2 py-0.5 rounded-full font-bold border ${a.authorColor}`}>
                      {a.author}
                    </span>
                    <span className="font-mono text-slate-400">{a.time}</span>
                  </div>
                  <p className="text-[10.5px] font-bold text-slate-800">{a.clauseTitle}</p>
                  <p className="text-[11px] text-slate-600 font-medium">{a.note}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddCustomAnnotation} className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center space-x-1 text-[10px] text-slate-500">
                <span>Target:</span>
                <select
                  value={targetClauseForNote}
                  onChange={(e) => setTargetClauseForNote(e.target.value as any)}
                  className="bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 text-[10px]"
                >
                  <option value="sec-liability">Sec 4.1 Liability</option>
                  <option value="sec-indemnity">Sec 7.3 Indemnity</option>
                  <option value="sec-governing">Sec 9.1 Governing</option>
                  <option value="sec-sla">Sec 5.2 SLA</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  value={newAnnotationNote}
                  onChange={(e) => setNewAnnotationNote(e.target.value)}
                  placeholder="Post synchronized room note..."
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* AI Room Copilot Drawer Card */}
          {showRoomAICopilot && (
            <div className="p-5 rounded-3xl bg-purple-50/90 border border-purple-200 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-purple-900 font-bold">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>In-Room Legal Copilot</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-200/70 text-purple-800 text-[9.5px] font-bold">
                  Grounded in MSA
                </span>
              </div>
              
              <p className="text-[11px] text-purple-800 leading-snug">
                Ask questions about the contract text in real-time during negotiation.
              </p>

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => handleAskAICopilot(undefined, 'Is 12-month liability cap market standard?')}
                  className="px-2 py-1 bg-white hover:bg-purple-100 border border-purple-200 rounded-lg text-[10px] text-purple-900 font-medium cursor-pointer"
                >
                  ⚡ Check Liability Cap
                </button>
                <button
                  type="button"
                  onClick={() => handleAskAICopilot(undefined, 'Summarize IP indemnification obligations')}
                  className="px-2 py-1 bg-white hover:bg-purple-100 border border-purple-200 rounded-lg text-[10px] text-purple-900 font-medium cursor-pointer"
                >
                  ⚡ Review Indemnity
                </button>
                <button
                  type="button"
                  onClick={() => handleAskAICopilot(undefined, 'Verify Delaware law arbitration')}
                  className="px-2 py-1 bg-white hover:bg-purple-100 border border-purple-200 rounded-lg text-[10px] text-purple-900 font-medium cursor-pointer"
                >
                  ⚡ Delaware Law
                </button>
              </div>

              <form onSubmit={handleAskAICopilot} className="space-y-2">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="e.g. Is this liability cap standard?"
                  className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs text-purple-950 focus:outline-none focus:border-purple-400"
                />
                <button
                  type="submit"
                  disabled={isAiThinking}
                  className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-1"
                >
                  {isAiThinking ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing Agreement...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Analyze Clause for Room</span>
                    </>
                  )}
                </button>
              </form>

              {aiAnswer && (
                <div className="p-3 bg-white border border-purple-100 rounded-xl text-[11px] text-purple-950 leading-relaxed font-sans mt-2 space-y-1 shadow-2xs">
                  <strong className="text-purple-900 block font-bold">AI Legal Recommendation:</strong>
                  <p>{aiAnswer}</p>
                </div>
              )}
            </div>
          )}

          {/* Real-Time Room Audit Stream */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Live Audit Stream</span>
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-[11px]">
              {auditLog.map(l => (
                <div key={l.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                  <div className="flex items-center justify-between text-[9.5px]">
                    <span className="font-bold text-slate-700">{l.actor}</span>
                    <span className="font-mono text-slate-400">{l.timestamp}</span>
                  </div>
                  <p className="text-slate-600 leading-snug">{l.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
