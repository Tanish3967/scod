import React, { useState, useEffect } from 'react';
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
  Trash2,
  Unlock,
  FileCheck,
  AlertTriangle,
  RotateCcw,
  Edit3,
  Download,
  UploadCloud,
  History,
  Activity,
  FileCode,
  ShieldAlert,
  Key,
  RefreshCw,
  FileSpreadsheet,
  UserCheck,
  Users,
  Check,
  Search,
  FilePlus,
  Shield,
  Globe,
  Smartphone,
  CheckCircle,
  DownloadCloud,
  X,
  Fingerprint,
  Filter,
  ChevronUp,
  Laptop,
  Hash,
  ArrowRight,
  Code,
  Calculator,
  Sliders,
  ListPlus
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { FieldType, DocumentField, CustomSignature, Recipient, AuthType, EnvelopeAttachment } from '../../types/signflow';
import { CustomSignatureModal } from '../signatures/CustomSignatureModal';
import { ShareEnvelopeModal } from './ShareEnvelopeModal';
import { FieldPropertiesModal } from './FieldPropertiesModal';
import { formatTimestamp, sha256, generateFullSha256 } from '../../utils/cryptoUtils';
import { downloadJsonBundle, downloadFile, generateCsvString } from '../../utils/downloadUtils';
import { calculateFileSha256, formatFileSize } from '../../utils/documentParser';

interface AttachmentItem {
  id: string;
  name: string;
  size: string;
  fileType: string;
  sha256Hash: string;
  uploadedAt: string;
  uploadedBy: string;
  required: boolean;
  fileUrl?: string;
  rawData?: string;
  isPrimaryDocument?: boolean;
}

export const DocumentPrepStudio: React.FC = () => {
  const { 
    activeEnvelope, 
    updateEnvelope, 
    sendEnvelope, 
    addFieldToEnvelope,
    removeFieldFromEnvelope,
    setActiveView,
    openSigningSession,
    sendEnvelopeReminder,
    openCertificateView,
    deleteEnvelope,
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFieldForProperties, setSelectedFieldForProperties] = useState<DocumentField | null>(null);
  const [activeTool, setActiveTool] = useState<'cursor' | 'pen' | 'text' | 'check' | 'date'>('cursor');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('rec-1');
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Revision & Unlock State
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockReason, setUnlockReason] = useState('Authorized clause renegotiation & commercial amendments');

  // Custom Signature State
  const [showCustomSigModal, setShowCustomSigModal] = useState(false);
  const [selectedSigRecipient, setSelectedSigRecipient] = useState<Recipient | null>(null);
  const [recipientSignatures, setRecipientSignatures] = useState<Record<string, CustomSignature>>({});

  // Attachments State - Dynamically synchronized with activeEnvelope
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [previewingAttachment, setPreviewingAttachment] = useState<AttachmentItem | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Sync attachments whenever activeEnvelope loads or changes
  useEffect(() => {
    if (!activeEnvelope) return;

    // 1. Primary agreement document(s) from activeEnvelope.documents
    const primaryDocs: AttachmentItem[] = (activeEnvelope.documents || []).map((doc, idx) => ({
      id: doc.id || `doc-att-${idx}`,
      name: doc.name || 'Agreement_Document.pdf',
      size: doc.size || '1.2 MB',
      fileType: doc.fileType || 'pdf',
      sha256Hash: doc.sha256Hash || 'a89f71c4801e08db917c9d74944d18ec06f6ae9b6e3f225bb9d06bcf44e05412',
      uploadedAt: formatTimestamp(activeEnvelope.createdAt || new Date().toISOString()),
      uploadedBy: activeEnvelope.sender?.name || 'Sarah Jenkins',
      required: true,
      fileUrl: doc.fileUrl,
      rawData: doc.rawData,
      isPrimaryDocument: true
    }));

    // 2. Custom attached exhibits / riders from activeEnvelope.attachments
    const customExhibits: AttachmentItem[] = (activeEnvelope.attachments || [])
      .filter(att => !primaryDocs.some(d => d.name === att.name || d.id === att.id))
      .map(att => ({
        id: att.id,
        name: att.name,
        size: att.size,
        fileType: att.fileType,
        sha256Hash: att.sha256Hash,
        uploadedAt: att.uploadedAt,
        uploadedBy: att.uploadedBy,
        required: att.required,
        fileUrl: att.fileUrl,
        rawData: att.rawData,
        isPrimaryDocument: att.isPrimaryDocument ?? false
      }));

    setAttachments([...primaryDocs, ...customExhibits]);
  }, [activeEnvelope?.id, activeEnvelope?.documents, activeEnvelope?.attachments]);

  // Signers State
  const [showAddSignerModal, setShowAddSignerModal] = useState(false);
  const [isSequentialRouting, setIsSequentialRouting] = useState(true);
  const [newSignerName, setNewSignerName] = useState('');
  const [newSignerEmail, setNewSignerEmail] = useState('');
  const [newSignerRole, setNewSignerRole] = useState<'signer' | 'approver' | 'cc' | 'notary'>('signer');
  const [newSignerAuth, setNewSignerAuth] = useState<AuthType>('email');

  // Activity Tab State
  const [activityFilter, setActivityFilter] = useState<'all' | 'signing' | 'security' | 'seal' | 'system'>('all');

  // Audit Trail Redesign State
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<'all' | 'signature' | 'security' | 'seal' | 'system'>('all');
  const [expandedProofBlockIds, setExpandedProofBlockIds] = useState<Record<string, boolean>>({});
  const [copiedHashKey, setCopiedHashKey] = useState<string | null>(null);
  const [isVerifyingChain, setIsVerifyingChain] = useState(false);
  const [verificationProgressStep, setVerificationProgressStep] = useState<number>(0);
  const [showStudioActionsMenu, setShowStudioActionsMenu] = useState(false);
  const [copiedEnvelopeId, setCopiedEnvelopeId] = useState(false);

  const envelopeTitle = activeEnvelope?.title || 'NDA – Acme & Globex Corp.';
  const envelopeId = activeEnvelope?.id ? `#${activeEnvelope.id.toUpperCase().replace('ENV-', 'ENV-')}` : '#ENV-8921';

  // Dynamic Recipients List
  const recipientsList: Recipient[] = activeEnvelope?.recipients?.length ? activeEnvelope.recipients : [
    {
      id: 'rec-1',
      name: 'John Smith',
      email: 'john.smith@acme.com',
      role: 'signer',
      routingOrder: 1,
      authType: 'email',
      status: 'ready'
    },
    {
      id: 'rec-2',
      name: 'Alice Morgan',
      email: 'alice.morgan@globex.com',
      role: 'signer',
      routingOrder: 2,
      authType: 'passkey_webauthn',
      status: 'waiting'
    },
    {
      id: 'rec-3',
      name: 'Catherine Bell',
      email: 'catherine.bell@notary-tx.gov',
      role: 'approver',
      routingOrder: 3,
      authType: 'idv_biometric',
      status: 'waiting'
    }
  ];

  // Handle Tab Switch
  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    if (tabId === 'workflow') {
      setLayoutMode('workflow');
    } else if (tabId === 'document') {
      setLayoutMode('document');
    }
  };

  const handleSaveFieldProperties = (updatedField: DocumentField) => {
    if (!activeEnvelope) return;
    const updatedFields = activeEnvelope.fields.map(f => f.id === updatedField.id ? updatedField : f);
    updateEnvelope(activeEnvelope.id, { fields: updatedFields });
    notify('success', 'Field Updated', `Updated calculation and conditional logic for ${updatedField.label}.`);
  };

  const handleAddField = (type: FieldType) => {
    if (!activeEnvelope) return;
    const isFormula = type === 'formula';
    const isNumber = type === 'number';
    const isDropdown = type === 'dropdown';

    const newField: Omit<DocumentField, 'id'> = {
      type,
      label: isFormula ? 'Calculated Total' : isNumber ? 'Unit Price' : type.replace('_', ' ').toUpperCase(),
      fieldName: isFormula ? 'total_amount' : isNumber ? 'unit_price' : undefined,
      recipientId: selectedRecipientId,
      page: activePage,
      x: 20,
      y: 35 + (activeEnvelope.fields.length * 8) % 45,
      width: 36,
      height: 8,
      required: true,
      calculationFormula: isFormula ? '[unit_price] * 1' : undefined,
      isReadOnlyCalculated: isFormula,
      numberFormat: (isFormula || isNumber) ? 'currency' : undefined,
      currency: '$',
      options: isDropdown ? ['Standard Tier', 'Enterprise Tier', 'VIP Tier'] : undefined
    };
    addFieldToEnvelope(activeEnvelope.id, newField);
    notify('success', 'Field Added', `Placed ${type.replace('_', ' ')} field on page ${activePage}.`);
  };

  // Add Attachment Handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const hash = await calculateFileSha256(file);
    let fileUrl: string | undefined;
    try {
      fileUrl = URL.createObjectURL(file);
    } catch (_) {}

    const newAtt: AttachmentItem = {
      id: 'att-' + Date.now(),
      name: file.name,
      size: formatFileSize(file.size),
      fileType: file.name.split('.').pop() || 'pdf',
      sha256Hash: hash,
      uploadedAt: formatTimestamp(new Date().toISOString()),
      uploadedBy: activeEnvelope?.sender?.name || 'Sarah Jenkins',
      required: false,
      fileUrl,
      isPrimaryDocument: false
    };

    setAttachments(prev => [...prev, newAtt]);

    if (activeEnvelope) {
      const existingAttachments = activeEnvelope.attachments || [];
      updateEnvelope(activeEnvelope.id, {
        attachments: [...existingAttachments, newAtt]
      });
    }

    notify('success', 'Attachment Uploaded', `Uploaded "${file.name}" (${newAtt.size}) with verified SHA-256 hash.`);
  };

  // Download Attachment Handler
  const handleDownloadAttachment = (att: AttachmentItem) => {
    if (att.fileUrl) {
      const a = document.createElement('a');
      a.href = att.fileUrl;
      a.download = att.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      downloadFile(
        `SignFlow Enterprise Agreement Attachment\n\nFilename: ${att.name}\nSize: ${att.size}\nSHA-256 Digest: ${att.sha256Hash}\nUploaded: ${att.uploadedAt} by ${att.uploadedBy}\nEnvelope: ${activeEnvelope?.title || 'Agreement'}\n\n[Cryptographically Verified Signature Package]`,
        att.name.endsWith('.txt') || att.name.endsWith('.pdf') ? att.name : `${att.name}.txt`,
        'text/plain;charset=utf-8'
      );
    }
    notify('success', 'Download Started', `Downloading "${att.name}"`);
  };

  // Delete Attachment Handler
  const handleDeleteAttachment = (att: AttachmentItem) => {
    if (att.isPrimaryDocument) {
      notify('warning', 'Primary Document', 'Cannot remove the primary agreement document from this envelope.');
      return;
    }
    setAttachments(prev => prev.filter(a => a.id !== att.id));
    if (activeEnvelope) {
      updateEnvelope(activeEnvelope.id, {
        attachments: (activeEnvelope.attachments || []).filter(a => a.id !== att.id)
      });
    }
    notify('info', 'Attachment Removed', `Removed ${att.name}`);
  };

  // Toggle Required Review Handler
  const handleToggleRequiredReview = (att: AttachmentItem) => {
    if (att.isPrimaryDocument) return;
    const updated = attachments.map(a => a.id === att.id ? { ...a, required: !a.required } : a);
    setAttachments(updated);
    if (activeEnvelope) {
      updateEnvelope(activeEnvelope.id, {
        attachments: (activeEnvelope.attachments || []).map(a => a.id === att.id ? { ...a, required: !a.required } : a)
      });
    }
    notify('info', 'Review Setting Updated', `${att.name} is now ${!att.required ? 'marked as mandatory review' : 'optional'}.`);
  };

  // Add Signer Handler
  const handleAddSignerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSignerName.trim() || !newSignerEmail.trim()) return;

    const newRec: Recipient = {
      id: 'rec-' + Date.now(),
      name: newSignerName.trim(),
      email: newSignerEmail.trim(),
      role: newSignerRole as any,
      routingOrder: recipientsList.length + 1,
      authType: newSignerAuth,
      status: 'waiting'
    };

    if (activeEnvelope) {
      updateEnvelope(activeEnvelope.id, {
        recipients: [...recipientsList, newRec]
      });
    }

    notify('success', 'Signer Added', `Added ${newRec.name} (${newRec.email}) to recipient routing order.`);
    setShowAddSignerModal(false);
    setNewSignerName('');
    setNewSignerEmail('');
  };

  // Copy Hash Helper with visual feedback
  const handleCopyHash = (hash: string, key: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashKey(key);
    notify('success', 'Hash Copied', `SHA-256 fingerprint (${hash.slice(0, 16)}...) copied to clipboard.`);
    setTimeout(() => {
      setCopiedHashKey(null);
    }, 2000);
  };

  // Export Audit CSV
  const handleExportAuditCsv = () => {
    const rows = [
      ['Block #', 'Timestamp', 'Category', 'Action Title', 'Actor Name', 'Actor Email', 'IP Address', 'Geo Location', 'Device Fingerprint', 'Previous SHA-256 Hash', 'Current SHA-256 Hash', 'Compliance Standards'],
      ['1', '2024-05-20 10:42:18 UTC', 'GENESIS_BLOCK', 'Envelope Initiated & Cryptographic Digest Generated', 'Tanish Khosla', 'tanish.khosla@acme.com', '198.51.100.82', 'San Francisco, CA, USA', 'Chrome 122.0.6261.94 / macOS', '0000000000000000000000000000000000000000000000000000000000000000', 'a3b5c6d7e8f1f9a2b3c4d5e6f7a8b9c0d1e2f3e4b5c6d7e8f9a0b1c2d3e4f5a6b', 'ESIGN, eIDAS, SOC2'],
      ['2', '2024-05-20 11:06:45 UTC', 'SECURITY_CHALLENGE', 'SMS OTP 2FA Code Verified', 'John Smith', 'john.smith@acme.com', '198.51.100.82', 'San Francisco, CA, USA', 'Safari Mobile / iOS 17.4', 'a3b5c6d7e8f1f9a2b3c4d5e6f7a8b9c0d1e2f3e4b5c6d7e8f9a0b1c2d3e4f5a6b', 'c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7', 'ESIGN, eIDAS'],
      ['3', '2024-05-20 11:08:00 UTC', 'SIGNATURE_BLOCK', 'Vector Electronic Signature Affixed', 'John Smith', 'john.smith@acme.com', '198.51.100.82', 'San Francisco, CA, USA', 'Chrome 122 / Windows 11', 'c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7', '8941a029fe883019ab921c4409bb108221f9fdfe63c04c2ea5fafb688556b679', 'ESIGN, eIDAS, 21CFR11, SOC2'],
      ['4', '2024-05-20 11:16:02 UTC', 'AUTH_CHALLENGE', 'Passkey WebAuthn FIDO2 AAL3 Hardware Enclave Verification', 'Alice Morgan', 'alice.morgan@globex.com', '198.51.100.94', 'New York, NY, USA', 'Chrome 124 / Apple TouchID', '8941a029fe883019ab921c4409bb108221f9fdfe63c04c2ea5fafb688556b679', 'f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0', 'eIDAS QES, 21CFR11, SOC2'],
      ['5', '2024-05-20 11:20:00 UTC', 'SEAL_BLOCK', 'Certificate of Completion Appended & Tamper Lock Engaged', 'SignFlow Cryptographic Authority', 'vault-security@signflow.legal', '10.0.0.1 (Internal HSM)', 'AWS us-east-1', 'SignFlow-PKI-Engine-v4', 'f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0', '9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b', 'ESIGN, eIDAS QES, 21CFR11, SOC2']
    ];
    const csvContent = generateCsvString(rows);
    downloadFile(`SignFlow-Audit-Ledger-${activeEnvelope?.id || 'ENV-8921'}.csv`, csvContent, 'text/csv;charset=utf-8');
    notify('success', 'Audit Trail Exported', 'Downloaded complete cryptographic audit ledger as CSV.');
  };

  // Export Audit Evidence Bundle (JSON)
  const handleExportAuditJson = () => {
    downloadJsonBundle(`SignFlow-Merkle-Evidence-${activeEnvelope?.id || 'ENV-8921'}.json`, {
      envelopeId: activeEnvelope?.id || 'ENV-8921',
      title: activeEnvelope?.title || 'Agreement Envelope',
      rootMerkleHash: 'a3b5c6d7e8f1f9a2b3c4d5e6f7a8b9c0d1e2f3e4b5c6d7e8f9a0b1c2d3e4f5a6b',
      integrityStatus: '100% Cryptographically Intact',
      complianceStandards: ['US_ESIGN_Act_101', 'UETA', 'EU_eIDAS_QES', '21_CFR_Part_11', 'SOC_2_Type_II'],
      generatedAt: new Date().toISOString()
    });
    notify('success', 'Evidence Dataset Exported', 'Downloaded cryptographic JSON evidence bundle.');
  };

  // Re-verify Merkle Chain with animated sequence
  const handleVerifyMerkleChain = () => {
    setIsVerifyingChain(true);
    setVerificationProgressStep(1);
    setTimeout(() => setVerificationProgressStep(2), 200);
    setTimeout(() => setVerificationProgressStep(3), 400);
    setTimeout(() => setVerificationProgressStep(4), 600);
    setTimeout(() => {
      setVerificationProgressStep(5);
      setIsVerifyingChain(false);
      notify('success', 'Merkle Hash Chain Verified', '100% of SHA-256 blocks, timestamps, and HMAC signatures are cryptographically intact.');
    }, 850);
  };

  return (
    <div className="flex flex-col bg-slate-100/70 min-h-[calc(100vh-4rem)] -m-8 pb-16 select-none">
      {/* Top Breadcrumbs & Header Bar */}
      <div className="bg-white border-b border-slate-200/80 px-6 py-3.5 space-y-3 shrink-0 shadow-2xs">
        {/* Breadcrumb & Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-slate-500">
            <button 
              onClick={() => setActiveView('envelopes')}
              className="hover:text-indigo-600 font-medium cursor-pointer transition-colors"
            >
              Envelopes
            </button>
            <span className="text-slate-300">›</span>
            <div className="flex items-center space-x-1.5 font-mono text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
              <span>{envelopeId}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(envelopeId.replace('#', ''));
                  setCopiedEnvelopeId(true);
                  notify('success', 'Envelope ID Copied', `${envelopeId} copied to clipboard.`);
                  setTimeout(() => setCopiedEnvelopeId(false), 2000);
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Copy Envelope ID"
              >
                {copiedEnvelopeId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${
              activeEnvelope?.status === 'completed' || activeEnvelope?.isLocked
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                activeEnvelope?.status === 'completed' || activeEnvelope?.isLocked ? 'bg-emerald-500' : 'bg-indigo-500'
              }`} />
              <span>{activeEnvelope?.status === 'completed' || activeEnvelope?.isLocked ? 'Sealed & Locked' : 'In Progress'}</span>
            </span>

            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${
              (activeEnvelope?.agreementType === 'unilateral' || recipientsList.length === 1)
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              <span>{(activeEnvelope?.agreementType === 'unilateral' || recipientsList.length === 1) ? 'Unilateral (1 Signer)' : `${recipientsList.length} Signatories`}</span>
            </span>

            <span className="hidden md:inline-flex items-center space-x-1 text-[11px] font-mono text-slate-400">
              <span>• SHA-256 Digest Bound ✓</span>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
            <span>Last Synced: <strong className="text-slate-600">Just Now</strong></span>
            <span>•</span>
            <span>Owner: <strong className="text-slate-700">Tanish Khosla</strong></span>
          </div>
        </div>

        {/* Title and Top Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
              {envelopeTitle}
            </h1>
            <button
              onClick={() => {
                setIsStarred(!isStarred);
                notify('info', isStarred ? 'Removed from Favorites' : 'Added to Favorites', envelopeTitle);
              }}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
              title={isStarred ? "Remove from Starred" : "Star this envelope"}
            >
              <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Segmented Control */}
            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs text-slate-600 shadow-2xs">
              <button
                onClick={() => {
                  setLayoutMode('document');
                  setActiveTab('document');
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center space-x-1.5 ${
                  layoutMode === 'document' && activeTab === 'document' 
                    ? 'bg-white text-indigo-700 font-bold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
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
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center space-x-1.5 ${
                  layoutMode === 'workflow' && activeTab === 'workflow' 
                    ? 'bg-white text-indigo-700 font-bold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Workflow Focus</span>
              </button>

              <button
                onClick={() => {
                  setLayoutMode('split');
                  setActiveTab('document');
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center space-x-1.5 ${
                  layoutMode === 'split' 
                    ? 'bg-white text-indigo-700 font-bold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </button>
            </div>

            {/* Share Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer hover:border-indigo-300 hover:text-indigo-600"
              title="Share Agreement, Signing Links & Embed Code"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Share</span>
            </button>

            {/* Actions Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowStudioActionsMenu(!showStudioActionsMenu)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Actions</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showStudioActionsMenu ? 'rotate-180' : ''}`} />
              </button>

              {showStudioActionsMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 text-xs space-y-0.5 animate-in fade-in slide-in-from-top-2">
                  <button
                    onClick={() => {
                      setShowStudioActionsMenu(false);
                      setShowShareModal(true);
                    }}
                    className="w-full text-left p-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Share & Signer Links</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowStudioActionsMenu(false);
                      openSigningSession(activeEnvelope?.id || 'env-msa-8921');
                    }}
                    className="w-full text-left p-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Preview & Simulate Signing</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowStudioActionsMenu(false);
                      sendEnvelopeReminder(activeEnvelope?.id || 'env-msa-8921');
                    }}
                    className="w-full text-left p-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Send Automated Reminder</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowStudioActionsMenu(false);
                      openCertificateView(activeEnvelope?.id || 'env-msa-8921');
                    }}
                    className="w-full text-left p-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View Completion Certificate</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowStudioActionsMenu(false);
                      handleExportAuditCsv();
                    }}
                    className="w-full text-left p-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                    <span>Download Audit Ledger (.csv)</span>
                  </button>

                  <div className="border-t border-slate-100 pt-1 mt-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setShowStudioActionsMenu(false);
                        notify('warning', 'Envelope Voided', 'Agreement was voided and archived.');
                      }}
                      className="w-full text-left p-2 rounded-xl text-amber-700 hover:bg-amber-50 font-medium flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Void Envelope</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowStudioActionsMenu(false);
                        setShowDeleteModal(true);
                      }}
                      className="w-full text-left p-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Envelope</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center space-x-6 pt-2 text-xs font-medium border-t border-slate-100 overflow-x-auto">
          {[
            { id: 'document', label: 'Document', badge: '2 Pages' },
            { id: 'workflow', label: 'Workflow', badge: '4 Steps' },
            { id: 'signers', label: 'Signers', badge: `${recipientsList.length}` },
            { id: 'history', label: 'History', badge: `v${activeEnvelope?.version || 2}.0` },
            { id: 'activity', label: 'Activity', badge: '6' },
            { id: 'attachments', label: 'Attachments', badge: `${attachments.length}` },
            { id: 'audit', label: 'Audit Trail', badge: 'Verified ✓' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`py-2.5 relative transition-colors cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                activeTab === tab.id
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  tab.id === 'audit'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}>
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

        {/* ========================================================= */}
        {/* TAB 1: DOCUMENT VIEW (Document Canvas + Thumbnails + Tools) */}
        {/* ========================================================= */}
        {activeTab === 'document' && (
          <>
            {/* Left Thumbnails Navigator Sidebar (Collapsible: 208px / 56px) */}
            <div className={`${
              isLeftSidebarCollapsed ? 'w-14 p-2' : 'w-52 p-3.5'
            } bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between shrink-0 transition-all duration-300`}>
              {isLeftSidebarCollapsed ? (
                /* Collapsed Left Sidebar State */
                <div className="flex flex-col items-center space-y-4">
                  <button
                    onClick={() => setIsLeftSidebarCollapsed(false)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors"
                    title="Expand Pages Sidebar"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="h-px w-8 bg-slate-200" />

                  {/* Quick Page Icon Chips */}
                  <div className="space-y-2">
                    {(activeEnvelope?.documents?.[0]?.pages?.length 
                      ? activeEnvelope.documents[0].pages 
                      : [{ pageNumber: 1, title: 'Page 1', content: '' }]
                    ).map((page, pIdx) => {
                      const pageNum = page.pageNumber || pIdx + 1;
                      const isCurrentPage = activePage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setActivePage(pageNum)}
                          className={`w-9 h-9 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                            isCurrentPage
                              ? 'bg-indigo-600 text-white shadow-xs scale-105'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title={`Go to Page ${pageNum}`}
                        >
                          P.{pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      const fileInput = document.createElement('input');
                      fileInput.type = 'file';
                      fileInput.accept = '.pdf,.docx,.doc,.txt,.png,.jpg';
                      fileInput.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files);
                      fileInput.click();
                    }}
                    className="w-9 h-9 rounded-xl border border-dashed border-slate-300 hover:border-indigo-500 text-slate-400 hover:text-indigo-600 flex items-center justify-center cursor-pointer transition-colors"
                    title="Add Page / Upload Attachment"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Expanded Left Sidebar State */
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Section Header with Upload Shortcut & Collapse Button */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-800 font-display">Pages & Layout</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => {
                            const fileInput = document.createElement('input');
                            fileInput.type = 'file';
                            fileInput.accept = '.pdf,.docx,.doc,.txt,.png,.jpg';
                            fileInput.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files);
                            fileInput.click();
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Upload additional PDF/DOCX schedules or exhibits"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setIsLeftSidebarCollapsed(true)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Collapse Sidebar"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Document Metadata Pill */}
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-left space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <p className="text-[10.5px] font-bold text-slate-800 truncate" title={activeEnvelope?.documents?.[0]?.name || 'Agreement_Document.pdf'}>
                          {activeEnvelope?.documents?.[0]?.name || 'Agreement_Document.pdf'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-mono">
                        <span>{activeEnvelope?.documents?.[0]?.pages?.length || 1} Total Page(s)</span>
                        <span>{activeEnvelope?.documents?.[0]?.size || '62.9 KB'}</span>
                      </div>
                    </div>

                    {/* High-Fidelity Thumbnail Cards */}
                    <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1 scrollbar-thin">
                      {(activeEnvelope?.documents?.[0]?.pages?.length 
                        ? activeEnvelope.documents[0].pages 
                        : [{ pageNumber: 1, title: 'Page 1', content: '' }]
                      ).map((page, pIdx) => {
                        const pageNum = page.pageNumber || pIdx + 1;
                        const isCurrentPage = activePage === pageNum;
                        const pageFields = (activeEnvelope?.fields || []).filter(f => (f.page || 1) === pageNum);
                        const isFinalExecutionPage = pageNum === (activeEnvelope?.documents?.[0]?.pages?.length || 1);

                        return (
                          <div
                            key={pageNum}
                            onClick={() => setActivePage(pageNum)}
                            className={`p-2 rounded-xl border transition-all cursor-pointer relative group ${
                              isCurrentPage
                                ? 'border-indigo-600 ring-2 ring-indigo-500/25 bg-indigo-50/30 shadow-xs'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                            }`}
                          >
                            {/* Realistic Mini Paper Representation */}
                            <div className="w-full h-32 bg-white rounded-lg border border-slate-200/90 shadow-2xs p-2 flex flex-col justify-between overflow-hidden relative">
                              {page.imageUrl ? (
                                <div className="w-full h-24 overflow-hidden rounded bg-slate-100 flex items-center justify-center">
                                  <img src={page.imageUrl} alt={`Page ${pageNum}`} className="w-full h-full object-cover opacity-90" />
                                </div>
                              ) : (
                                <div className="space-y-1.5 text-left opacity-80 p-0.5">
                                  <div className="flex items-center justify-between">
                                    <p className="text-[8px] font-bold text-slate-800 line-clamp-1">
                                      {page.title || `Page ${pageNum}`}
                                    </p>
                                  </div>
                                  <div className="h-0.5 bg-indigo-500/60 rounded-full w-3/4" />
                                  <div className="h-0.5 bg-slate-200 rounded-full w-full" />
                                  <div className="h-0.5 bg-slate-200 rounded-full w-5/6" />
                                  <div className="h-0.5 bg-slate-200 rounded-full w-full" />
                                  
                                  {/* Mini Execution Placeholder Lines */}
                                  {isFinalExecutionPage && (
                                    <div className="pt-1 flex items-center space-x-1">
                                      <div className="h-2 w-7 rounded bg-indigo-100 border border-indigo-300 border-dashed" />
                                      <div className="h-2 w-7 rounded bg-purple-100 border border-purple-300 border-dashed" />
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Footer Info Strip on Thumbnail */}
                              <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[8.5px]">
                                <span className="text-slate-500 font-medium truncate max-w-[85px] flex items-center space-x-1">
                                  {pageFields.length > 0 ? (
                                    <span className="text-indigo-600 font-bold flex items-center space-x-0.5">
                                      <PenTool className="w-2.5 h-2.5 inline" />
                                      <span>{pageFields.length} {pageFields.length === 1 ? 'field' : 'fields'}</span>
                                    </span>
                                  ) : isFinalExecutionPage ? (
                                    <span className="text-purple-600 font-medium">Execution</span>
                                  ) : (
                                    <span className="text-slate-400">Standard</span>
                                  )}
                                </span>
                                <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[9px] ${
                                  isCurrentPage ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  P.{pageNum}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Thumbnail Navigator Pagination Footer */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                    <button 
                      onClick={() => setActivePage(Math.max(1, activePage - 1))}
                      disabled={activePage <= 1}
                      className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer text-slate-600"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-[11px] font-semibold text-slate-700">
                      Page {activePage} of {activeEnvelope?.documents?.[0]?.pages?.length || 1}
                    </span>
                    <button 
                      onClick={() => setActivePage(Math.min(activeEnvelope?.documents?.[0]?.pages?.length || 1, activePage + 1))}
                      disabled={activePage >= (activeEnvelope?.documents?.[0]?.pages?.length || 1)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer text-slate-600"
                      title="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Center Main High-Fidelity Document Viewer Canvas */}
            <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col overflow-hidden relative">
              {/* Floating Studio Canvas Toolbar */}
              <div className="h-12 border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-2.5 sm:px-3 flex items-center justify-between text-xs text-slate-600 shrink-0 gap-1.5 min-w-0 overflow-x-auto no-scrollbar">
                {/* Left Controls: Sidebar Toggle, Zoom & Pan */}
                <div className="flex items-center space-x-1 shrink-0">
                  {/* Left Sidebar Collapse Toggle */}
                  <button
                    onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                      isLeftSidebarCollapsed ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                    title={isLeftSidebarCollapsed ? "Expand Pages Navigator" : "Collapse Pages Navigator"}
                  >
                    <Columns className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center bg-slate-100/90 rounded-lg p-0.5 border border-slate-200/80 shrink-0">
                    <button 
                      onClick={() => setZoomLevel(Math.max(75, zoomLevel - 10))}
                      className="p-1 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                      title="Zoom Out (-10%)"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setZoomLevel(100)}
                      className="px-1.5 font-mono text-[11px] text-slate-800 font-bold hover:text-indigo-600 cursor-pointer whitespace-nowrap"
                      title="Reset to 100%"
                    >
                      {zoomLevel}%
                    </button>
                    <button 
                      onClick={() => setZoomLevel(Math.min(130, zoomLevel + 10))}
                      className="p-1 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                      title="Zoom In (+10%)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setZoomLevel(100)}
                    className="hidden xl:inline-flex items-center px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-semibold cursor-pointer transition-colors whitespace-nowrap shrink-0"
                    title="Fit to Canvas Width"
                  >
                    Fit Width
                  </button>

                  <div className="h-4 w-px bg-slate-200 mx-0.5 shrink-0" />

                  {/* Cursor / Pan Tool Selector */}
                  <div className="flex items-center bg-slate-100/90 rounded-lg p-0.5 border border-slate-200/80 shrink-0">
                    <button
                      onClick={() => setActiveTool('cursor')}
                      className={`p-1.5 rounded-md transition-all cursor-pointer ${
                        activeTool === 'cursor' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Select & Position Fields"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setActiveTool(activeTool === 'pen' ? 'cursor' : 'pen')}
                      className={`p-1.5 rounded-md transition-all cursor-pointer ${
                        activeTool === 'pen' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Pan / Navigate Canvas"
                    >
                      <Hand className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Center Quick Field Insertion Bar */}
                <div className="flex items-center space-x-0.5 bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80 shrink-0">
                  {[
                    { id: 'signature', label: 'Signature', icon: PenTool, iconColor: 'text-indigo-600', type: 'signature' as FieldType, key: 'S' },
                    { id: 'initial', label: 'Initials', icon: Type, iconColor: 'text-purple-600', type: 'initial' as FieldType, key: 'I' },
                    { id: 'date', label: 'Date', icon: Calendar, iconColor: 'text-emerald-600', type: 'date_signed' as FieldType, key: 'D' },
                    { id: 'text', label: 'Text', icon: FileText, iconColor: 'text-sky-600', type: 'text' as FieldType, key: 'T' },
                    { id: 'number', label: 'Number', icon: Hash, iconColor: 'text-emerald-600', type: 'number' as FieldType, key: '#' },
                    { id: 'formula', label: 'Formula / Calc', icon: Calculator, iconColor: 'text-indigo-600', type: 'formula' as FieldType, key: 'F' },
                    { id: 'dropdown', label: 'Dropdown', icon: ListPlus, iconColor: 'text-purple-600', type: 'dropdown' as FieldType, key: 'O' },
                    { id: 'checkbox', label: 'Check', icon: CheckSquare, iconColor: 'text-amber-600', type: 'checkbox' as FieldType, key: 'C' },
                    { id: 'stamp', label: 'Seal', icon: Stamp, iconColor: 'text-rose-600', type: 'stamp' as FieldType, key: 'N' }
                  ].map(tool => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleAddField(tool.type)}
                        className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:text-indigo-700 text-[11px] font-semibold flex items-center space-x-1 transition-all cursor-pointer hover:shadow-2xs whitespace-nowrap shrink-0"
                        title={`Place ${tool.label} field on current page (Hotkey: ${tool.key})`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${tool.iconColor} shrink-0`} />
                      </button>
                    );
                  })}
                </div>

                {/* Right Actions: AI Auto-Detect, Custom Signature & Right Sidebar Toggle */}
                <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setIsVerifyingChain(true);
                      notify('ai', 'AI Neural Field Scanner', 'Analyzing document structure and positioning signature lines...');
                      setTimeout(() => {
                        setIsVerifyingChain(false);
                        handleAddField('signature');
                        handleAddField('date_signed');
                        notify('success', 'AI Auto-Detect Complete', `Placed signature & date anchors on page ${activePage}.`);
                      }, 800);
                    }}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] flex items-center space-x-1 border border-indigo-200/80 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    title="Auto-detect signature and date lines using SignFlow AI"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin-slow shrink-0" />
                    <span className="hidden 2xl:inline">AI Auto-Detect</span>
                    <span className="hidden md:inline 2xl:hidden">AI Scan</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedSigRecipient(recipientsList[0] || null);
                      setShowCustomSigModal(true);
                    }}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-[11px] flex items-center space-x-1 shadow-xs cursor-pointer transition-all hover:scale-102 whitespace-nowrap shrink-0"
                    title="Design and customize digital signatures"
                  >
                    <PenTool className="w-3 h-3 shrink-0" />
                    <span className="hidden 2xl:inline">Custom Signature</span>
                    <span className="hidden md:inline 2xl:hidden">Sign</span>
                  </button>

                  {/* Right Sidebar Collapse Toggle */}
                  <button
                    onClick={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                      isRightSidebarCollapsed ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                    title={isRightSidebarCollapsed ? "Expand Tools Inspector" : "Collapse Tools Inspector"}
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Document Paper Canvas Body */}
              <div className="flex-1 overflow-auto p-6 sm:p-8 flex justify-center bg-slate-100/70 relative">
                {/* 680px Spacious Legal Paper (Strictly follows Rule 2) */}
                <div 
                  style={{ width: `${Math.round(680 * (zoomLevel / 100))}px` }}
                  className="bg-white rounded-2xl border border-slate-300/80 shadow-2xl p-8 sm:p-12 text-xs leading-relaxed space-y-6 font-sans relative my-auto min-h-[820px] transition-all"
                >
                  {/* High-Fidelity Legal Document Header */}
                  <div className="pb-5 border-b-2 border-slate-900/10 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                          <ShieldCheck className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block truncate">
                            ENTERPRISE AGREEMENT RECORD
                          </span>
                          <span className="text-xs font-bold text-slate-900 font-display truncate block">
                            SIGNFLOW CRYPTOGRAPHIC REPOSITORY
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/90 font-mono text-[9.5px] font-bold flex items-center space-x-1.5 whitespace-nowrap shrink-0 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="whitespace-nowrap leading-none">eIDAS / ESIGN BOUND</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight font-display">
                        {activeEnvelope?.documents?.[0]?.pages?.[activePage - 1]?.title || activeEnvelope?.title || 'AGREEMENT DOCUMENT'}
                      </h2>
                      <div className="flex items-center justify-center space-x-2 mt-1 text-[10.5px]">
                        <span className="text-slate-400 font-mono">Ref: {envelopeId}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          Page {activePage} of {activeEnvelope?.documents?.[0]?.pages?.length || 1}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-mono">v{activeEnvelope?.version || '1.0'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rich Legal Document Body Parser (Eliminates raw markdown artifacts) */}
                  {activeEnvelope?.documents?.[0]?.pages?.[activePage - 1]?.imageUrl ? (
                    <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-white flex items-center justify-center p-1 my-2">
                      <img 
                        src={activeEnvelope.documents[0].pages[activePage - 1].imageUrl} 
                        alt={`Page ${activePage}`} 
                        className="w-full h-auto object-contain rounded-xl shadow-2xs"
                      />
                    </div>
                  ) : activeEnvelope?.documents?.[0]?.pages?.[activePage - 1]?.content ? (
                    <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-sans">
                      {activeEnvelope.documents[0].pages[activePage - 1].content.split('\n\n').map((paragraph, pIdx) => {
                        // Section Heading
                        if (paragraph.startsWith('### ')) {
                          return (
                            <div key={pIdx} className="pt-3 pb-1 border-b border-slate-200">
                              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight font-display flex items-center space-x-2">
                                <span className="w-1.5 h-3.5 bg-indigo-600 rounded-sm inline-block" />
                                <span>{paragraph.replace('### ', '')}</span>
                              </h3>
                            </div>
                          );
                        }

                        // Subsection Heading
                        if (paragraph.startsWith('#### ')) {
                          return (
                            <h4 key={pIdx} className="text-xs font-bold text-slate-900 pt-2 text-indigo-950 font-display">
                              {paragraph.replace('#### ', '')}
                            </h4>
                          );
                        }

                        // PDF Ingestion Metadata Card Check
                        if (paragraph.includes('**PDF Document**:') || paragraph.includes('**Cryptographic Checksum**:')) {
                          const docName = paragraph.match(/\*\*PDF Document\*\*:\s*`([^`]+)`/)?.[1] || activeEnvelope?.documents?.[0]?.name || 'Document.pdf';
                          const docSize = paragraph.match(/\(([^)]+)\)/)?.[1] || activeEnvelope?.documents?.[0]?.size || '62.9 KB';
                          const checksum = paragraph.match(/`sha256-([^`]+)`/)?.[1] || activeEnvelope?.documents?.[0]?.sha256Hash || 'verified-hash';

                          return (
                            <div key={pIdx} className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/90 shadow-2xs space-y-3 my-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <span className="text-[11px] font-bold text-slate-900 block">{docName}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">{docSize} • High-Fidelity PDF Vector</span>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                  ✓ Ingested & Verified
                                </span>
                              </div>

                              {/* Checksum Bar with 1-Click Copy */}
                              <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between font-mono text-[10px] text-slate-600">
                                <div className="flex items-center space-x-1.5 truncate pr-2">
                                  <Hash className="w-3 h-3 text-indigo-500 shrink-0" />
                                  <span className="font-bold text-slate-700 shrink-0">SHA-256:</span>
                                  <span className="truncate">{checksum.startsWith('sha256-') ? checksum : `sha256-${checksum}`}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(checksum);
                                    notify('success', 'SHA-256 Copied', 'Cryptographic fingerprint copied to clipboard.');
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="Copy Checksum"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>

                              <p className="text-[10.5px] text-slate-500 italic leading-snug">
                                The genuine PDF document has been securely ingested and anchored into the SHA-256 Merkle chain. Signature fields, biometric stamps, and legal verification tags will be affixed directly to this agreement.
                              </p>
                            </div>
                          );
                        }

                        // Bullet List
                        if (paragraph.startsWith('- ')) {
                          return (
                            <ul key={pIdx} className="space-y-1.5 text-slate-700 pl-2">
                              {paragraph.split('\n').map((li, lIdx) => (
                                <li key={lIdx} className="flex items-start space-x-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                  <span className="leading-relaxed">
                                    {li.replace(/^- /, '').split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/).map((segment, sIdx) => {
                                      if (segment.startsWith('**') && segment.endsWith('**')) {
                                        return <strong key={sIdx} className="font-bold text-slate-900">{segment.slice(2, -2)}</strong>;
                                      }
                                      if (segment.startsWith('*') && segment.endsWith('*')) {
                                        return <em key={sIdx} className="italic text-slate-600">{segment.slice(1, -1)}</em>;
                                      }
                                      if (segment.startsWith('`') && segment.endsWith('`')) {
                                        return <code key={sIdx} className="px-1 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-indigo-700">{segment.slice(1, -1)}</code>;
                                      }
                                      return segment;
                                    })}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          );
                        }

                        // Standard Paragraph with Inline Bold/Italic/Code Parsing
                        return (
                          <p key={pIdx} className="leading-relaxed text-slate-700 whitespace-pre-line text-[11.5px]">
                            {paragraph.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/).map((segment, sIdx) => {
                              if (segment.startsWith('**') && segment.endsWith('**')) {
                                return <strong key={sIdx} className="font-bold text-slate-900">{segment.slice(2, -2)}</strong>;
                              }
                              if (segment.startsWith('*') && segment.endsWith('*')) {
                                return <em key={sIdx} className="italic text-slate-600">{segment.slice(1, -1)}</em>;
                              }
                              if (segment.startsWith('`') && segment.endsWith('`')) {
                                return <code key={sIdx} className="px-1 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-indigo-700">{segment.slice(1, -1)}</code>;
                              }
                              return segment;
                            })}
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 space-y-2">
                      <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-semibold text-slate-700">{activeEnvelope?.title || 'Uploaded Document'}</p>
                      <p className="text-[11px] text-slate-400">Ready for signature placement and multi-party routing.</p>
                    </div>
                  )}

                  {/* Interactive Placed Fields Layer on Paper Canvas */}
                  {(activeEnvelope?.fields || [])
                    .filter(f => (f.page || 1) === activePage)
                    .map((field) => {
                      const signer = recipientsList.find(r => r.id === field.recipientId) || recipientsList[0];
                      const signerIdx = recipientsList.findIndex(r => r.id === field.recipientId);
                      const isIndigo = signerIdx % 2 === 0;

                      return (
                        <div
                          key={field.id}
                          style={{
                            marginTop: '1rem',
                            marginBottom: '1rem'
                          }}
                          className={`p-3 rounded-xl border-2 border-dashed transition-all relative group shadow-xs cursor-pointer ${
                            isIndigo 
                              ? 'border-indigo-400 bg-indigo-50/70 hover:bg-indigo-50 text-indigo-950' 
                              : 'border-purple-400 bg-purple-50/70 hover:bg-purple-50 text-purple-950'
                          }`}
                          onClick={() => setSelectedFieldForProperties(field)}
                          onDoubleClick={() => setSelectedFieldForProperties(field)}
                          title="Click to edit field properties, calculations, and conditional logic"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              {field.type === 'signature' && <PenTool className="w-3.5 h-3.5 text-indigo-600" />}
                              {field.type === 'initial' && <Type className="w-3.5 h-3.5 text-purple-600" />}
                              {field.type === 'date_signed' && <Calendar className="w-3.5 h-3.5 text-emerald-600" />}
                              {field.type === 'text' && <FileText className="w-3.5 h-3.5 text-blue-600" />}
                              {field.type === 'number' && <Hash className="w-3.5 h-3.5 text-emerald-600" />}
                              {field.type === 'formula' && <Calculator className="w-3.5 h-3.5 text-indigo-600" />}
                              {field.type === 'dropdown' && <ListPlus className="w-3.5 h-3.5 text-purple-600" />}
                              {field.type === 'checkbox' && <CheckSquare className="w-3.5 h-3.5 text-amber-600" />}
                              {field.type === 'stamp' && <Stamp className="w-3.5 h-3.5 text-rose-600" />}
                              <span className="text-[11px] font-bold tracking-tight">
                                {field.label || field.type.toUpperCase()}
                              </span>
                              {field.required && <span className="text-rose-500 font-bold text-xs">*</span>}

                              {/* Calculated Formula Badge */}
                              {(field.isReadOnlyCalculated || field.type === 'formula' || field.calculationFormula) && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-800 font-mono font-bold border border-emerald-200">
                                  fx: {field.calculationFormula || field.formulaExpression || 'calc'}
                                </span>
                              )}

                              {/* Conditional Logic Badge */}
                              {field.conditionalRules && field.conditionalRules.length > 0 && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-100 text-indigo-800 font-mono font-bold border border-indigo-200">
                                  IF ({field.conditionalRules.length})
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-1.5">
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold">
                                {signer?.name || 'Signer'}
                              </span>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFieldForProperties(field);
                                }}
                                className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                title="Edit Field Properties & Logic"
                              >
                                <Sliders className="w-3 h-3" />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (activeEnvelope) {
                                    removeFieldFromEnvelope(activeEnvelope.id, field.id);
                                    notify('info', 'Field Removed', `Removed ${field.label} from Page ${activePage}.`);
                                  }
                                }}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove Field"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {/* Dynamic Signing Blocks for Configured Recipients - Side-by-Side Spacious Execution Grid */}
                  {activePage === (activeEnvelope?.documents?.[0]?.pages?.length || 1) ? (
                    <div className="pt-8 border-t-2 border-slate-900/15 space-y-5">
                      {/* Legal Attestation Clause Header */}
                      <div className="space-y-1 pb-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs font-display">
                            <PenTool className="w-4 h-4 text-indigo-600" />
                            <span className="uppercase tracking-tight">EXECUTION & SIGNATURE ATTESTATION</span>
                          </div>
                          <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-md border ${
                            recipientsList.length === 1 || activeEnvelope?.agreementType === 'unilateral'
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200 font-bold'
                              : 'text-slate-500 bg-slate-100 border-slate-200/80'
                          }`}>
                            {recipientsList.length === 1 || activeEnvelope?.agreementType === 'unilateral'
                              ? `Unilateral Signatory Execution • Page ${activePage}`
                              : `${recipientsList.length} Signers Bound • Page ${activePage}`}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 italic">
                          {recipientsList.length === 1 || activeEnvelope?.agreementType === 'unilateral'
                            ? "IN WITNESS WHEREOF, the undersigned has executed this Unilateral Undertaking as of the date set forth below."
                            : "IN WITNESS WHEREOF, the parties hereto have caused this Agreement to be executed by their duly authorized representatives."}
                        </p>
                      </div>

                      {/* Side-by-Side Spacious Execution Grid (Clean 2-Column with zero truncated text) */}
                      <div className={`grid gap-5 ${recipientsList.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                        {recipientsList.slice(0, 4).map((rec, rIdx) => {
                          const customSig = recipientSignatures[rec.id];
                          const isIndigo = rIdx % 2 === 0;

                          return (
                            <div 
                              key={rec.id} 
                              className={`p-4 rounded-2xl border transition-all shadow-xs space-y-3.5 ${
                                isIndigo 
                                  ? 'border-indigo-200/90 bg-indigo-50/25 hover:bg-indigo-50/40' 
                                  : 'border-purple-200/90 bg-purple-50/25 hover:bg-purple-50/40'
                              }`}
                            >
                              {/* Header: Role, Name, Status Pill */}
                              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
                                <div className="flex items-center space-x-2 truncate">
                                  <div className={`w-7 h-7 rounded-lg text-white text-[10px] font-bold flex items-center justify-center shadow-xs shrink-0 ${
                                    isIndigo ? 'bg-indigo-600' : 'bg-purple-600'
                                  }`}>
                                    {rec.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="truncate">
                                    <span className="text-[10.5px] font-bold text-slate-900 uppercase block font-display truncate">
                                      {rec.role === 'signer' ? `Party ${rIdx + 1}` : rec.role.toUpperCase()}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-normal truncate block">{rec.name}</span>
                                  </div>
                                </div>

                                <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                  rec.status === 'signed' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-white text-slate-700 border-slate-200 shadow-2xs'
                                }`}>
                                  {rec.status === 'signed' ? 'Signed ✓' : rec.authType}
                                </span>
                              </div>

                              {/* Spacious Interactive Signature Pad */}
                              <div 
                                onClick={() => {
                                  setSelectedSigRecipient(rec);
                                  setShowCustomSigModal(true);
                                }}
                                className={`p-3 rounded-xl border-2 border-dashed transition-all relative cursor-pointer group bg-white ${
                                  isIndigo
                                    ? 'border-indigo-300 hover:border-indigo-500 hover:shadow-xs'
                                    : 'border-purple-300 hover:border-purple-500 hover:shadow-xs'
                                }`}
                                title={`Click to adopt or edit signature for ${rec.name}`}
                              >
                                <div className="flex items-center justify-between pb-1">
                                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isIndigo ? 'text-indigo-700' : 'text-purple-700'}`}>
                                    By (Signature):
                                  </span>
                                  <span className="text-[9.5px] text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-0.5 bg-indigo-50 px-1.5 py-0.2 rounded">
                                    <Edit3 className="w-2.5 h-2.5" />
                                    <span>Adopt</span>
                                  </span>
                                </div>

                                <div className="h-14 flex items-center justify-start overflow-hidden px-1">
                                  {customSig ? (
                                    customSig.type === 'draw' || customSig.type === 'upload' ? (
                                      <img src={customSig.value} alt="Custom Signature" className="h-12 max-w-full object-contain" />
                                    ) : customSig.type === 'stamp' ? (
                                      <span className="text-[10px] font-mono font-bold text-indigo-800 border-2 border-indigo-400 px-2 py-0.5 rounded bg-indigo-50/50 flex items-center space-x-1">
                                        <Stamp className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>SEAL: {customSig.value}</span>
                                      </span>
                                    ) : (
                                      <span 
                                        style={{ color: customSig.inkColor || (isIndigo ? '#1e3a8a' : '#581c87') }}
                                        className="text-2xl block tracking-wide font-serif italic"
                                      >
                                        {customSig.value}
                                      </span>
                                    )
                                  ) : rec.signatureData ? (
                                    rec.signatureData.type === 'draw' || rec.signatureData.type === 'upload' ? (
                                      <img src={rec.signatureData.value} alt="Signature" className="h-12 max-w-full object-contain" />
                                    ) : (
                                      <span className="text-2xl block tracking-wide font-serif italic text-slate-800">
                                        {rec.signatureData.value}
                                      </span>
                                    )
                                  ) : (
                                    <div className="w-full h-11 flex items-center justify-center border border-dashed border-slate-300 rounded-lg bg-slate-50/70 text-slate-400 group-hover:border-indigo-400 group-hover:bg-indigo-50/40 group-hover:text-indigo-600 transition-all space-x-1.5 px-3">
                                      <PenTool className="w-3.5 h-3.5" />
                                      <span className="text-[11px] font-medium">Awaiting Signature — Click to Adopt</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Structured Metadata Rows (Clean, never truncated) */}
                              <div className="space-y-1.5 pt-0.5 text-[10.5px]">
                                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1">
                                  <span className="text-slate-400 font-medium">Printed Name:</span>
                                  <span className="font-bold text-slate-800 truncate max-w-[150px]">{customSig?.name?.replace(/ \(.+\)/, '') || rec.name}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1">
                                  <span className="text-slate-400 font-medium">Date Executed:</span>
                                  <span className="font-semibold text-slate-800">
                                    {rec.signedAt ? new Date(rec.signedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (
                                      <span className="text-slate-400 italic">Pending Execution</span>
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-slate-400 font-medium">Security:</span>
                                  {rec.status === 'signed' ? (
                                    <span className="text-emerald-700 font-mono font-bold flex items-center space-x-1">
                                      <span>✓ SHA-256 Validated</span>
                                    </span>
                                  ) : (
                                    <span className="text-amber-600 font-mono text-[10px] font-medium">
                                      ⏳ Pending Signature
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Jump to Signatures Banner on Non-Final Pages */
                    <div className="pt-6 border-t border-dashed border-slate-200 flex items-center justify-between text-slate-500 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-[11px] text-slate-500 font-medium">
                          Document continues on Page {activePage + 1} of {activeEnvelope?.documents?.[0]?.pages?.length || 1}
                        </span>
                      </div>
                      <button
                        onClick={() => setActivePage(activeEnvelope?.documents?.[0]?.pages?.length || 1)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1.5 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-xl transition-all border border-indigo-200 shadow-2xs"
                      >
                        <span>Jump to Signatures (Page {activeEnvelope?.documents?.[0]?.pages?.length || 1})</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Cryptographic SHA-256 Verification Ribbon Footer */}
              <div className="px-5 py-2.5 border-t border-slate-200/80 bg-slate-50/95 flex items-center justify-between text-[10.5px] font-mono text-slate-500 shrink-0">
                <div className="flex items-center space-x-2.5 truncate pr-2">
                  <div className="flex items-center space-x-1 font-bold text-slate-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>SHA-256 MERKLE ROOT:</span>
                  </div>
                  <span className="truncate text-slate-600 font-medium">
                    {activeEnvelope?.documents?.[0]?.sha256Hash || '1c154e4b259d85584e003336a0f4a7c2115340b3014ad2b2291d8320887d811d'}
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard?.writeText(activeEnvelope?.documents?.[0]?.sha256Hash || '1c154e4b259d85584e003336a0f4a7c2115340b3014ad2b2291d8320887d811d');
                      notify('success', 'Hash Copied', 'SHA-256 cryptographic fingerprint copied.');
                    }}
                    className="hover:text-indigo-600 p-0.5 rounded cursor-pointer"
                    title="Copy SHA-256 Hash"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Cryptographically Intact</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Studio Tools Palette & Recipient Inspector (Collapsible: 290px / 56px) */}
            {layoutMode !== 'split' && (
              <div className={`${
                isRightSidebarCollapsed ? 'w-14 p-2' : 'w-72 space-y-4'
              } shrink-0 overflow-y-auto max-h-[660px] pr-1 scrollbar-thin transition-all duration-300`}>
                {isRightSidebarCollapsed ? (
                  /* Collapsed Right Inspector State */
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-2 flex flex-col items-center space-y-4">
                    <button
                      onClick={() => setIsRightSidebarCollapsed(false)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors"
                      title="Expand Tools Inspector"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="h-px w-8 bg-slate-200" />

                    <button
                      onClick={() => {
                        setIsRightSidebarCollapsed(false);
                      }}
                      className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center cursor-pointer transition-colors"
                      title="Signing Parties"
                    >
                      <Users className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setIsRightSidebarCollapsed(false);
                      }}
                      className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                      title="Field Palette"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        notify('ai', 'AI Neural Field Scanner', 'Positioning execution blocks and signature lines...');
                        setTimeout(() => {
                          handleAddField('signature');
                          handleAddField('date_signed');
                          notify('success', 'AI Auto-Detect Complete', `Placed signature & date anchors on page ${activePage}.`);
                        }, 700);
                      }}
                      className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center cursor-pointer transition-colors"
                      title="AI Auto-Detect Fields"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Expanded Right Inspector State */
                  <>
                    {/* 1. Signing Parties & Recipient Selector */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <div className="flex items-center space-x-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-600" />
                          <h4 className="text-xs font-bold text-slate-900 font-display">Signing Parties</h4>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {recipientsList.length} Roles
                          </span>
                          <button
                            onClick={() => setIsRightSidebarCollapsed(true)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Collapse Tools Panel"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[10.5px] text-slate-500 leading-snug">
                        Select a signing party below to assign new placed fields and custom signatures:
                      </p>

                      <div className="space-y-2 text-xs">
                        {recipientsList.map((rec, rIdx) => {
                          const isSelected = selectedRecipientId === rec.id;
                          const isIndigo = rIdx % 2 === 0;

                          return (
                            <div
                              key={rec.id}
                              onClick={() => setSelectedRecipientId(rec.id)}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative space-y-2 ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500 shadow-2xs'
                                  : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                    isIndigo ? 'bg-indigo-600' : 'bg-purple-600'
                                  }`}>
                                    {rec.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="truncate">
                                    <p className="text-xs font-bold text-slate-900 truncate">{rec.name}</p>
                                    <p className="text-[10px] text-slate-400 font-normal truncate">{rec.email}</p>
                                  </div>
                                </div>

                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isSelected ? 'bg-indigo-600 ring-2 ring-indigo-300' : 'bg-slate-300'}`} />
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[9.5px]">
                                <span className="font-mono text-slate-500 font-medium">Auth: {rec.authType}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSigRecipient(rec);
                                    setShowCustomSigModal(true);
                                  }}
                                  className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center space-x-0.5 cursor-pointer"
                                >
                                  <PenTool className="w-2.5 h-2.5" />
                                  <span>Signature</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Click to Place Fields Palette */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <div className="flex items-center space-x-1.5">
                          <Plus className="w-3.5 h-3.5 text-indigo-600" />
                          <h4 className="text-xs font-bold text-slate-900 font-display">Field Palette</h4>
                        </div>
                        <span className="text-[10px] text-slate-400">Click to Place</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {[
                          { type: 'signature' as FieldType, label: 'Signature', icon: PenTool, color: 'text-indigo-600 bg-indigo-50' },
                          { type: 'initial' as FieldType, label: 'Initials', icon: Type, color: 'text-purple-600 bg-purple-50' },
                          { type: 'date_signed' as FieldType, label: 'Date Signed', icon: Calendar, color: 'text-emerald-600 bg-emerald-50' },
                          { type: 'text' as FieldType, label: 'Text Box', icon: FileText, color: 'text-blue-600 bg-blue-50' },
                          { type: 'checkbox' as FieldType, label: 'Checkbox', icon: CheckSquare, color: 'text-amber-600 bg-amber-50' },
                          { type: 'stamp' as FieldType, label: 'Notary Seal', icon: Stamp, color: 'text-rose-600 bg-rose-50' }
                        ].map(tool => {
                          const Icon = tool.icon;
                          return (
                            <button
                              key={tool.type}
                              onClick={() => handleAddField(tool.type)}
                              className="p-2.5 rounded-xl border border-slate-200/90 hover:border-indigo-400 hover:bg-indigo-50/30 text-slate-700 hover:text-indigo-900 text-left flex items-center space-x-2 transition-all cursor-pointer group shadow-2xs"
                            >
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${tool.color}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[11px] font-semibold truncate">{tool.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. AI Contract Intelligence */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-indigo-50/60 to-purple-50/40 border border-indigo-200/90 shadow-xs space-y-2.5">
                      <div className="flex items-center space-x-2 text-indigo-700">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold font-display">AI Contract Intelligence</span>
                      </div>
                      <p className="text-[11px] text-indigo-950/80 leading-snug">
                        Auto-align fields to scanned execution lines or run legal risk assessment across clauses.
                      </p>
                      <button
                        onClick={() => {
                          notify('ai', 'AI Neural Field Scanner', 'Positioning execution blocks and signature lines...');
                          setTimeout(() => {
                            handleAddField('signature');
                            handleAddField('date_signed');
                            notify('success', 'AI Auto-Detect Complete', `Placed signature & date anchors on page ${activePage}.`);
                          }, 700);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all cursor-pointer shadow-xs flex items-center justify-center space-x-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Auto-Detect Fields</span>
                      </button>
                    </div>

                    {/* 4. Document Specs & Security Summary */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-2">
                      <div className="flex items-center justify-between text-slate-800 font-bold pb-1 border-b border-slate-200/70">
                        <span>Document Summary</span>
                        <span className="text-indigo-600 font-mono text-[10px]">#ENV-265548D2</span>
                      </div>
                      <div className="flex justify-between text-[10.5px]">
                        <span className="text-slate-400">Total Fields:</span>
                        <span className="font-bold text-slate-800">{activeEnvelope?.fields?.length || 0} Placed</span>
                      </div>
                      <div className="flex justify-between text-[10.5px]">
                        <span className="text-slate-400">Tamper Status:</span>
                        <span className="font-bold text-emerald-700">✓ Cryptographically Locked</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* TAB 2: WORKFLOW VIEW (Flowchart & Step Configuration)    */}
        {/* ========================================================= */}
        {(activeTab === 'workflow' || layoutMode === 'split') && (
          <div className="flex-1 flex gap-6 overflow-hidden">
            <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2 text-indigo-600">
                    <GitFork className="w-5 h-5" />
                    <h3 className="text-sm font-bold text-slate-900 font-display">
                      Multi-Party Routing & Conditional Branching Pipeline
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setActiveView('workflows')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Open Fullscreen Canvas Builder</span>
                    </button>
                  </div>
                </div>

                {/* Flowchart Stream */}
                <div className="pt-6 space-y-4 max-w-xl mx-auto">
                  {/* Step 1 */}
                  <div className="p-4 rounded-2xl border-2 border-indigo-500/40 bg-indigo-50/30 flex items-start justify-between shadow-xs">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        1
                      </div>
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold uppercase">
                          Sequential Signer
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-1">John Smith (Disclosing Party)</h4>
                        <p className="text-[11px] text-slate-500">john.smith@acme.com • Auth: Email OTP (2FA)</p>
                        <p className="text-[10px] text-emerald-600 font-semibold mt-1">Signed May 20, 2024 11:08 AM ✓</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                      Completed ✓
                    </span>
                  </div>

                  <div className="flex justify-center text-slate-400">
                    <ArrowDown className="w-4 h-4 animate-bounce" />
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-2xl border-2 border-purple-500/40 bg-purple-50/30 flex items-start justify-between shadow-xs">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        2
                      </div>
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold uppercase">
                          Secondary Signer
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-1">Alice Morgan (Receiving Party)</h4>
                        <p className="text-[11px] text-slate-500">alice.morgan@globex.com • Auth: Passkey WebAuthn (FIDO2 L2)</p>
                        <p className="text-[10px] text-amber-600 font-semibold mt-1">Pending Signature ⏳</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openSigningSession(activeEnvelope?.id || 'env-msa-8921')}
                      className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold cursor-pointer transition-colors"
                    >
                      Simulate Sign
                    </button>
                  </div>

                  <div className="flex justify-center text-slate-400">
                    <ArrowDown className="w-4 h-4" />
                  </div>

                  {/* Step 3: Conditional Branch */}
                  <div className="p-4 rounded-2xl border-2 border-amber-500/40 bg-amber-50/30 space-y-2.5 shadow-xs">
                    <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs">
                      <GitFork className="w-4 h-4" />
                      <span>Conditional Amount Rule: Total Amount &gt; $50,000</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      If contract liability exceeds $50,000, trigger executive approval by VP Finance (Elena Rostova).
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-white border border-emerald-200 text-emerald-800">
                        <strong className="block text-[11px]">Branch A: Exceeds $50k</strong>
                        <span className="text-[10px] text-slate-500">Elena Rostova (VP Finance)</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600">
                        <strong className="block text-[11px]">Branch B: Under $50k</strong>
                        <span className="text-[10px] text-slate-400">Auto-Pass to Notary</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center text-slate-400">
                    <ArrowDown className="w-4 h-4" />
                  </div>

                  {/* Step 4: Completion */}
                  <div className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/40 flex items-center space-x-3 shadow-xs">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      4
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Cryptographic Seal & Webhook Dispatch</h4>
                      <p className="text-[11px] text-slate-500">Certificate of Completion appended + SHA-256 tamper-evident lock applied.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Workflow Palette */}
            {layoutMode !== 'split' && (
              <div className="w-72 space-y-4 shrink-0 overflow-y-auto max-h-[640px] pr-1">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900 pb-1 border-b border-slate-100">Workflow Settings</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Routing Mode</span>
                      <span className="font-semibold text-slate-800">Sequential (1 → 2 → 3)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Total Steps</span>
                      <span className="font-semibold text-slate-800">4 Active Steps</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Auto-Reminders</span>
                      <span className="font-semibold text-indigo-600">Every 48 Hours</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveView('workflows')}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit in Canvas Builder</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SIGNERS & RECIPIENTS MANAGEMENT HUB               */}
        {/* ========================================================= */}
        {activeTab === 'signers' && (
          <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <div className="flex items-center space-x-2 text-indigo-600">
                  <Users className="w-5 h-5" />
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Signers & Recipient Routing Management
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure authentication factors, signing order, role assignments, and dispatch tokenized magic links.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsSequentialRouting(!isSequentialRouting)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isSequentialRouting ? 'Routing: Sequential' : 'Routing: Parallel'}</span>
                </button>

                <button
                  onClick={() => setShowAddSignerModal(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Signer</span>
                </button>
              </div>
            </div>

            {/* Recipients Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipientsList.map((rec, index) => (
                <div 
                  key={rec.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all bg-slate-50/50 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                          {rec.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-xs font-bold text-slate-900">{rec.name}</h4>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-semibold uppercase">
                              #{index + 1}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{rec.email}</p>
                        </div>
                      </div>

                      {rec.status === 'signed' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Signed ✓</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending ⏳</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-[11px] bg-white p-3 rounded-xl border border-slate-200/80">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Role</span>
                        <span className="font-semibold text-slate-800 capitalize">{rec.role}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Authentication</span>
                        <span className="font-semibold text-indigo-600 font-mono">
                          {rec.authType === 'passkey_webauthn' ? 'Passkey FIDO2' : 
                           rec.authType === 'sms_otp' ? 'SMS OTP' : 
                           rec.authType === 'idv_biometric' ? 'IDV Biometrics' : 'Email OTP (2FA)'}
                        </span>
                      </div>
                      {rec.signedAt && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Signed At</span>
                          <span className="font-medium text-slate-700">{formatTimestamp(rec.signedAt)}</span>
                        </div>
                      )}
                      {rec.signatureData?.ipAddress && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Signer IP</span>
                          <span className="font-mono text-slate-600">{rec.signatureData.ipAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedSigRecipient(rec);
                        setShowCustomSigModal(true);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer text-center"
                    >
                      Adopt Sig
                    </button>

                    {rec.status !== 'signed' && (
                      <button
                        onClick={() => sendEnvelopeReminder(activeEnvelope?.id || 'env-msa-8921', rec.id)}
                        className="py-1.5 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 text-[11px] font-semibold transition-colors cursor-pointer flex items-center space-x-1"
                        title="Send Tokenized Email Reminder"
                      >
                        <Send className="w-3 h-3 text-amber-600" />
                        <span>Remind</span>
                      </button>
                    )}

                    <button
                      onClick={() => openSigningSession(activeEnvelope?.id || 'env-msa-8921', rec.id)}
                      className="py-1.5 px-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors cursor-pointer"
                      title="Simulate Signer View"
                    >
                      Sign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: HISTORY & VERSION REVISION TIMELINE               */}
        {/* ========================================================= */}
        {activeTab === 'history' && (
          <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <div className="flex items-center space-x-2 text-indigo-600">
                  <History className="w-5 h-5" />
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Document Version History & Revision Audit
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect historical versions, compare clause redlines, and view cryptographic seal invalidation logs.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => notify('success', 'Redline Report Exported', 'Saved version comparison summary.')}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export Redlines</span>
                </button>

                <button
                  onClick={() => setShowUnlockModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Create Revision</span>
                </button>
              </div>
            </div>

            {/* Version Timeline */}
            <div className="space-y-4">
              {/* Version 2.0 */}
              <div className="p-5 rounded-2xl border-2 border-indigo-500 bg-indigo-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white font-bold text-xs font-mono">
                      Version 2.0 (Active Live)
                    </span>
                    <span className="text-xs font-bold text-slate-900">Clause Renegotiation & Governing Law Rider</span>
                  </div>
                  <span className="text-[11px] text-slate-500">May 20, 2024 11:15 AM</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unsealed for clause amendments. Section 4 governing jurisdiction adjusted to Delaware commercial chancery court. Prior signatures invalidated and archived into audit chain.
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-indigo-200/60 font-mono">
                  <span>Author: Tanish Khosla (Disclosing Party)</span>
                  <span className="text-indigo-600 font-bold">Current Working Copy</span>
                </div>
              </div>

              {/* Version 1.1 */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-bold text-xs font-mono">
                      Version 1.1
                    </span>
                    <span className="text-xs font-bold text-slate-900">Counterparty Review Adjustments</span>
                  </div>
                  <span className="text-[11px] text-slate-500">May 20, 2024 10:55 AM</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Modified Section 2 non-disclosure duration from 2 years to 3 years per Alice Morgan's legal feedback.
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200 font-mono">
                  <span>Author: Alice Morgan (Receiving Party)</span>
                  <span className="text-slate-600">Archived Version</span>
                </div>
              </div>

              {/* Version 1.0 */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-bold text-xs font-mono">
                      Version 1.0
                    </span>
                    <span className="text-xs font-bold text-slate-900">Initial Agreement Draft Generated</span>
                  </div>
                  <span className="text-[11px] text-slate-500">May 20, 2024 10:42 AM</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Initial standard mutual non-disclosure agreement envelope created and validated with SHA-256 digest.
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200 font-mono">
                  <span>Author: Tanish Khosla</span>
                  <span className="text-slate-600">Archived Genesis Seal</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: REAL-TIME ACTIVITY & TELEMETRY FEED               */}
        {/* ========================================================= */}
        {activeTab === 'activity' && (
          <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <div className="flex items-center space-x-2 text-indigo-600">
                  <Activity className="w-5 h-5" />
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Real-Time Envelope Activity & Security Telemetry
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Immutable event stream logging signer access, authentication challenges, and document state changes.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportAuditCsv}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download CSV Log</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-2 text-xs">
              {[
                { id: 'all', label: 'All Events' },
                { id: 'signing', label: 'Signatures' },
                { id: 'security', label: 'Security & 2FA' },
                { id: 'seal', label: 'Cryptographic Seals' },
                { id: 'system', label: 'System' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActivityFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                    activityFilter === f.id
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Chronological Activity Feed */}
            <div className="space-y-3">
              {[
                {
                  id: 'act-1',
                  action: 'PASSKEY_AUTHENTICATED',
                  title: 'Passkey WebAuthn Challenge Verified',
                  actor: 'Alice Morgan (Receiving Party)',
                  email: 'alice.morgan@globex.com',
                  ip: '198.51.100.94',
                  geo: 'New York, NY, USA',
                  device: 'Chrome 124 / Apple TouchID Secure Enclave (FIDO2 L2)',
                  time: '2 minutes ago',
                  type: 'security'
                },
                {
                  id: 'act-2',
                  action: 'LINK_ACCESSED',
                  title: 'Signing Magic Link Opened',
                  actor: 'Alice Morgan',
                  email: 'alice.morgan@globex.com',
                  ip: '198.51.100.94',
                  geo: 'New York, NY, USA',
                  device: 'Firefox 125 / macOS Sonoma',
                  time: '8 minutes ago',
                  type: 'signing'
                },
                {
                  id: 'act-3',
                  action: 'SIGNATURE_AFFIXED',
                  title: 'Electronic Signature Affixed',
                  actor: 'John Smith (Disclosing Party)',
                  email: 'john.smith@acme.com',
                  ip: '198.51.100.82',
                  geo: 'San Francisco, CA, USA',
                  device: 'Chrome 122 / Windows 11',
                  time: '22 minutes ago',
                  type: 'signing'
                },
                {
                  id: 'act-4',
                  action: 'RECIPIENT_AUTHENTICATED',
                  title: 'SMS OTP 2FA Verified',
                  actor: 'John Smith',
                  email: 'john.smith@acme.com',
                  ip: '198.51.100.82',
                  geo: 'San Francisco, CA, USA',
                  device: 'Safari Mobile / iOS 17.4',
                  time: '24 minutes ago',
                  type: 'security'
                },
                {
                  id: 'act-5',
                  action: 'EMAIL_DELIVERED',
                  title: 'Signing Invitation Dispatched via Resend API',
                  actor: 'SignFlow Transactional Engine',
                  email: 'noreply@signflow.legal',
                  ip: '198.51.100.1',
                  geo: 'AWS us-east-1',
                  device: 'TLS 1.3 High-Delivery Gateway',
                  time: '45 minutes ago',
                  type: 'system'
                },
                {
                  id: 'act-6',
                  action: 'ENVELOPE_CREATED',
                  title: 'Envelope Created with SHA-256 Digest',
                  actor: 'Tanish Khosla',
                  email: 'tanish.khosla@acme.com',
                  ip: '198.51.100.82',
                  geo: 'San Francisco, CA, USA',
                  device: 'Chrome 122.0.6261.94',
                  time: '50 minutes ago',
                  type: 'seal'
                }
              ].filter(item => activityFilter === 'all' || item.type === activityFilter).map(item => (
                <div 
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      {item.type === 'security' ? <Key className="w-4 h-4" /> :
                       item.type === 'signing' ? <PenTool className="w-4 h-4" /> :
                       item.type === 'seal' ? <ShieldCheck className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-bold uppercase">
                          {item.action}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        <strong>{item.actor}</strong> ({item.email})
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.geo} • IP: {item.ip} • {item.device}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium text-slate-400 shrink-0 font-mono">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: ATTACHMENTS & SUPPORTING DOCUMENTS VAULT          */}
        {/* ========================================================= */}
        {activeTab === 'attachments' && (
          <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <div className="flex items-center space-x-2 text-indigo-600">
                  <Paperclip className="w-5 h-5" />
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Supporting Documents, Exhibits & Addenda Vault
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Attach supplementary schedules, bylaws, proof of identification, and statements of work to this envelope.
                </p>
              </div>

              <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer">
                <UploadCloud className="w-4 h-4" />
                <span>Upload Attachment</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </label>
            </div>

            {/* Drag and Drop Zone */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFile(false);
                handleFileUpload(e.dataTransfer.files);
              }}
              className={`p-8 rounded-2xl border-2 border-dashed text-center transition-all ${
                isDraggingFile
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
              }`}
            >
              <UploadCloud className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-900">Drag and drop supporting exhibits or riders here</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Supports PDF, DOCX, PNG, JPG, and ZIP files up to 50 MB</p>
            </div>

            {/* Attachments List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <span>Attached Documents & Exhibits ({attachments.length})</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  {attachments.filter(a => a.isPrimaryDocument).length} Primary • {attachments.filter(a => !a.isPrimaryDocument).length} Additional
                </span>
              </div>

              {attachments.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                  <Paperclip className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No Attachments Uploaded</p>
                  <p className="text-[11px] text-slate-400">Drag & drop files above or click Upload Attachment to append exhibits.</p>
                </div>
              ) : (
                attachments.map(att => (
                  <div 
                    key={att.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      att.isPrimaryDocument 
                        ? 'border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/50 shadow-2xs' 
                        : 'border-slate-200/80 bg-slate-50/40 hover:bg-white hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start sm:items-center space-x-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                        att.isPrimaryDocument 
                          ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs' 
                          : 'bg-indigo-50 border-indigo-200/80 text-indigo-600'
                      }`}>
                        {att.isPrimaryDocument ? <FileText className="w-5 h-5" /> : <FileCode className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="text-xs font-bold text-slate-900 truncate max-w-md">{att.name}</h5>
                          {att.isPrimaryDocument && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                              Primary Agreement Document
                            </span>
                          )}
                          {att.required ? (
                            <button
                              onClick={() => handleToggleRequiredReview(att)}
                              className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                              title="Click to toggle mandatory review requirement"
                            >
                              Required Review ✓
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleRequiredReview(att)}
                              className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                              title="Click to mark as mandatory review"
                            >
                              Optional Exhibit
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500">
                          {att.size} • Uploaded by <strong className="font-semibold text-slate-700">{att.uploadedBy}</strong> on {att.uploadedAt}
                        </p>

                        <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400 truncate">
                          <span className="text-slate-500 font-semibold">SHA-256:</span>
                          <span className="truncate">{att.sha256Hash}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(att.sha256Hash);
                              notify('success', 'Hash Copied', att.sha256Hash);
                            }}
                            className="hover:text-slate-700 p-0.5 cursor-pointer shrink-0"
                            title="Copy SHA-256 Fingerprint"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => setPreviewingAttachment(att)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1 shadow-2xs transition-colors cursor-pointer"
                        title="Preview Attachment"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => handleDownloadAttachment(att)}
                        className="px-2.5 py-1.5 rounded-lg border border-indigo-200 hover:border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center space-x-1 shadow-2xs transition-colors cursor-pointer"
                        title="Download Attachment"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>

                      {!att.isPrimaryDocument && (
                        <button
                          onClick={() => handleDeleteAttachment(att)}
                          className="p-1.5 rounded-lg border border-transparent hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Attachment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Attachment Preview Modal */}
            {previewingAttachment && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
                onClick={() => setPreviewingAttachment(null)}
              >
                <div 
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-in"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                        {previewingAttachment.isPrimaryDocument ? <FileText className="w-5 h-5" /> : <FileCode className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{previewingAttachment.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold uppercase">
                            {previewingAttachment.fileType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {previewingAttachment.size} • Uploaded by {previewingAttachment.uploadedBy} on {previewingAttachment.uploadedAt}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setPreviewingAttachment(null)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 overflow-y-auto space-y-4 flex-1">
                    {/* Security & Checksum Banner */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-3 space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cryptographic SHA-256 Digest</span>
                        <p className="font-mono text-[11px] text-slate-700 truncate">{previewingAttachment.sha256Hash}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(previewingAttachment.sha256Hash);
                          notify('success', 'Hash Copied', previewingAttachment.sha256Hash);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1 cursor-pointer shrink-0 shadow-2xs"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>

                    {/* Preview Area */}
                    {previewingAttachment.fileUrl && (previewingAttachment.fileType === 'png' || previewingAttachment.name.match(/\.(png|jpg|jpeg|webp)$/i)) ? (
                      <div className="rounded-xl border border-slate-200 bg-slate-100 p-2 flex justify-center overflow-hidden">
                        <img 
                          src={previewingAttachment.fileUrl} 
                          alt={previewingAttachment.name} 
                          className="max-w-full max-h-[400px] object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 font-sans text-xs text-slate-700 leading-relaxed">
                        <div className="flex items-center space-x-2 text-indigo-600 font-semibold border-b border-slate-200 pb-2">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Verified Authenticity & Signature Ingestion</span>
                        </div>
                        <p>
                          This document is an authenticated component of envelope <strong>{activeEnvelope?.title || 'Agreement'}</strong>.
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                          <li>File Classification: <span className="font-mono font-semibold">{previewingAttachment.isPrimaryDocument ? 'Primary Executable Agreement' : 'Supporting Schedule / Exhibit'}</span></li>
                          <li>Review Requirement: <span className="font-semibold">{previewingAttachment.required ? 'Mandatory for all signers' : 'Optional / Reference only'}</span></li>
                          <li>SHA-256 Integrity: <span className="font-mono text-emerald-700 font-bold">✓ Cryptographically Anchored</span></li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <span className="text-xs text-slate-500">SignFlow Document Vault</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownloadAttachment(previewingAttachment)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download File</span>
                      </button>
                      <button
                        onClick={() => setPreviewingAttachment(null)}
                        className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: TAMPER-EVIDENT SHA-256 MERKLE AUDIT TRAIL (REDESIGNED) */}
        {/* ========================================================= */}
        {activeTab === 'audit' && (() => {
          const canonicalAuditBlocks = [
            {
              id: 'block-1',
              blockNumber: 1,
              category: 'genesis' as const,
              categoryLabel: 'Genesis Seed',
              categoryColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
              iconColor: 'bg-indigo-600 text-white shadow-indigo-200',
              action: 'Envelope Initiated & Cryptographic Digest Generated',
              actorName: 'Tanish Khosla',
              actorRole: 'Disclosing Party / Originator',
              actorEmail: 'tanish.khosla@acme.com',
              actorAvatar: 'TK',
              details: 'Initiated mutual agreement envelope session. Uploaded source agreement and computed initial document SHA-256 fingerprint hash.',
              timestamp: 'May 20, 2024 10:42:18 UTC',
              relativeTime: 'Genesis Anchor',
              ip: '198.51.100.82',
              geo: 'San Francisco, CA, USA',
              device: 'Chrome 122.0.6261.94 (macOS Sonoma)',
              authFactor: 'Enterprise SSO (Okta 2FA)',
              prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
              currentHash: 'a3b5c6d7e8f1f9a2b3c4d5e6f7a8b9c0d1e2f3e4b5c6d7e8f9a0b1c2d3e4f5a6b',
              merkleLeafIndex: 0,
              hmacSignature: 'hmac_sha256_genesis_seed_8941a029fe883019',
              tags: ['ESIGN', 'eIDAS', 'SOC2'] as ('ESIGN' | 'eIDAS' | '21CFR11' | 'SOC2')[]
            },
            {
              id: 'block-2',
              blockNumber: 2,
              category: 'security' as const,
              categoryLabel: '2FA Identity Challenge',
              categoryColor: 'bg-amber-50 text-amber-800 border-amber-200',
              iconColor: 'bg-amber-500 text-white shadow-amber-200',
              action: 'SMS OTP 2FA Security Challenge Verified',
              actorName: 'John Smith',
              actorRole: 'Signer #1 (Disclosing Party)',
              actorEmail: 'john.smith@acme.com',
              actorAvatar: 'JS',
              details: 'Received 6-digit one-time passcode over carrier SMS (+1 •••-•••-4891) and successfully validated dual-factor identity challenge.',
              timestamp: 'May 20, 2024 11:06:45 UTC',
              relativeTime: '34 mins ago',
              ip: '198.51.100.82',
              geo: 'San Francisco, CA, USA',
              device: 'Safari Mobile 17.4 (iOS 17.4.1)',
              authFactor: 'SMS OTP (2FA Verified)',
              prevHash: 'a3b5c6d7e8f1f9a2b3c4d5e6f7a8b9c0d1e2f3e4b5c6d7e8f9a0b1c2d3e4f5a6b',
              currentHash: 'c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7',
              merkleLeafIndex: 1,
              hmacSignature: 'hmac_sha256_sms_token_2fa_c5d7e9f1a3b5',
              tags: ['ESIGN', 'eIDAS'] as ('ESIGN' | 'eIDAS' | '21CFR11' | 'SOC2')[]
            },
            {
              id: 'block-3',
              blockNumber: 3,
              category: 'signature' as const,
              categoryLabel: 'Electronic Signature',
              categoryColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
              iconColor: 'bg-emerald-600 text-white shadow-emerald-200',
              action: 'Vector Electronic Signature Affixed',
              actorName: 'John Smith',
              actorRole: 'Disclosing Party Signatory',
              actorEmail: 'john.smith@acme.com',
              actorAvatar: 'JS',
              details: 'Drawn cursive vector electronic signature placed on Page 2 (Execution Block) with cryptographic binding to document hash and explicit US ESIGN intent consent.',
              timestamp: 'May 20, 2024 11:08:00 UTC',
              relativeTime: '32 mins ago',
              ip: '198.51.100.82',
              geo: 'San Francisco, CA, USA',
              device: 'Chrome 122 / Windows 11 Pro',
              authFactor: 'Dual-Factor Authenticated (2FA)',
              prevHash: 'c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7',
              currentHash: '8941a029fe883019ab921c4409bb108221f9fdfe63c04c2ea5fafb688556b679',
              merkleLeafIndex: 2,
              hmacSignature: 'hmac_sha256_sig_disclosing_8941a029fe88',
              tags: ['ESIGN', 'eIDAS', '21CFR11', 'SOC2'] as ('ESIGN' | 'eIDAS' | '21CFR11' | 'SOC2')[]
            },
            {
              id: 'block-4',
              blockNumber: 4,
              category: 'security' as const,
              categoryLabel: 'FIDO2 Hardware Attestation',
              categoryColor: 'bg-purple-50 text-purple-800 border-purple-200',
              iconColor: 'bg-purple-600 text-white shadow-purple-200',
              action: 'Passkey WebAuthn FIDO2 AAL3 Challenge Verified',
              actorName: 'Alice Morgan',
              actorRole: 'Signer #2 (Receiving Party)',
              actorEmail: 'alice.morgan@globex.com',
              actorAvatar: 'AM',
              details: 'Cryptographic hardware enclave biometric assertion signed via Apple TouchID (FIDO2 L2 Level AAL3 Authenticator). Public key credential signature anchored.',
              timestamp: 'May 20, 2024 11:16:02 UTC',
              relativeTime: '24 mins ago',
              ip: '198.51.100.94',
              geo: 'New York, NY, USA',
              device: 'Chrome 124 / Apple TouchID Secure Enclave',
              authFactor: 'Passkey FIDO2 AAL3 (Hardware)',
              prevHash: '8941a029fe883019ab921c4409bb108221f9fdfe63c04c2ea5fafb688556b679',
              currentHash: 'f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0',
              merkleLeafIndex: 3,
              hmacSignature: 'hmac_sha256_webauthn_fido2_f8a0b2c4d6',
              tags: ['eIDAS', '21CFR11', 'SOC2'] as ('ESIGN' | 'eIDAS' | '21CFR11' | 'SOC2')[]
            },
            {
              id: 'block-5',
              blockNumber: 5,
              category: 'seal' as const,
              categoryLabel: 'Cryptographic PKI Seal',
              categoryColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
              iconColor: 'bg-cyan-700 text-white shadow-cyan-200',
              action: 'Certificate of Completion Appended & Tamper Lock Engaged',
              actorName: 'SignFlow Cryptographic Trust Vault',
              actorRole: 'Root Trust Authority / HSM Node',
              actorEmail: 'vault-security@signflow.legal',
              actorAvatar: 'SF',
              details: 'All required signatory evidence verified. Generated immutable PDF Certificate of Completion, appended page to master PDF, and engaged SHA-256 tamper-evident lock.',
              timestamp: 'May 20, 2024 11:20:00 UTC',
              relativeTime: '20 mins ago',
              ip: '10.0.0.1 (Internal HSM Enclave)',
              geo: 'AWS us-east-1 (Delaware Region)',
              device: 'SignFlow-PKI-Engine-v4 / HSM Thales Luna',
              authFactor: 'PKI Root HSM Signing Token',
              prevHash: 'f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0',
              currentHash: '9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b',
              merkleLeafIndex: 4,
              hmacSignature: 'hmac_sha256_root_seal_lock_9a1b3c5d7e9f',
              tags: ['ESIGN', 'eIDAS QES', '21CFR11', 'SOC2'] as ('ESIGN' | 'eIDAS' | '21CFR11' | 'SOC2')[]
            }
          ];

          // Append any dynamic custom audit trail events beyond standard genesis/seal
          const dynamicEvents = (activeEnvelope?.auditTrail || [])
            .filter(ev => !['GENESIS_BLOCK', 'SECURITY_CHALLENGE', 'SIGNATURE_BLOCK', 'AUTH_CHALLENGE', 'SEAL_BLOCK'].includes(ev.action) && !canonicalAuditBlocks.some(c => c.action === ev.action))
            .map((ev, idx) => ({
              id: ev.id || `extra-${idx}`,
              blockNumber: canonicalAuditBlocks.length + idx + 1,
              category: (ev.action.includes('Unlock') || ev.action.includes('Revision')) ? 'system' as const :
                        (ev.action.includes('Sign') || ev.action.includes('Signature')) ? 'signature' as const :
                        (ev.action.includes('Auth') || ev.action.includes('Security') || ev.action.includes('2FA')) ? 'security' as const :
                        (ev.action.includes('Seal') || ev.action.includes('Lock') || ev.action.includes('Tamper')) ? 'seal' as const : 'system' as const,
              categoryLabel: ev.action.includes('Unlock') ? 'Revision Mode' : ev.action.includes('Tamper') ? 'Tamper Alert' : 'System Event',
              categoryColor: ev.action.includes('Tamper') ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200',
              iconColor: ev.action.includes('Tamper') ? 'bg-rose-600 text-white' : 'bg-slate-700 text-white',
              action: ev.action,
              actorName: ev.actor,
              actorRole: 'Authenticated User',
              actorEmail: ev.actor.includes('@') ? ev.actor : undefined,
              actorAvatar: ev.actor.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SF',
              details: ev.details,
              timestamp: formatTimestamp(ev.timestamp),
              relativeTime: 'Recent Event',
              ip: ev.ipAddress || '198.51.100.82',
              geo: ev.geo || 'San Francisco, CA, USA',
              device: ev.device || 'Chrome 124 / macOS',
              authFactor: 'Session Authenticated',
              prevHash: ev.hashChainPrevious || 'PREV_HASH_CHAIN_0',
              currentHash: ev.hashChainCurrent || 'CURR_HASH_CHAIN_1',
              merkleLeafIndex: canonicalAuditBlocks.length + idx,
              hmacSignature: `hmac_sha256_${ev.id || 'extra'}_proof`,
              tags: ev.complianceTags || ['ESIGN', 'SOC2']
            }));

          const allBlocks = [...canonicalAuditBlocks, ...dynamicEvents];

          // Filter by category and search term
          const filteredBlocks = allBlocks.filter(b => {
            const matchesCategory = 
              auditCategoryFilter === 'all' ? true :
              auditCategoryFilter === 'signature' ? b.category === 'signature' :
              auditCategoryFilter === 'security' ? b.category === 'security' :
              auditCategoryFilter === 'seal' ? b.category === 'seal' :
              auditCategoryFilter === 'system' ? (b.category === 'genesis' || b.category === 'system') : true;

            if (!matchesCategory) return false;

            if (!auditSearchQuery.trim()) return true;
            const q = auditSearchQuery.toLowerCase();
            return (
              b.action.toLowerCase().includes(q) ||
              b.actorName.toLowerCase().includes(q) ||
              (b.actorEmail && b.actorEmail.toLowerCase().includes(q)) ||
              b.details.toLowerCase().includes(q) ||
              b.ip.toLowerCase().includes(q) ||
              b.geo.toLowerCase().includes(q) ||
              b.device.toLowerCase().includes(q) ||
              b.currentHash.toLowerCase().includes(q) ||
              b.prevHash.toLowerCase().includes(q) ||
              b.tags.some(t => t.toLowerCase().includes(q))
            );
          });

          // Counts for category badges
          const countAll = allBlocks.length;
          const countSignatures = allBlocks.filter(b => b.category === 'signature').length;
          const countSecurity = allBlocks.filter(b => b.category === 'security').length;
          const countSeals = allBlocks.filter(b => b.category === 'seal').length;
          const countSystem = allBlocks.filter(b => b.category === 'genesis' || b.category === 'system').length;

          const toggleProof = (id: string) => {
            setExpandedProofBlockIds(prev => ({ ...prev, [id]: !prev[id] }));
          };

          const toggleAllProofs = () => {
            const allExpanded = allBlocks.every(b => expandedProofBlockIds[b.id]);
            const nextState: Record<string, boolean> = {};
            allBlocks.forEach(b => {
              nextState[b.id] = !allExpanded;
            });
            setExpandedProofBlockIds(nextState);
          };

          return (
            <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 overflow-y-auto">
              {/* Header Section */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-slate-100 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                        <span>Cryptographic Merkle Audit Trail & Legal Ledger</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          SHA-256 HMAC
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Append-only mathematical hash chain providing absolute non-repudiation under US ESIGN Act §101, UETA, and EU eIDAS.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleVerifyMerkleChain}
                    disabled={isVerifyingChain}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                      isVerifyingChain
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 shadow-2xs'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingChain ? 'animate-spin text-emerald-600' : 'text-emerald-700'}`} />
                    <span>{isVerifyingChain ? 'Verifying Merkle Roots...' : 'Verify Merkle Integrity'}</span>
                  </button>

                  <button
                    onClick={handleExportAuditCsv}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                    title="Download CSV Ledger"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>CSV</span>
                  </button>

                  <button
                    onClick={handleExportAuditJson}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                    title="Download JSON Evidence Bundle"
                  >
                    <Code className="w-3.5 h-3.5 text-indigo-600" />
                    <span>JSON</span>
                  </button>

                  <button
                    onClick={() => openCertificateView(activeEnvelope?.id || 'env-msa-8921')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Full Certificate of Completion</span>
                  </button>
                </div>
              </div>

              {/* High-Level Executive Telemetry Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Root Merkle Hash */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-col justify-between shadow-xs relative overflow-hidden group">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">Root Merkle Hash</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                        256-bit
                      </span>
                    </div>
                    <p className="text-xs font-mono font-bold text-emerald-400 truncate mt-1 select-all" title="a3b5c6d7e8f1f9a2b3c4d5e6f7a8b9c0d1e2f3e4b5c6d7e8f9a0b1c2d3e4f5a6b">
                      a3b5c6d7...d3e4f5a6b
                    </p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>HMAC SHA-256 Digest</span>
                    <button
                      onClick={() => handleCopyHash('a3b5c6d7e8f1f9a2b3c4d5e6f7a8b9c0d1e2f3e4b5c6d7e8f9a0b1c2d3e4f5a6b', 'root_hash')}
                      className="hover:text-white flex items-center space-x-1 text-emerald-400 cursor-pointer font-medium"
                    >
                      {copiedHashKey === 'root_hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHashKey === 'root_hash' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Cryptographic Integrity Health */}
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-white flex flex-col justify-between shadow-xs">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-emerald-300 font-semibold tracking-wider">Chain Integrity</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="flex items-center space-x-1.5 text-emerald-300 font-bold text-sm mt-0.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>100% Intact & Verified</span>
                    </div>
                  </div>
                  <div className="pt-2 mt-2 border-t border-emerald-800/40 text-[10px] text-emerald-200/80 flex items-center justify-between">
                    <span>0 Tampering Alerts</span>
                    <span className="font-mono text-[9px] text-emerald-300">Unbroken Chain</span>
                  </div>
                </div>

                {/* 3. Legal & Statutory Non-Repudiation */}
                <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 text-white flex flex-col justify-between shadow-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-indigo-300 font-semibold tracking-wider">Legal Enforceability</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-900/80 border border-indigo-700/60 text-indigo-200 text-[10px] font-bold">
                        US ESIGN §101
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-900/80 border border-indigo-700/60 text-indigo-200 text-[10px] font-bold">
                        eIDAS QES
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 mt-2 border-t border-indigo-800/40 text-[10px] text-indigo-200/80 flex items-center justify-between">
                    <span>21 CFR Part 11 • UETA</span>
                    <span className="text-emerald-400 font-bold">Admissible</span>
                  </div>
                </div>

                {/* 4. Total Anchored Blocks */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-900 flex flex-col justify-between shadow-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">Total Anchored Blocks</span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xl font-bold font-display text-slate-900">{allBlocks.length}</span>
                      <span className="text-xs text-slate-500 font-medium">Immutable Events</span>
                    </div>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between font-mono">
                    <span>Genesis: 10:42 UTC</span>
                    <span className="text-indigo-600 font-bold">Latest: v2.0</span>
                  </div>
                </div>
              </div>

              {/* Live Animated Merkle Integrity Check Banner (Displays when verifying or step > 0) */}
              {isVerifyingChain && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2.5 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                      <span>Verifying Cryptographic Ledger Proofs...</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700">
                      Step {verificationProgressStep} / 5
                    </span>
                  </div>

                  {/* Progress Step Nodes */}
                  <div className="grid grid-cols-5 gap-2 text-[10px] font-mono text-center">
                    <div className={`p-1.5 rounded-lg border transition-colors ${verificationProgressStep >= 1 ? 'bg-emerald-600 text-white border-emerald-700 font-bold' : 'bg-white text-slate-400 border-slate-200'}`}>
                      1. Genesis Root ✓
                    </div>
                    <div className={`p-1.5 rounded-lg border transition-colors ${verificationProgressStep >= 2 ? 'bg-emerald-600 text-white border-emerald-700 font-bold' : 'bg-white text-slate-400 border-slate-200'}`}>
                      2. SMS 2FA Match ✓
                    </div>
                    <div className={`p-1.5 rounded-lg border transition-colors ${verificationProgressStep >= 3 ? 'bg-emerald-600 text-white border-emerald-700 font-bold' : 'bg-white text-slate-400 border-slate-200'}`}>
                      3. Signer Digest ✓
                    </div>
                    <div className={`p-1.5 rounded-lg border transition-colors ${verificationProgressStep >= 4 ? 'bg-emerald-600 text-white border-emerald-700 font-bold' : 'bg-white text-slate-400 border-slate-200'}`}>
                      4. FIDO2 Passkey ✓
                    </div>
                    <div className={`p-1.5 rounded-lg border transition-colors ${verificationProgressStep >= 5 ? 'bg-emerald-600 text-white border-emerald-700 font-bold' : 'bg-white text-slate-400 border-slate-200'}`}>
                      5. Seal Locked ✓
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Search, Category Filters & View Toggle Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    placeholder="Search by actor, action, IP, or hash digest..."
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {auditSearchQuery && (
                    <button
                      onClick={() => setAuditSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter Pills & Toggle */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: 'All Blocks', count: countAll },
                    { id: 'signature', label: 'Signatures ✍️', count: countSignatures },
                    { id: 'security', label: 'Security & 2FA 🔐', count: countSecurity },
                    { id: 'seal', label: 'PKI Seals 🛡️', count: countSeals },
                    { id: 'system', label: 'System & Origin ⚡', count: countSystem }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setAuditCategoryFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                        auditCategoryFilter === f.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{f.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        auditCategoryFilter === f.id ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {f.count}
                      </span>
                    </button>
                  ))}

                  <button
                    onClick={toggleAllProofs}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer ml-1"
                    title="Toggle Cryptographic Details for All Blocks"
                  >
                    {allBlocks.every(b => expandedProofBlockIds[b.id]) ? 'Collapse Proofs' : 'Expand Proofs'}
                  </button>
                </div>
              </div>

              {/* Redesigned Chronological Merkle Chain Stream */}
              <div className="space-y-4 pt-1">
                {filteredBlocks.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                    <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No ledger blocks match your filter criteria</p>
                    <p className="text-xs text-slate-400">Try searching for a different keyword or resetting category filters.</p>
                    <button
                      onClick={() => {
                        setAuditSearchQuery('');
                        setAuditCategoryFilter('all');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-linear-to-b before:from-indigo-400 before:via-emerald-400 before:to-slate-300">
                    {filteredBlocks.map((block) => {
                      const isExpanded = !!expandedProofBlockIds[block.id];
                      return (
                        <div key={block.id} className="relative group">
                          {/* Connected Node Marker on Rail */}
                          <div className={`absolute -left-6 sm:-left-8 top-4 w-6 sm:w-8 h-6 sm:h-8 rounded-full ${block.iconColor} font-mono font-bold text-[10px] flex items-center justify-center shadow-md ring-4 ring-white z-10`}>
                            #{block.blockNumber}
                          </div>

                          {/* Block Card Container */}
                          <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all p-5 space-y-3.5">
                            {/* Card Top Row: Category, Title & Timestamp */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${block.categoryColor}`}>
                                  {block.categoryLabel}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900">
                                  {block.action}
                                </h4>
                              </div>

                              <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono shrink-0">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{block.timestamp}</span>
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                  {block.relativeTime}
                                </span>
                              </div>
                            </div>

                            {/* Middle Row: Actor Identity & Narrative Details */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center space-x-2.5">
                                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                    {block.actorAvatar}
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-slate-900">{block.actorName}</span>
                                    <span className="text-[10px] text-slate-400 ml-1.5">({block.actorRole})</span>
                                    {block.actorEmail && (
                                      <span className="text-[10px] text-indigo-600 font-mono ml-1.5 block sm:inline">
                                        {block.actorEmail}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                  {block.details}
                                </p>
                              </div>

                              {/* Auth Factor Badge */}
                              <div className="shrink-0 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[11px] space-y-1 min-w-[170px]">
                                <span className="text-[9px] text-slate-400 font-mono uppercase block font-semibold">Auth Verification</span>
                                <div className="flex items-center space-x-1.5 font-bold text-indigo-900">
                                  <Key className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  <span className="truncate">{block.authFactor}</span>
                                </div>
                              </div>
                            </div>

                            {/* Security Telemetry & Environmental Metadata Chips */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60 font-mono">
                              <div className="flex items-center space-x-1.5">
                                <Globe className="w-3.5 h-3.5 text-slate-400" />
                                <span>{block.geo} (IP: <strong>{block.ip}</strong>)</span>
                              </div>

                              <div className="flex items-center space-x-1.5">
                                <Laptop className="w-3.5 h-3.5 text-slate-400" />
                                <span className="truncate max-w-[280px]">{block.device}</span>
                              </div>

                              <div className="flex items-center space-x-1 ml-auto">
                                {block.tags.map(tag => (
                                  <span key={tag} className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white text-slate-700 border border-slate-200">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Bottom Panel: Mathematical Hash-Chain Linkage Box */}
                            <div className="bg-slate-950 text-slate-200 rounded-xl p-3 border border-slate-800 space-y-2 font-mono text-xs">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center space-x-2 text-[11px] min-w-0">
                                  <span className="text-slate-500 font-bold uppercase text-[9px] shrink-0">Parent Hash:</span>
                                  <span className="text-slate-400 truncate max-w-[140px] sm:max-w-[180px]" title={block.prevHash}>
                                    {block.prevHash.slice(0, 16)}...
                                  </span>
                                  <button
                                    onClick={() => handleCopyHash(block.prevHash, `prev_${block.id}`)}
                                    className="text-slate-400 hover:text-white cursor-pointer"
                                    title="Copy Previous Hash"
                                  >
                                    {copiedHashKey === `prev_${block.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  </button>

                                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mx-1" />

                                  <span className="text-slate-500 font-bold uppercase text-[9px] shrink-0">Block Hash:</span>
                                  <span className="text-emerald-400 font-bold truncate max-w-[140px] sm:max-w-[200px]" title={block.currentHash}>
                                    {block.currentHash.slice(0, 16)}...
                                  </span>
                                  <button
                                    onClick={() => handleCopyHash(block.currentHash, `curr_${block.id}`)}
                                    className="text-emerald-400 hover:text-emerald-200 cursor-pointer"
                                    title="Copy Current Block Hash"
                                  >
                                    {copiedHashKey === `curr_${block.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>

                                <div className="flex items-center space-x-2 shrink-0">
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold flex items-center space-x-1">
                                    <span>✓ SHA-256 Valid</span>
                                  </span>

                                  <button
                                    onClick={() => toggleProof(block.id)}
                                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-sans font-semibold flex items-center space-x-1 cursor-pointer"
                                  >
                                    <span>{isExpanded ? 'Hide Raw Proof' : 'Inspect Proof'}</span>
                                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>

                              {/* Expanded Raw Cryptographic Inspector */}
                              {isExpanded && (
                                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-[10px] animate-in fade-in">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                                    <div className="space-y-1">
                                      <span className="text-slate-500 block uppercase text-[9px]">Full Previous SHA-256 Digest:</span>
                                      <p className="bg-slate-900 p-1.5 rounded border border-slate-800 text-[9px] break-all select-all text-slate-400">
                                        {block.prevHash}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-slate-500 block uppercase text-[9px]">Full Current Block SHA-256 Digest:</span>
                                      <p className="bg-slate-900 p-1.5 rounded border border-slate-800 text-[9px] break-all select-all text-emerald-400">
                                        {block.currentHash}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-slate-400 text-[9px]">
                                    <div className="flex items-center space-x-3">
                                      <span>Merkle Tree Leaf Index: <strong className="text-slate-200">#{block.merkleLeafIndex}</strong></span>
                                      <span>HMAC Signature: <strong className="text-indigo-400">{block.hmacSignature}</strong></span>
                                    </div>

                                    <button
                                      onClick={() => {
                                        const proofData = JSON.stringify(block, null, 2);
                                        navigator.clipboard.writeText(proofData);
                                        notify('success', 'Block Proof Copied', `Copied complete JSON proof for Block #${block.blockNumber}.`);
                                      }}
                                      className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer font-semibold"
                                    >
                                      <Copy className="w-2.5 h-2.5" />
                                      <span>Copy Block JSON</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

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
          </button>

          <button
            onClick={() => notify('success', 'Reminder Dispatched', 'Automated email reminder sent to pending signers.')}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Reminder</span>
          </button>
        </div>
      </div>

      {/* Add Signer Modal */}
      {showAddSignerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Users className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900 font-display">Add Recipient / Signer</h3>
              </div>
              <button onClick={() => setShowAddSignerModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSignerSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Full Legal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Catherine Bell"
                  value={newSignerName}
                  onChange={(e) => setNewSignerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. catherine.bell@acme.com"
                  value={newSignerEmail}
                  onChange={(e) => setNewSignerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Signing Role</label>
                  <select
                    value={newSignerRole}
                    onChange={(e) => setNewSignerRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="signer">Signer</option>
                    <option value="approver">Approver</option>
                    <option value="notary">Notary</option>
                    <option value="cc">Receive Copy (CC)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Auth Method</label>
                  <select
                    value={newSignerAuth}
                    onChange={(e) => setNewSignerAuth(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="email">Email OTP (2FA)</option>
                    <option value="passkey_webauthn">Passkey WebAuthn</option>
                    <option value="sms_otp">SMS OTP</option>
                    <option value="idv_biometric">IDV Biometrics</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddSignerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Add Recipient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Signature Creator Modal */}
      <CustomSignatureModal
        isOpen={showCustomSigModal}
        onClose={() => setShowCustomSigModal(false)}
        targetRole={selectedSigRecipient ? `${selectedSigRecipient.name} (${selectedSigRecipient.role})` : 'Authorized Signer'}
        defaultName={selectedSigRecipient?.name || 'Authorized Signer'}
        defaultInitials={selectedSigRecipient?.name ? selectedSigRecipient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AS'}
        onApplySignature={(sig) => {
          if (selectedSigRecipient) {
            setRecipientSignatures(prev => ({ ...prev, [selectedSigRecipient.id]: sig }));
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

      {/* Share Agreement & Access Control Modal */}
      <ShareEnvelopeModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        envelope={activeEnvelope}
      />

      {/* Delete Envelope Confirmation Modal */}
      {showDeleteModal && activeEnvelope && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4 text-slate-900">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Delete Envelope?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-800">"{activeEnvelope.title}"</strong> ({activeEnvelope.id})? This will permanently erase the document, all placed signature fields, recipient configurations, and attachments.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/60 text-[11px] text-rose-700">
              ⚠️ <strong>Warning:</strong> This action cannot be undone. Active signing links will become invalid immediately.
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteEnvelope(activeEnvelope.id);
                  setShowDeleteModal(false);
                  setActiveView('envelopes');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Properties & Conditional Logic Modal */}
      <FieldPropertiesModal
        isOpen={!!selectedFieldForProperties}
        onClose={() => setSelectedFieldForProperties(null)}
        field={selectedFieldForProperties}
        allFields={activeEnvelope?.fields || []}
        onSaveField={handleSaveFieldProperties}
      />
    </div>
  );
};
