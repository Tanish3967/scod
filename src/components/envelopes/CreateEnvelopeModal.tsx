import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  LayoutTemplate, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Fingerprint, 
  FileUp, 
  Layers, 
  Clock, 
  Users, 
  ArrowRight, 
  Search, 
  Tag, 
  ChevronRight, 
  ChevronLeft,
  Info, 
  Lock,
  FileCode,
  Check,
  Building2,
  Mail,
  Shield,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { Template, Recipient, DocumentPage, AuthType } from '../../types/signflow';
import { MOCK_TEMPLATES } from '../../data/mockTemplates';
import { generateUUID, generateFullSha256 } from '../../utils/cryptoUtils';
import { parseUploadedDocument } from '../../utils/documentParser';
import { executeMultiAgentDraft } from '../../utils/aiMultiAgentDrafter';

export interface CreateEnvelopeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadedFileInfo {
  file: File;
  name: string;
  sizeFormatted: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'png' | 'txt';
  sha256Hash: string;
  fileUrl?: string;
  rawData?: string;
  pages: DocumentPage[];
  extractedText?: string;
}

interface TemplateRecipientConfig {
  roleName: string;
  roleDescription: string;
  name: string;
  email: string;
  authType: AuthType;
}

const CATEGORY_TAGS = [
  'Commercial',
  'Sales Agreement',
  'Non-Disclosure (NDA)',
  'HR & Hiring',
  'Master Services (MSA)',
  'Procurement',
  'Vendor Contract',
  'Real Estate & Lease',
  'Intellectual Property',
  'Security & DPA'
];

export const CreateEnvelopeModal: React.FC<CreateEnvelopeModalProps> = ({ isOpen, onClose }) => {
  const { 
    createEnvelopeFromUpload, 
    createEnvelopeFromTemplate, 
    createNewEnvelope,
    notify 
  } = useSignFlow();

  // Tab State: 'upload' is default option as requested
  const [activeTab, setActiveTab] = useState<'upload' | 'templates' | 'blank'>('upload');
  
  // Upload Mode States
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);
  const [agreementTitle, setAgreementTitle] = useState('');
  const [agreementDescription, setAgreementDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Commercial', 'Custom Upload']);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Recipient Configuration for Uploaded Document
  const [recipients, setRecipients] = useState<{ name: string; email: string; role: string; authType: AuthType }[]>([
    { name: 'Marcus Vance', email: 'marcus.vance@counterparty.com', role: 'Signer', authType: 'email' },
    { name: 'Alice Morgan', email: 'alice.m@enterprise.org', role: 'Signer', authType: 'passkey_webauthn' }
  ]);

  // Template Browser States
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTemplateForConfig, setSelectedTemplateForConfig] = useState<Template | null>(null);
  const [templateAgreementTitle, setTemplateAgreementTitle] = useState('');
  const [templateAgreementDescription, setTemplateAgreementDescription] = useState('');
  const [templateRecipients, setTemplateRecipients] = useState<TemplateRecipientConfig[]>([]);
  const [templateValidationError, setTemplateValidationError] = useState<string | null>(null);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState('Enterprise Master Services Agreement with Delaware law, Net 30 invoicing, and 12-month trailing fee liability cap.');
  const [aiTargetPages, setAiTargetPages] = useState<number>(20);
  const [aiProgressMessage, setAiProgressMessage] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Helper to process uploaded file
  const processSelectedFile = async (file: File) => {
    setIsProcessingFile(true);
    setUploadError(null);

    try {
      const parsed = await parseUploadedDocument(file);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setAgreementTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1));
      
      setUploadedFile({
        file,
        name: parsed.name,
        sizeFormatted: parsed.sizeFormatted,
        fileType: parsed.fileType,
        sha256Hash: parsed.sha256Hash,
        fileUrl: parsed.fileUrl,
        rawData: parsed.rawData,
        pages: parsed.pages,
        extractedText: parsed.extractedText
      });

      notify('success', 'Document Processed', `File "${file.name}" loaded with ${parsed.pages.length} page(s) and SHA-256 hash.`);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process file');
      notify('error', 'Upload Error', 'Could not read uploaded document.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  // Tag toggle
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Recipient Handlers for Upload Mode
  const addRecipientRow = () => {
    setRecipients(prev => [
      ...prev,
      { name: `Signer ${prev.length + 1}`, email: `signer${prev.length + 1}@counterparty.com`, role: 'Signer', authType: 'email' }
    ]);
  };

  const removeRecipientRow = (index: number) => {
    if (recipients.length <= 1) return;
    setRecipients(prev => prev.filter((_, i) => i !== index));
  };

  const updateRecipient = (index: number, field: string, value: string) => {
    setRecipients(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  // Template Recipient Handlers
  const addTemplateRecipientRow = () => {
    setTemplateRecipients(prev => [
      ...prev,
      {
        roleName: `Additional Signer ${prev.length + 1}`,
        roleDescription: 'Additional executing signatory',
        name: '',
        email: '',
        authType: 'email'
      }
    ]);
  };

  const removeTemplateRecipientRow = (index: number) => {
    if (templateRecipients.length <= 1) return;
    setTemplateRecipients(prev => prev.filter((_, i) => i !== index));
  };

  const updateTemplateRecipient = (index: number, field: keyof TemplateRecipientConfig, value: string) => {
    setTemplateRecipients(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  // Submit Uploaded Custom File Envelope
  const handleCreateFromUpload = () => {
    if (!uploadedFile) {
      setUploadError('Please select or upload a document file first.');
      return;
    }

    const recipientList: Recipient[] = recipients.map((r, idx) => ({
      id: `rec-${generateUUID().slice(0, 6)}`,
      name: r.name.trim() || `Signer ${idx + 1}`,
      email: r.email.trim() || `signer${idx + 1}@example.com`,
      role: 'signer',
      routingOrder: idx + 1,
      authType: r.authType,
      status: idx === 0 ? 'ready' : 'waiting'
    }));

    createEnvelopeFromUpload({
      title: agreementTitle.trim() || uploadedFile.name,
      description: agreementDescription.trim() || 'Custom agreement document uploaded for signature routing',
      file: {
        name: uploadedFile.name,
        size: uploadedFile.sizeFormatted,
        fileType: uploadedFile.fileType,
        sha256Hash: uploadedFile.sha256Hash,
        fileUrl: uploadedFile.fileUrl,
        rawData: uploadedFile.rawData,
        pages: uploadedFile.pages
      },
      tags: selectedTags,
      recipients: recipientList
    });

    onClose();
  };

  // Filter templates
  const filteredTemplates = MOCK_TEMPLATES.filter(tmpl => {
    const isUnilateral = tmpl.roles.length === 1 || tmpl.agreementType === 'unilateral';
    const matchesCat = selectedCategory === 'All' 
      ? true 
      : selectedCategory === 'Unilateral' 
        ? isUnilateral 
        : tmpl.category === selectedCategory;

    const matchesSearch = !templateSearch.trim() || 
      tmpl.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // User clicks on a template -> open Signees Configuration view
  const handleSelectTemplate = (tmpl: Template) => {
    setSelectedTemplateForConfig(tmpl);
    setTemplateAgreementTitle(tmpl.name);
    setTemplateAgreementDescription(tmpl.description);
    setTemplateValidationError(null);

    // Initialize required roles from template
    const isUnilateral = tmpl.roles.length === 1 || tmpl.agreementType === 'unilateral';
    const initialRoles: TemplateRecipientConfig[] = tmpl.roles.map((r, idx) => ({
      roleName: r.roleName,
      roleDescription: r.description,
      name: isUnilateral ? 'Marcus Vance' : idx === 0 ? 'Sarah Jenkins' : '',
      email: isUnilateral ? 'marcus.vance@counterparty.com' : idx === 0 ? 'sarah.j@signflow.ai' : '',
      authType: r.defaultAuth || 'email'
    }));

    setTemplateRecipients(initialRoles);
  };

  // User submits configured template with explicit signee details
  const handleConfirmTemplateEnvelope = () => {
    if (!selectedTemplateForConfig) return;

    // Validate that all signees have a name and email
    const emptyNames = templateRecipients.some(r => !r.name.trim());
    const emptyEmails = templateRecipients.some(r => !r.email.trim());

    if (emptyNames || emptyEmails) {
      setTemplateValidationError('Please fill in the full name and email address for all required signers.');
      return;
    }

    const isUnilateral = selectedTemplateForConfig.agreementType === 'unilateral' || templateRecipients.length === 1;

    const formattedRecipients: Recipient[] = templateRecipients.map((r, idx) => ({
      id: `rec-${idx + 1}`,
      name: r.name.trim(),
      email: r.email.trim(),
      role: 'signer',
      routingOrder: idx + 1,
      authType: r.authType,
      status: idx === 0 ? 'ready' : 'waiting'
    }));

    createEnvelopeFromTemplate(selectedTemplateForConfig, {
      title: templateAgreementTitle.trim() || selectedTemplateForConfig.name,
      description: templateAgreementDescription.trim() || selectedTemplateForConfig.description,
      recipients: formattedRecipients,
      tags: [selectedTemplateForConfig.category, isUnilateral ? 'Unilateral' : 'Template-Based'],
      agreementType: isUnilateral ? 'unilateral' : formattedRecipients.length === 2 ? 'bilateral' : 'multilateral'
    });

    onClose();
  };

  // AI Multi-Agent Drafter Launch
  const handleAiDraftSubmit = async () => {
    setIsAiGenerating(true);
    setAiProgressMessage('Initializing Multi-Agent Swarm & Shared Knowledge Store...');
    
    try {
      const result = await executeMultiAgentDraft({
        prompt: aiPrompt,
        agreementType: 'MSA',
        targetPageCount: aiTargetPages,
        onProgress: (step) => {
          setAiProgressMessage(`${step.agentName}: ${step.message}`);
        }
      });

      createNewEnvelope({
        title: result.title,
        description: `Multi-Agent AI Draft (${result.totalPages} Pages): ${aiPrompt}`,
        tags: ['AI-Drafted', 'Multi-Agent', `${result.totalPages}-Pages`],
        documents: [
          {
            id: 'doc-' + generateUUID().slice(0, 6),
            name: `${result.title.replace(/[\s:]+/g, '_')}.pdf`,
            size: `${(result.totalPages * 0.18).toFixed(1)} MB`,
            fileType: 'pdf',
            sha256Hash: generateFullSha256(),
            pages: result.pages
          }
        ]
      });

      notify('success', 'AI Agreement Generated', `Drafted & verified ${result.totalPages}-page agreement ready in Document Studio.`);
      onClose();
    } catch (err) {
      console.error('Multi-agent draft error in modal:', err);
      notify('error', 'Drafting Failed', 'An error occurred during AI drafting.');
    } finally {
      setIsAiGenerating(false);
      setAiProgressMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display flex items-center space-x-2">
                <span>Create New Agreement Envelope</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Wizard
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Upload your custom agreement file or launch instantly from vetted templates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex items-center space-x-1"
            title="Close (Esc)"
          >
            <span className="text-[10px] font-mono text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">Esc</span>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Tab Navigator (Upload is Default) */}
        <div className="px-6 pt-3 border-b border-slate-100 bg-slate-50/50 flex space-x-2 shrink-0">
          <button
            onClick={() => {
              setActiveTab('upload');
              setSelectedTemplateForConfig(null);
            }}
            className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs transition-all flex items-center space-x-2 cursor-pointer border-b-2 ${
              activeTab === 'upload'
                ? 'bg-white text-indigo-700 border-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/60'
            }`}
          >
            <UploadCloud className={`w-4 h-4 ${activeTab === 'upload' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Upload Custom Document</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">Default</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs transition-all flex items-center space-x-2 cursor-pointer border-b-2 ${
              activeTab === 'templates'
                ? 'bg-white text-indigo-700 border-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/60'
            }`}
          >
            <LayoutTemplate className={`w-4 h-4 ${activeTab === 'templates' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Stored Drafts & Templates</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">{MOCK_TEMPLATES.length}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('blank');
              setSelectedTemplateForConfig(null);
            }}
            className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs transition-all flex items-center space-x-2 cursor-pointer border-b-2 ${
              activeTab === 'blank'
                ? 'bg-white text-indigo-700 border-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/60'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === 'blank' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Blank Slate / AI Drafter</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ============================================================ */}
          {/* TAB 1: UPLOAD CUSTOM DOCUMENT (DEFAULT) */}
          {/* ============================================================ */}
          {activeTab === 'upload' && (
            <div className="space-y-6 animate-fade-in">
              {/* Drag and Drop Zone */}
              {!uploadedFile ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                    dragOver
                      ? 'border-indigo-500 bg-indigo-50/70 scale-[1.01]'
                      : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/70 bg-white'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.doc,.txt,.md,.png,.jpg"
                    onChange={handleFileInputChange}
                  />

                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                    {isProcessingFile ? (
                      <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <UploadCloud className="w-8 h-8" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {isProcessingFile ? 'Parsing & Hashing Document...' : 'Drag & drop your agreement file here'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      or <span className="text-indigo-600 font-semibold underline">browse from your computer</span>
                    </p>
                  </div>

                  {/* Format Badges */}
                  <div className="flex items-center space-x-2 pt-2">
                    {['PDF Document', 'Word (DOCX)', 'Markdown / TXT', 'Images (PNG/JPG)'].map((fmt) => (
                      <span key={fmt} className="text-[10.5px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                        {fmt}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Automatic SHA-256 integrity hash calculation & multi-page canvas rendering</span>
                  </div>
                </div>
              ) : (
                /* Uploaded File Summary Card */
                <div className="bg-slate-50/90 border border-indigo-100 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900">{uploadedFile.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {uploadedFile.sizeFormatted}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase">
                            {uploadedFile.fileType}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {uploadedFile.sha256Hash.slice(0, 24)}...
                          </span>
                          <span className="text-[11px] text-slate-500">
                            • {uploadedFile.pages.length} Page(s) Ingested
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setUploadedFile(null)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Replace File</span>
                    </button>
                  </div>

                  {/* Document Excerpt Preview */}
                  {uploadedFile.pages.length > 0 && (
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-slate-100">
                        <span className="font-semibold text-slate-700 flex items-center space-x-1">
                          <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Extracted Content Preview ({uploadedFile.pages.length} Page{uploadedFile.pages.length > 1 ? 's' : ''})</span>
                        </span>
                        <span className="font-mono text-[10px] text-emerald-600 font-bold">✓ Ready for Signing</span>
                      </div>
                      
                      {uploadedFile.pages[0]?.imageUrl ? (
                        <div className="h-28 overflow-hidden rounded-lg border border-slate-200 flex items-center justify-center bg-slate-900/5">
                          <img src={uploadedFile.pages[0].imageUrl} alt="Document Preview" className="max-h-28 object-contain" />
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-600 font-sans line-clamp-3 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                          {uploadedFile.pages[0]?.content?.replace(/### |#### /g, '') || 'Document loaded and ready for signature block placement.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Agreement Metadata Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Envelope / Agreement Title *
                  </label>
                  <input
                    type="text"
                    value={agreementTitle}
                    onChange={(e) => setAgreementTitle(e.target.value)}
                    placeholder="e.g. Master Services Agreement 2026"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Internal Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={agreementDescription}
                    onChange={(e) => setAgreementDescription(e.target.value)}
                    placeholder="e.g. Strategic enterprise software agreement for signature routing"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Category Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Category Tags</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_TAGS.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recipients & Signers Configuration */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>Signing Order & Recipient Routing</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Configure execution structure: Unilateral (1 Signatory) or Multi-Party (2+ Signatories)
                    </p>
                  </div>

                  {/* Execution Structure Presets */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRecipients([
                          { name: 'Marcus Vance', email: 'marcus.vance@counterparty.com', role: 'Signer', authType: 'email' }
                        ]);
                        if (!selectedTags.includes('Unilateral')) {
                          setSelectedTags(prev => ['Unilateral', ...prev.filter(t => t !== 'Custom Upload')]);
                        }
                      }}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer border ${
                        recipients.length === 1
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Single Signer (Unilateral)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (recipients.length === 1) {
                          setRecipients([
                            recipients[0],
                            { name: 'Alice Morgan', email: 'alice.m@enterprise.org', role: 'Signer', authType: 'passkey_webauthn' }
                          ]);
                          setSelectedTags(prev => prev.filter(t => t !== 'Unilateral'));
                        }
                      }}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer border ${
                        recipients.length > 1
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Multi-Signer (Bilateral)
                    </button>
                    <button
                      type="button"
                      onClick={addRecipientRow}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1 border border-slate-200"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Unilateral vs Multi-Party Informative Callout */}
                {recipients.length === 1 ? (
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-start space-x-2 text-xs text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-[11.5px] leading-relaxed">
                      <span className="font-bold">Unilateral Execution Active:</span>
                      <p className="text-emerald-700 text-[11px]">
                        This document is configured for a single signatory (e.g. employee undertaking, waiver, one-way NDA). Signature by this sole signee will immediately seal the document and append the cryptographic Certificate of Completion.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-indigo-50/80 border border-indigo-200/80 rounded-xl flex items-start space-x-2 text-xs text-indigo-800">
                    <Users className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-[11.5px] leading-relaxed">
                      <span className="font-bold">Sequential Multi-Party Execution ({recipients.length} Signatories):</span>
                      <p className="text-indigo-700 text-[11px]">
                        Party 1 signs first, which will automatically dispatch tokenized magic links and notifications to subsequent counterparties in order.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {recipients.map((rec, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-wrap sm:flex-nowrap items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-[140px]">
                        <input
                          type="text"
                          value={rec.name}
                          onChange={(e) => updateRecipient(idx, 'name', e.target.value)}
                          placeholder="Signer Full Name"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex-1 min-w-[170px]">
                        <input
                          type="email"
                          value={rec.email}
                          onChange={(e) => updateRecipient(idx, 'email', e.target.value)}
                          placeholder="signer@company.com"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="w-36 shrink-0">
                        <select
                          value={rec.authType}
                          onChange={(e) => updateRecipient(idx, 'authType', e.target.value as AuthType)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                        >
                          <option value="email">Email OTP</option>
                          <option value="passkey_webauthn">WebAuthn Passkey (AAL3)</option>
                          <option value="sms_otp">SMS 2FA</option>
                          <option value="idv_biometric">Government IDV</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeRecipientRow(idx)}
                        disabled={recipients.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors cursor-pointer"
                        title="Remove Signer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: STORED DRAFTS & TEMPLATES */}
          {/* ============================================================ */}
          {activeTab === 'templates' && (
            <div className="space-y-5 animate-fade-in">
              {/* If a template is chosen, show the Signees Details configuration view */}
              {selectedTemplateForConfig ? (
                <div className="space-y-5 animate-fade-in">
                  {/* Top breadcrumb to return to template catalog */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateForConfig(null)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back to Template Library</span>
                    </button>

                    <span className="text-xs text-slate-400">Step 2: Signer Routing Setup</span>
                  </div>

                  {/* Selected Template Summary Card */}
                  <div className="p-4 bg-gradient-to-r from-indigo-50/90 to-slate-50 border border-indigo-200/80 rounded-2xl flex items-start justify-between">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                        <LayoutTemplate className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-slate-900 font-display">
                            {selectedTemplateForConfig.name}
                          </h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                            {selectedTemplateForConfig.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                          {selectedTemplateForConfig.description}
                        </p>
                        <div className="flex items-center space-x-3 pt-1 text-[11px] text-slate-500 font-medium">
                          <span>{selectedTemplateForConfig.roles.length} Required Signatory Roles</span>
                          <span>•</span>
                          <span>{selectedTemplateForConfig.defaultFieldsCount} Standard Fields</span>
                          <span>•</span>
                          <span className="font-mono">{selectedTemplateForConfig.sampleDocument.size}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTemplateForConfig(null)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                    >
                      Change Template
                    </button>
                  </div>

                  {/* Validation Error Banner */}
                  {templateValidationError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>{templateValidationError}</span>
                    </div>
                  )}

                  {/* Agreement Title & Memo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Envelope / Agreement Title *
                      </label>
                      <input
                        type="text"
                        value={templateAgreementTitle}
                        onChange={(e) => {
                          setTemplateAgreementTitle(e.target.value);
                          setTemplateValidationError(null);
                        }}
                        placeholder="e.g. Mutual Non-Disclosure Agreement (MNDA)"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Internal Description / Memo
                      </label>
                      <input
                        type="text"
                        value={templateAgreementDescription}
                        onChange={(e) => setTemplateAgreementDescription(e.target.value)}
                        placeholder="e.g. Standard bilateral confidentiality agreement"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Required Signees & Recipients Form */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                          <UserCheck className="w-4 h-4 text-indigo-600" />
                          <span>Configure Signees & Recipients for this Template</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Please enter the actual names and emails for each required signatory role.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={addTemplateRecipientRow}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Signer</span>
                      </button>
                    </div>

                    {templateRecipients.length === 1 && (
                      <div className="p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-start space-x-2 text-xs text-emerald-800">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 text-[11.5px] leading-relaxed">
                          <span className="font-bold">Unilateral Execution Mode:</span>
                          <p className="text-emerald-700 text-[11px]">
                            This template is a unilateral agreement. Signature by this single designated signee will immediately seal the document and append the Certificate of Completion.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {templateRecipients.map((rec, idx) => (
                        <div 
                          key={idx} 
                          className="p-3.5 bg-slate-50/90 border border-slate-200 rounded-xl space-y-2.5 transition-all hover:border-slate-300"
                        >
                          {/* Role Tag Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                {rec.roleName}
                              </span>
                              {rec.roleDescription && (
                                <span className="text-[11px] text-slate-500 hidden sm:inline">
                                  — {rec.roleDescription}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeTemplateRecipientRow(idx)}
                              disabled={templateRecipients.length <= 1}
                              className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-20 transition-colors cursor-pointer"
                              title="Remove Signer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Signee Inputs Row */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                                Signer Full Name *
                              </label>
                              <input
                                type="text"
                                value={rec.name}
                                onChange={(e) => {
                                  updateTemplateRecipient(idx, 'name', e.target.value);
                                  setTemplateValidationError(null);
                                }}
                                placeholder="e.g. Johnathan Vance"
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                                Email Address *
                              </label>
                              <input
                                type="email"
                                value={rec.email}
                                onChange={(e) => {
                                  updateTemplateRecipient(idx, 'email', e.target.value);
                                  setTemplateValidationError(null);
                                }}
                                placeholder="signer@counterparty.com"
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                                Authentication Factor
                              </label>
                              <select
                                value={rec.authType}
                                onChange={(e) => updateTemplateRecipient(idx, 'authType', e.target.value as AuthType)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                              >
                                <option value="email">Email OTP</option>
                                <option value="passkey_webauthn">WebAuthn Passkey (AAL3)</option>
                                <option value="sms_otp">SMS 2FA</option>
                                <option value="idv_biometric">Government IDV</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Template Cards Catalog View */
                <div className="space-y-5">
                  {/* Search & Category Filter Header */}
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        placeholder="Search master templates (e.g. NDA, MSA, Lease, Offer Letter)..."
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
                      {['All', 'Unilateral', 'Legal & Corporate', 'Sales', 'HR & Hiring', 'Procurement'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                            selectedCategory === cat
                              ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat === 'Unilateral' ? 'Unilateral (1 Signer)' : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Template Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTemplates.map((tmpl) => {
                      const isUni = tmpl.roles.length === 1 || tmpl.agreementType === 'unilateral';
                      return (
                        <div
                          key={tmpl.id}
                          className="p-5 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md rounded-2xl transition-all flex flex-col justify-between space-y-4 group"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                  {tmpl.category}
                                </span>
                                {isUni && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    <span>Unilateral (1 Signer)</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 flex items-center space-x-1 shrink-0">
                                <Clock className="w-3 h-3" />
                                <span>Used {tmpl.lastUsed}</span>
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {tmpl.name}
                            </h4>

                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {tmpl.description}
                            </p>

                            <div className="flex items-center space-x-3 pt-1 text-[11px] text-slate-600">
                              <span className="flex items-center space-x-1 font-medium">
                                <Users className="w-3.5 h-3.5 text-indigo-500" />
                                <span>{tmpl.roles.length} {tmpl.roles.length === 1 ? 'Signatory' : 'Signatories'}</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{tmpl.defaultFieldsCount} Fields</span>
                              </span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400 font-mono">
                              {tmpl.sampleDocument.size}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleSelectTemplate(tmpl)}
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-transform hover:scale-105 flex items-center space-x-1.5 cursor-pointer"
                            >
                              <span>Configure & Use</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: BLANK SLATE / AI DRAFTER */}
          {/* ============================================================ */}
          {activeTab === 'blank' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>AI Autonomous Legal Drafter</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">
                    Synthesize Custom Legal Agreement from Prompt
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Describe your required commercial agreement, counterparty obligations, and liability boundaries.
                  </p>
                </div>

                <div>
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Master Services Agreement with Net 30 invoicing, SLA remedies, Delaware law, and 12-month liability cap..."
                    className="w-full p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
                  />
                </div>

                {/* Page Length Target Slider */}
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Target Page Length (Multi-Agent Swarm):</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-bold font-mono">
                      {aiTargetPages} Pages
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={aiTargetPages}
                    onChange={(e) => setAiTargetPages(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>5 Pages</span>
                    <span>10 Pages</span>
                    <span>20 Pages</span>
                    <span>30 Pages</span>
                    <span>50+ Pages</span>
                  </div>
                </div>

                {isAiGenerating && aiProgressMessage && (
                  <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-xs font-mono text-indigo-300 flex items-center space-x-2">
                    <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span className="truncate">{aiProgressMessage}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Includes standard US ESIGN & EU eIDAS Qualified clauses</span>
                  </div>

                  <button
                    onClick={handleAiDraftSubmit}
                    disabled={isAiGenerating || !aiPrompt.trim()}
                    className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    {isAiGenerating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Swarm Drafting ({aiTargetPages}p)...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Launch Swarm ({aiTargetPages} Pages)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Blank Document Quick Option */}
              <div className="p-5 border border-slate-200 rounded-2xl flex items-center justify-between bg-slate-50">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Start with Blank Document Canvas</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Open a blank 680px contract canvas and drag-and-drop signatures, dates, and form controls manually.
                  </p>
                </div>

                <button
                  onClick={() => {
                    createNewEnvelope({ title: 'Untitled Agreement Draft' });
                    onClose();
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Start Blank Draft
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Sticky Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Encrypted with SHA-256 Merkle Chain Integrity</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {activeTab === 'upload' && (
              <button
                type="button"
                onClick={handleCreateFromUpload}
                disabled={!uploadedFile}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:scale-[1.02] flex items-center space-x-2 cursor-pointer"
              >
                <span>Create & Open in Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {activeTab === 'templates' && selectedTemplateForConfig && (
              <button
                type="button"
                onClick={handleConfirmTemplateEnvelope}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:scale-[1.02] flex items-center space-x-2 cursor-pointer"
              >
                <span>Create & Open in Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
