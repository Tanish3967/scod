import React, { useState } from 'react';
import { 
  Send, 
  Eye, 
  Share2, 
  Star, 
  MoreHorizontal, 
  ChevronDown, 
  Plus, 
  Minus, 
  Hand, 
  PenTool, 
  Type, 
  CheckSquare, 
  Calendar, 
  Stamp, 
  Paperclip, 
  Image as ImageIcon, 
  Undo, 
  Redo, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Copy, 
  ExternalLink, 
  Maximize2, 
  FileText, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  GitFork,
  ArrowDown,
  Lock,
  Mail,
  Layers,
  Columns,
  SplitSquareVertical,
  Sliders,
  Trash2,
  Unlock,
  FileCheck,
  AlertTriangle,
  RotateCcw,
  Edit3
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { FieldType, DocumentField, CustomSignature } from '../../types/signflow';
import { CustomSignatureModal } from '../signatures/CustomSignatureModal';
import { formatTimestamp } from '../../utils/cryptoUtils';

export const DocumentPrepStudio: React.FC = () => {
  const { 
    activeEnvelope, 
    updateEnvelope, 
    sendEnvelope, 
    addFieldToEnvelope,
    removeFieldFromEnvelope,
    setActiveView,
    openSigningSession,
    openCertificateView,
    unlockEnvelopeForRevision,
    recordTamperingAttempt,
    resendEnvelopeForSigning,
    notify 
  } = useSignFlow();

  const [activeTab, setActiveTab] = useState<'document' | 'workflow' | 'signers' | 'history' | 'activity' | 'attachments' | 'audit'>('document');
  const [layoutMode, setLayoutMode] = useState<'document' | 'workflow' | 'split'>('document');
  const [activePage, setActivePage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isStarred, setIsStarred] = useState(false);
  const [activeTool, setActiveTool] = useState<'cursor' | 'pen' | 'text' | 'check' | 'date'>('cursor');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('rec-1');

  // Revision & Unlock State
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockReason, setUnlockReason] = useState('Authorized clause renegotiation & commercial amendments');

  // Custom Signature State
  const [showCustomSigModal, setShowCustomSigModal] = useState(false);
  const [modalTargetParty, setModalTargetParty] = useState<'disclosing' | 'receiving'>('disclosing');
  const [customDisclosingSig, setCustomDisclosingSig] = useState<CustomSignature | null>(null);
  const [customReceivingSig, setCustomReceivingSig] = useState<CustomSignature | null>(null);

  const envelopeTitle = activeEnvelope?.title || 'NDA – Acme & Globex Corp.';
  const envelopeId = activeEnvelope?.id ? `#${activeEnvelope.id.toUpperCase().replace('ENV-', 'ENV-')}` : '#ENV-8921';

  // Handle Tab Switch
  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    if (tabId === 'workflow') {
      setLayoutMode('workflow');
    } else if (tabId === 'document') {
      setLayoutMode('document');
    }
  };

  const handleAddField = (type: FieldType) => {
    if (!activeEnvelope) return;
    const newField: Omit<DocumentField, 'id'> = {
      type,
      label: type.replace('_', ' ').toUpperCase(),
      recipientId: selectedRecipientId,
      page: activePage,
      x: 20,
      y: 40 + (activeEnvelope.fields.length * 8) % 40,
      width: 36,
      height: 8,
      required: true
    };
    addFieldToEnvelope(activeEnvelope.id, newField);
    notify('success', 'Field Added', `Placed ${type.replace('_', ' ')} field on page ${activePage}.`);
  };

  return (
    <div className="flex flex-col bg-slate-100/70 min-h-[calc(100vh-4rem)] -m-8 pb-16 select-none">
      {/* Top Breadcrumbs & Header Bar */}
      <div className="bg-white border-b border-slate-200/80 px-6 py-3 space-y-2 shrink-0 shadow-2xs">
        {/* Breadcrumb row */}
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <button 
            onClick={() => setActiveView('envelopes')}
            className="hover:text-indigo-600 font-medium cursor-pointer"
          >
            Envelopes
          </button>
          <span>›</span>
          <span className="font-mono text-slate-700 font-semibold">{envelopeId.replace('#', '')}</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100">
            In Progress
          </span>
        </div>

        {/* Title and Top Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
              {envelopeTitle}
            </h1>
            <button
              onClick={() => {
                setIsStarred(!isStarred);
                notify('info', isStarred ? 'Removed from Favorites' : 'Added to Favorites', envelopeTitle);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
            >
              <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs text-slate-600">
              <button
                onClick={() => {
                  setLayoutMode('document');
                  setActiveTab('document');
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
                  layoutMode === 'document' ? 'bg-white text-indigo-600 font-bold shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Document Focus</span>
              </button>

              <button
                onClick={() => {
                  setLayoutMode('workflow');
                  setActiveTab('workflow');
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
                  layoutMode === 'workflow' ? 'bg-white text-indigo-600 font-bold shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Workflow Focus</span>
              </button>

              <button
                onClick={() => setLayoutMode('split')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
                  layoutMode === 'split' ? 'bg-white text-indigo-600 font-bold shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </button>
            </div>

            <button
              onClick={() => notify('success', 'Link Copied', 'Encrypted agreement sharing link copied to clipboard.')}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Share</span>
            </button>

            <button
              onClick={() => notify('info', 'Agreement Options', 'Export, void, or duplicate envelope')}
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => notify('info', 'Envelope Actions', 'Triggering pre-send audit & dispatch options')}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Actions</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center space-x-6 pt-2 text-xs font-medium border-t border-slate-100 overflow-x-auto">
          {[
            { id: 'document', label: 'Document' },
            { id: 'workflow', label: 'Workflow' },
            { id: 'signers', label: 'Signers', badge: '3' },
            { id: 'history', label: 'History' },
            { id: 'activity', label: 'Activity' },
            { id: 'attachments', label: 'Attachments' },
            { id: 'audit', label: 'Audit Trail' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`py-2 relative transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === tab.id
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                  {tab.badge}
                </span>
              )}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Sealed/Locked Banner or Revision Banner */}
      {activeEnvelope && (activeEnvelope.status === 'completed' || activeEnvelope.isLocked) && (
        <div className="mx-6 mt-3 p-4 rounded-2xl bg-emerald-950/95 text-white border border-emerald-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-xs font-bold text-white font-display">Document Cryptographically Sealed & Locked</strong>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-300 font-mono border border-emerald-700/50 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>SHA-256 Tamper-Protected</span>
                </span>
                {activeEnvelope.version && activeEnvelope.version > 1 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-300 font-mono border border-indigo-700">
                    Version {activeEnvelope.version}.0
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-200/85 mt-1 leading-relaxed">
                All parties have signed. The <strong>Certificate of Completion is appended to this PDF</strong>. This document is locked against tampering. Any post-seal alteration is permanently recorded in the append-only audit trail.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={() => openCertificateView(activeEnvelope.id)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>View Full Certificate</span>
            </button>

            <button
              onClick={() => setShowUnlockModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock & Revise Agreement</span>
            </button>
          </div>
        </div>
      )}

      {activeEnvelope && activeEnvelope.status === 'in_revision' && (
        <div className="mx-6 mt-3 p-4 rounded-2xl bg-indigo-950/95 text-white border border-indigo-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-xs font-bold text-white font-display">Agreement In Revision (Version {activeEnvelope.version || 2}.0)</strong>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/80 text-amber-300 font-mono border border-amber-700/50">
                  Unsealed for Clause Editing
                </span>
              </div>
              <p className="text-[11px] text-indigo-200/85 mt-1 leading-relaxed">
                Previous signatures have been invalidated and logged to the audit ledger. You may now modify contract text, re-arrange fields, and update clauses.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={() => resendEnvelopeForSigning(activeEnvelope.id)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Re-Send for Signatures (v{activeEnvelope.version || 2}.0)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Dynamic Area */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Left Thumbnails Sidebar (Shown in Document and Split modes) */}
        {(layoutMode === 'document' || layoutMode === 'split') && (
          <div className="w-48 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 flex flex-col justify-between shrink-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Documents</span>
                <button 
                  onClick={() => notify('info', 'Add Document', 'Upload additional PDF/DOCX schedules')}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Thumbnail Page Cards */}
              <div className="space-y-3 overflow-y-auto max-h-[540px] pr-1">
                {[1, 2, 3].map((pageNum) => (
                  <div
                    key={pageNum}
                    onClick={() => setActivePage(pageNum)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer relative group ${
                      activePage === pageNum
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-full h-32 bg-white rounded-lg border border-slate-200 shadow-2xs p-2.5 flex flex-col justify-between overflow-hidden">
                      <div className="space-y-1 text-left opacity-60">
                        <div className="h-1 bg-slate-400 rounded-full w-2/3" />
                        <div className="h-1 bg-slate-200 rounded-full w-full" />
                        <div className="h-1 bg-slate-200 rounded-full w-4/5" />
                        <div className="h-1 bg-slate-200 rounded-full w-full" />
                      </div>
                      <div className="flex justify-end">
                        <span className="text-[9px] font-mono font-bold text-slate-500">{pageNum}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-left pt-1">
                <p className="text-[11px] font-semibold text-slate-700 truncate">NDA_Acme_Globex.pdf</p>
                <p className="text-[10px] text-slate-400">7 pages</p>
              </div>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <button 
                onClick={() => setActivePage(Math.max(1, activePage - 1))}
                disabled={activePage <= 1}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px]">{activePage} / 7</span>
              <button 
                onClick={() => setActivePage(Math.min(7, activePage + 1))}
                disabled={activePage >= 7}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Center Main Document Viewer Canvas */}
        {(layoutMode === 'document' || layoutMode === 'split') && (
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
            {/* Top Document Canvas Toolbar */}
            <div className="h-11 border-b border-slate-100 bg-slate-50/70 px-4 flex items-center justify-between text-xs text-slate-600 shrink-0">
              {/* Zoom Controls */}
              <div className="flex items-center space-x-1.5">
                <button 
                  onClick={() => setZoomLevel(Math.max(75, zoomLevel - 10))}
                  className="p-1 rounded hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 font-mono text-[11px] text-slate-700 font-semibold">{zoomLevel}%</span>
                <button 
                  onClick={() => setZoomLevel(Math.min(130, zoomLevel + 10))}
                  className="p-1 rounded hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                <button 
                  className="p-1 rounded bg-slate-200 text-slate-800"
                  title="Pan Hand Tool"
                >
                  <Hand className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Annotation & Form Field Tool Icons */}
              <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                {[
                  { id: 'pen', icon: PenTool, title: 'Signature Block', type: 'signature' as FieldType },
                  { id: 'text', icon: Type, title: 'Text Blank', type: 'text' as FieldType },
                  { id: 'check', icon: CheckSquare, title: 'Checkbox', type: 'checkbox' as FieldType },
                  { id: 'date', icon: Calendar, title: 'Date Signed', type: 'date_signed' as FieldType },
                  { id: 'stamp', icon: Stamp, title: 'Notary Stamp', type: 'stamp' as FieldType },
                  { id: 'attach', icon: Paperclip, title: 'Attachment', type: 'attachment' as FieldType },
                  { id: 'image', icon: ImageIcon, title: 'Image Stamp', type: 'text' as FieldType }
                ].map(tool => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setActiveTool(tool.id as any);
                        handleAddField(tool.type);
                      }}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        activeTool === tool.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title={`Click to place ${tool.title}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}

                <div className="h-4 w-px bg-slate-200 mx-1" />

                {/* Create / Add Custom Signature Button */}
                <button
                  onClick={() => {
                    setModalTargetParty('disclosing');
                    setShowCustomSigModal(true);
                  }}
                  className="px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] flex items-center space-x-1 shadow-2xs cursor-pointer transition-colors"
                  title="Create and customize electronic signature"
                >
                  <PenTool className="w-3 h-3" />
                  <span>Custom Signature</span>
                </button>
              </div>
            </div>

            {/* Document Paper Body */}
            <div className="flex-1 overflow-auto p-6 flex justify-center bg-slate-100/50">
              <div 
                style={{ width: `${Math.round(680 * (zoomLevel / 100))}px` }}
                className="bg-white rounded-xl border border-slate-200/90 shadow-xl p-8 sm:p-12 text-xs leading-relaxed space-y-5 font-sans relative my-auto"
              >
                {/* Document Header */}
                <div className="text-center pb-4 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                    NON-DISCLOSURE AGREEMENT
                  </h2>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Reference: #{envelopeId.replace('#', '')}</p>
                </div>

                <p className="text-xs text-slate-700 leading-normal">
                  This Non-Disclosure Agreement ("Agreement") is entered into as of <strong>May 20, 2024</strong> by and between:
                </p>

                <div className="text-xs text-slate-800 space-y-2 pl-3 border-l-2 border-indigo-200">
                  <p><strong>Acme Corporation</strong>, a Delaware corporation, having its principal place of business at 123 Market Street, San Francisco, CA 94105 ("Disclosing Party"), and</p>
                  <p><strong>Globex Corporation</strong>, a Delaware corporation, having its principal place of business at 500 Business Road, New York, NY 10001 ("Receiving Party").</p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <h4 className="text-xs font-bold text-slate-900">1. Definition of Confidential Information</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Confidential Information includes all non-public information disclosed in any form, whether written, oral, or visual, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information.
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <h4 className="text-xs font-bold text-slate-900">2. Non-Use and Non-Disclosure Obligations</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Receiving Party agrees that it will hold in strict confidence and will not disclose or use Confidential Information for any purpose other than evaluating potential strategic collaboration.
                  </p>
                </div>

                {/* Signing Blocks Side-by-Side */}
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                  {/* Disclosing Party Field Column */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-900 uppercase block">
                      Disclosing Party <br /><span className="text-slate-400 font-normal">Acme Corporation</span>
                    </span>

                    {/* Interactive Signature Box (Click to customize) */}
                    <div 
                      onClick={() => {
                        setModalTargetParty('disclosing');
                        setShowCustomSigModal(true);
                      }}
                      className="p-3 rounded-xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/70 transition-all relative cursor-pointer group"
                      title="Click to change or create custom signature"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-indigo-700 font-bold block">Authorized Signature</span>
                        <span className="text-[9px] text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          ✎ Edit
                        </span>
                      </div>

                      <div className="h-12 flex items-center justify-start overflow-hidden">
                        {customDisclosingSig ? (
                          customDisclosingSig.type === 'draw' || customDisclosingSig.type === 'upload' ? (
                            <img src={customDisclosingSig.value} alt="Custom Signature" className="h-10 max-w-full object-contain" />
                          ) : customDisclosingSig.type === 'stamp' ? (
                            <span className="text-[10px] font-mono font-bold text-indigo-800 border border-indigo-400 px-2 py-0.5 rounded bg-white">
                              🛡️ {customDisclosingSig.value}
                            </span>
                          ) : (
                            <span 
                              style={{ color: customDisclosingSig.inkColor || '#1e3a8a' }}
                              className={`text-2xl block tracking-wide ${
                                customDisclosingSig.fontFamily === 'Dancing Script' ? 'signature-font-dancing' :
                                customDisclosingSig.fontFamily === 'Great Vibes' ? 'signature-font-greatvibes' :
                                customDisclosingSig.fontFamily === 'Caveat' ? 'signature-font-caveat' :
                                customDisclosingSig.fontFamily === 'Sacramento' ? 'signature-font-sacramento' :
                                'signature-font-alexbrush'
                              }`}
                            >
                              {customDisclosingSig.value}
                            </span>
                          )
                        ) : (
                          /* Realistic Cursive Signature SVG */
                          <svg className="w-32 h-10 text-indigo-900" viewBox="0 0 140 40">
                            <path
                              d="M 10 28 Q 25 5, 35 22 T 55 18 T 75 25 T 95 12 T 120 28"
                              fill="none"
                              stroke="#312e81"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </div>

                      <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                        {customDisclosingSig?.initials || 'JS'}
                      </span>
                    </div>

                    {/* Name */}
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60">
                      <span className="text-[10px] text-slate-400 block">Name</span>
                      <p className="text-xs font-semibold text-slate-800">
                        {customDisclosingSig?.name?.replace(/ \(.+\)/, '') || 'John Smith'}
                      </p>
                    </div>

                    {/* Title */}
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60">
                      <span className="text-[10px] text-slate-400 block">Title</span>
                      <p className="text-xs font-semibold text-slate-800">Legal Counsel</p>
                    </div>

                    {/* Date */}
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Date</span>
                        <p className="text-xs font-semibold text-slate-800">May 20, 2024</p>
                      </div>
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Receiving Party Field Column */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-900 uppercase block">
                      Receiving Party <br /><span className="text-slate-400 font-normal">Globex Corporation</span>
                    </span>

                    {/* Interactive Signature Box (Click to customize) */}
                    <div 
                      onClick={() => {
                        setModalTargetParty('receiving');
                        setShowCustomSigModal(true);
                      }}
                      className="p-3 rounded-xl border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50/70 transition-all relative cursor-pointer group"
                      title="Click to change or create custom signature"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-purple-700 font-bold block">Authorized Signature</span>
                        <span className="text-[9px] text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          ✎ Edit
                        </span>
                      </div>

                      <div className="h-12 flex items-center justify-start overflow-hidden">
                        {customReceivingSig ? (
                          customReceivingSig.type === 'draw' || customReceivingSig.type === 'upload' ? (
                            <img src={customReceivingSig.value} alt="Custom Signature" className="h-10 max-w-full object-contain" />
                          ) : customReceivingSig.type === 'stamp' ? (
                            <span className="text-[10px] font-mono font-bold text-purple-800 border border-purple-400 px-2 py-0.5 rounded bg-white">
                              🛡️ {customReceivingSig.value}
                            </span>
                          ) : (
                            <span 
                              style={{ color: customReceivingSig.inkColor || '#581c87' }}
                              className={`text-2xl block tracking-wide ${
                                customReceivingSig.fontFamily === 'Dancing Script' ? 'signature-font-dancing' :
                                customReceivingSig.fontFamily === 'Great Vibes' ? 'signature-font-greatvibes' :
                                customReceivingSig.fontFamily === 'Caveat' ? 'signature-font-caveat' :
                                customReceivingSig.fontFamily === 'Sacramento' ? 'signature-font-sacramento' :
                                'signature-font-alexbrush'
                              }`}
                            >
                              {customReceivingSig.value}
                            </span>
                          )
                        ) : (
                          <svg className="w-32 h-10 text-purple-900" viewBox="0 0 140 40">
                            <path
                              d="M 10 24 Q 30 8, 45 28 T 65 15 T 85 24 T 115 14 T 130 25"
                              fill="none"
                              stroke="#581c87"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </div>

                      <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                        {customReceivingSig?.initials || 'AM'}
                      </span>
                    </div>

                    {/* Name */}
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60">
                      <span className="text-[10px] text-slate-400 block">Name</span>
                      <p className="text-xs font-semibold text-slate-800">
                        {customReceivingSig?.name?.replace(/ \(.+\)/, '') || 'Alice Morgan'}
                      </p>
                    </div>

                    {/* Title */}
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60">
                      <span className="text-[10px] text-slate-400 block">Title</span>
                      <p className="text-xs font-semibold text-slate-800">VP, Legal</p>
                    </div>

                    {/* Date Placeholder */}
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Date</span>
                        <p className="text-xs text-slate-400">Select date</p>
                      </div>
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Appended Cryptographic Certificate of Completion Page */}
              {(activeEnvelope?.status === 'completed' || activeEnvelope?.isLocked || activeEnvelope?.certificateAppended) && (
                <div className="mt-8 p-6 rounded-2xl bg-slate-900 text-white border-2 border-emerald-500/50 shadow-xl space-y-4 font-sans animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <FileCheck className="w-5 h-5" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Cryptographic Certificate of Completion (Appended to PDF)
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">Immutable Legal Seal • US ESIGN Act §101 • EU eIDAS</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] font-mono font-bold">
                      STATUS: 🔒 SEALED & LOCKED
                    </span>
                  </div>

                  {/* Signers Summary Table */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-200">1. John Smith (Disclosing)</strong>
                        <span className="text-[10px] text-emerald-400 font-mono">Signed ✓</span>
                      </div>
                      <p className="text-[10px] text-slate-400">IP: 198.51.100.82 • Auth: Email OTP (2FA)</p>
                      <p className="text-[9px] font-mono text-indigo-400 truncate">SHA-256: 8941a029fe883019ab921c4409bb1082</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-200">2. Alice Morgan (Receiving)</strong>
                        <span className="text-[10px] text-emerald-400 font-mono">Signed ✓</span>
                      </div>
                      <p className="text-[10px] text-slate-400">IP: 198.51.100.94 • Auth: Biometric Draw</p>
                      <p className="text-[9px] font-mono text-indigo-400 truncate">SHA-256: 21f9fdfe63c04c2ea5fafb688556b679</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 gap-2">
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Tamper-evident Merkle hash chain validated. Any post-seal changes break integrity.</span>
                    </span>
                    <button
                      onClick={() => openCertificateView(activeEnvelope.id)}
                      className="text-indigo-400 hover:text-indigo-300 underline font-semibold text-left"
                    >
                      Inspect Full Legal Audit Ledger →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SHA-256 Verification Footer Bar */}
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
              <div className="flex items-center space-x-2 truncate pr-2">
                <span className="font-bold text-slate-700">SHA-256</span>
                <span className="truncate">a3b5c6d7e8f1f9a2b3c4d5e6f7a8b9c0d1e2f3e4b5c6d7e8f9a0b1c2d3e4f5a6b</span>
                <button 
                  onClick={() => notify('success', 'Hash Copied', 'SHA-256 cryptographic fingerprint copied.')}
                  className="hover:text-slate-800 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center space-x-1 shrink-0">
                <span>✓ Verified</span>
              </span>
            </div>
          </div>
        )}

        {/* Right Tools Palette / Recipient Panel (in Document Mode) */}
        {layoutMode === 'document' && (
          <div className="w-72 space-y-4 shrink-0 overflow-y-auto max-h-[640px] pr-1">
            {/* Custom Signature Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center space-x-1.5 text-slate-900">
                  <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                  <h4 className="text-xs font-bold">Custom Signatures</h4>
                </div>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold">
                  Active
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-snug">
                Design custom draw, calligraphic, or image-stamped signatures to apply to this agreement.
              </p>

              <div className="space-y-1.5 pt-1 text-xs">
                <button
                  onClick={() => {
                    setModalTargetParty('disclosing');
                    setShowCustomSigModal(true);
                  }}
                  className="w-full p-2 rounded-xl bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-200/80 text-indigo-900 font-medium text-left flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    <span>Customize John Smith's Signature</span>
                  </div>
                  <PenTool className="w-3 h-3 text-indigo-600" />
                </button>

                <button
                  onClick={() => {
                    setModalTargetParty('receiving');
                    setShowCustomSigModal(true);
                  }}
                  className="w-full p-2 rounded-xl bg-purple-50/60 hover:bg-purple-50 border border-purple-200/80 text-purple-900 font-medium text-left flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <span>Customize Alice Morgan's Signature</span>
                  </div>
                  <PenTool className="w-3 h-3 text-purple-600" />
                </button>
              </div>
            </div>
            {/* AI Smart Detect Banner */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-700">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold font-display">AI Smart Field Detection</span>
              </div>
              <p className="text-[11px] text-indigo-900/80 leading-snug">
                Scan document text for signature lines and auto-place fields with 98.2% accuracy.
              </p>
              <button
                onClick={() => notify('ai', 'AI Auto-Detect Completed', 'Positioned 4 signature & date fields on document.')}
                className="w-full py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                ⚡ AI Auto-Detect Fields
              </button>
            </div>

            {/* Recipient Selector */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 pb-1 border-b border-slate-100">Signing Party</h4>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'rec-1', name: 'John Smith', role: 'Disclosing Party', color: 'bg-indigo-600' },
                  { id: 'rec-2', name: 'Alice Morgan', role: 'Receiving Party', color: 'bg-purple-600' }
                ].map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => setSelectedRecipientId(rec.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-colors cursor-pointer flex items-center justify-between ${
                      selectedRecipientId === rec.id
                        ? 'border-indigo-500 bg-indigo-50/40 text-indigo-900 font-semibold'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{rec.name}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{rec.role}</p>
                    </div>
                    <span className={`w-3 h-3 rounded-full ${rec.color}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Toolbox Palette */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 pb-1 border-b border-slate-100">Click to Add Field</h4>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { type: 'signature' as FieldType, label: 'Signature', icon: PenTool },
                  { type: 'initial' as FieldType, label: 'Initials', icon: Type },
                  { type: 'date_signed' as FieldType, label: 'Date', icon: Calendar },
                  { type: 'text' as FieldType, label: 'Text Box', icon: FileText },
                  { type: 'checkbox' as FieldType, label: 'Checkbox', icon: CheckSquare },
                  { type: 'stamp' as FieldType, label: 'Notary Seal', icon: Stamp }
                ].map(tool => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.type}
                      onClick={() => handleAddField(tool.type)}
                      className="p-2 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-700 hover:text-indigo-700 text-left flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[11px] font-medium">{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Workflow Pane (Shown in Workflow & Split modes) */}
        {(layoutMode === 'workflow' || layoutMode === 'split') && (
          <div className="w-80 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between shrink-0">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900">Workflow Canvas</h3>
                <div className="flex items-center space-x-1.5">
                  <button 
                    onClick={() => notify('info', 'View Fitted', 'Graph bounds centered')}
                    className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 hover:bg-slate-200 cursor-pointer"
                  >
                    Fit View
                  </button>
                  <button 
                    onClick={() => setActiveView('workflows')}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Fullscreen Canvas Builder"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Visual Flowchart Nodes Stream */}
              <div className="pt-3 space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {/* Node 1: Start */}
                <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Send className="w-2.5 h-2.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900">Start</p>
                    <p className="text-[10px] text-slate-500">Envelope created by Tanish Khosla</p>
                    <p className="text-[9px] font-mono text-slate-400">May 20, 2024 10:42 AM</p>
                  </div>
                </div>

                <div className="flex justify-center text-slate-300 -my-1">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>

                {/* Node 2: Signer 1 (Signed) */}
                <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/30 flex items-start justify-between">
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[8px] flex items-center justify-center shrink-0 mt-0.5">
                      JS
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Signer 1</p>
                      <p className="text-xs font-bold text-slate-900 truncate">John Smith</p>
                      <p className="text-[10px] text-slate-500 truncate">john.smith@acme.com</p>
                      <p className="text-[9px] text-emerald-600 font-medium">Signed May 20, 2024 11:08 AM</p>
                    </div>
                  </div>
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center shrink-0">
                    ✓
                  </span>
                </div>

                <div className="flex justify-center text-slate-300 -my-1">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>

                {/* Node 3: Signer 2 (Pending) */}
                <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/30 flex items-start justify-between">
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[8px] flex items-center justify-center shrink-0 mt-0.5">
                      AM
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Signer 2</p>
                      <p className="text-xs font-bold text-slate-900 truncate">Alice Morgan</p>
                      <p className="text-[10px] text-slate-500 truncate">alice.morgan@globex.com</p>
                      <p className="text-[9px] text-amber-600 font-medium">Pending Waiting for signature</p>
                    </div>
                  </div>
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center shrink-0">
                    ⏳
                  </span>
                </div>

                <div className="flex justify-center text-slate-300 -my-1">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>

                {/* Node 4: Dynamic Conditional Rule */}
                <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                  <div className="flex items-center space-x-1.5 text-amber-700 text-xs font-bold">
                    <GitFork className="w-3.5 h-3.5" />
                    <span>Conditional Rule</span>
                  </div>
                  <p className="text-[11px] text-slate-700">If value &gt; $50,000 Require Legal Review</p>
                  
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                    <div className="p-1.5 rounded bg-white border border-emerald-200 text-emerald-800">
                      <p className="font-bold">● Yes: Legal Review</p>
                      <p className="text-[9px] text-slate-500">Tom Clark</p>
                      <span className="text-[8px] text-amber-600 font-semibold">Pending</span>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-slate-200 text-slate-600">
                      <p className="font-bold">● No: Skip</p>
                      <p className="text-[9px] text-slate-400">No Review</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center text-slate-300 -my-1">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>

                {/* Node 5: Complete */}
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Complete</p>
                    <p className="text-[10px] text-slate-500">Envelope will be sealed after all steps complete</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Details Sidebar (in Workflow Mode) */}
        {layoutMode === 'workflow' && (
          <div className="w-72 space-y-4 shrink-0 overflow-y-auto max-h-[640px] pr-1">
            {/* Workflow Details */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-900">Workflow Details</h4>
                <button 
                  onClick={() => setActiveView('workflows')}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Workflow Name</span>
                  <span className="font-semibold text-slate-800">NDA Standard Flow</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Workflow ID</span>
                  <span className="font-mono text-slate-700">WF-30091</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created By</span>
                  <span className="font-medium text-slate-800">Tanish Khosla</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created On</span>
                  <span className="text-slate-600">May 20, 2024 10:42 AM</span>
                </div>
              </div>
            </div>

            {/* Workflow Actions */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-slate-900 pb-1 border-b border-slate-100">Workflow Actions</h4>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setActiveView('workflows')}
                  className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-left flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Workflow</span>
                </button>
                <button
                  onClick={() => notify('success', 'Duplicated', 'Created copy of NDA Standard Flow')}
                  className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-left flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Duplicate Workflow</span>
                </button>
                <button
                  onClick={() => setActiveView('templates')}
                  className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-left flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>View as Template</span>
                </button>
              </div>
            </div>

            {/* Audit Summary Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-slate-900 pb-1 border-b border-slate-100">Audit Summary</h4>
              <div className="flex items-center space-x-2 text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Compliant</p>
                  <p className="text-[10px] text-slate-500 leading-tight">All signatures are valid and envelope is audit ready.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveView('compliance')}
                className="w-full py-1.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                View Audit Trail
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Status & Action Bar */}
      <div className="fixed bottom-3 left-68 right-8 z-40 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>Envelope ID: <strong className="font-mono text-slate-800">{envelopeId}</strong></span>
          <span>Status: <strong className="text-indigo-600">In Progress</strong></span>
          <span>Created: <strong className="text-slate-700">May 20, 2024 10:42 AM</strong></span>
          <span>Last Updated: <strong className="text-slate-700">May 20, 2024 11:08 AM</strong></span>
          <span>Owner: <strong className="text-slate-800">Tanish Khosla</strong></span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => openSigningSession(activeEnvelope?.id || 'env-msa-8921')}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Preview Signer View</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <button
            onClick={() => notify('success', 'Reminder Dispatched', 'Automated email reminder sent to pending signers.')}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Reminder</span>
            <ChevronDown className="w-3 h-3 text-white/80" />
          </button>
        </div>
      </div>

      {/* Custom Signature Creator Modal */}
      <CustomSignatureModal
        isOpen={showCustomSigModal}
        onClose={() => setShowCustomSigModal(false)}
        targetRole={modalTargetParty === 'disclosing' ? 'Disclosing Party (John Smith)' : 'Receiving Party (Alice Morgan)'}
        defaultName={modalTargetParty === 'disclosing' ? 'John Smith' : 'Alice Morgan'}
        defaultInitials={modalTargetParty === 'disclosing' ? 'JS' : 'AM'}
        onApplySignature={(sig) => {
          if (modalTargetParty === 'disclosing') {
            setCustomDisclosingSig(sig);
          } else {
            setCustomReceivingSig(sig);
          }
        }}
      />

      {/* Unlock & Revise Agreement Confirmation Modal */}
      {showUnlockModal && activeEnvelope && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5 text-slate-200">
            <div className="flex items-center space-x-3 text-amber-400">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">Unlock & Revise Agreement?</h3>
                <p className="text-xs text-slate-400">Creates Version {(activeEnvelope.version || 1) + 1}.0 and invalidates prior cryptographic seal</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-2 text-xs text-amber-200/90">
              <div className="flex items-center space-x-2 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Legal & Cryptographic Implications:</span>
              </div>
              <ul className="space-y-1 list-disc pl-4 text-[11px] leading-relaxed">
                <li>Existing electronic signatures will be <strong>invalidated and archived</strong>.</li>
                <li>The previous SHA-256 seal will be revoked, and an unlock event will be <strong>permanently logged in the append-only audit trail</strong>.</li>
                <li>Once you finish revising clauses, you will <strong>re-send fresh signing links</strong> to all parties for Version {(activeEnvelope.version || 1) + 1}.0.</li>
              </ul>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-semibold block">Reason for Revision (Recorded in Audit Ledger):</label>
              <textarea
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                rows={3}
                placeholder="e.g. Renegotiated indemnity limits with customer..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowUnlockModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  unlockEnvelopeForRevision(activeEnvelope.id, unlockReason);
                  setShowUnlockModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all hover:scale-[1.02] cursor-pointer"
              >
                Invalidate Seal & Unlock (v{(activeEnvelope.version || 1) + 1}.0)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
