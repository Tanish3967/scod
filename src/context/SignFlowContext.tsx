import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { 
  Envelope, 
  EnvelopeStatus, 
  DocumentField, 
  Recipient, 
  NotarySession, 
  NotaryJournalEntry, 
  WebhookEndpoint, 
  WebhookLog, 
  AuditEvent,
  Template,
  DocumentPage,
  NegotiationAmendment
} from '../types/signflow';
import { extractStructuredTerms, generateAutopilotObligations, buildSlackWebhookPayload } from '../utils/contractAutopilot';
import { INITIAL_ENVELOPES } from '../data/mockEnvelopes';
import { generateUUID, generateFullSha256, getMockIpAddress, getMockDeviceFingerprint, generateHmacSignature, formatTimestamp } from '../utils/cryptoUtils';
import { detectSmartFields, analyzeDocumentRisk } from '../utils/aiEngine';
import { 
  initLocalDatabase, 
  saveAllEnvelopesToDB, 
  saveEnvelopeToDB, 
  deleteEnvelopeFromDB, 
  recordAuditEventToDB, 
  getDatabaseStats, 
  exportDatabaseJSON, 
  importDatabaseJSON, 
  resetDatabaseToDefaults, 
  DBStats 
} from '../utils/localDatabase';

export type AppView = 
  | 'dashboard'
  | 'envelopes'
  | 'prepare'
  | 'signing'
  | 'ai-hub'
  | 'clm-workbench'
  | 'obligations'
  | 'workflows'
  | 'co-browsing'
  | 'crm-sync'
  | 'offline-queue'
  | 'migration'
  | 'notary'
  | 'qes-tsp'
  | 'templates'
  | 'powerforms'
  | 'analytics'
  | 'certificate'
  | 'emails'
  | 'admin'
  | 'compliance'
  | 'local-db'
  | 'verifier';

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'ai';
  title: string;
  message: string;
  timestamp: string;
  createdAt: number;
  isRead: boolean;
  category?: 'agreements' | 'ai-risk' | 'compliance' | 'security' | 'system';
  targetView?: AppView;
  targetEnvelopeId?: string;
}

export interface ActiveToast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'ai';
  title: string;
  message: string;
  createdAt: number;
  durationMs: number; // 60000ms = 1 min
}

export interface TenantSettings {
  id: string;
  name: string;
  organization: string;
  primaryColor: string;
  logoText: string;
  customDomain: string;
  dataResidency: 'US' | 'EU' | 'APAC';
  is21CFR11Enabled: boolean;
  isQESEnabled: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: 'sender' | 'signer' | 'admin' | 'notary' | 'auditor';
  avatarUrl?: string;
  tier?: string;
}

interface SignFlowContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (credentials: { 
    email: string; 
    password?: string; 
    name?: string; 
    organization?: string; 
    role?: 'sender' | 'signer' | 'admin' | 'notary' | 'auditor';
  }) => void;
  logout: () => void;
  verifySignerAccess: (envelopeId: string, recipientId?: string, email?: string) => boolean;

  envelopes: Envelope[];
  activeEnvelope: Envelope | null;
  activeEnvelopeId: string | null;
  activeView: AppView;
  currentRole: 'sender' | 'signer' | 'admin' | 'notary' | 'auditor';
  environment: 'production' | 'sandbox';
  tenant: TenantSettings;
  notifications: ToastNotification[];
  activeToasts: ActiveToast[];
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
  webhooks: WebhookEndpoint[];
  webhookLogs: WebhookLog[];
  notarySessions: NotarySession[];
  notaryJournal: NotaryJournalEntry[];
  selectedCertificateEnvelopeId: string | null;
  isCertificateModalOpen: boolean;
  closeCertificateView: () => void;
  
  // Local Database Persistence
  isDbReady: boolean;
  dbStats: DBStats | null;
  refreshDbStats: () => Promise<void>;
  exportDbBackup: () => Promise<string>;
  importDbBackup: (json: string) => Promise<boolean>;
  resetDb: () => Promise<void>;
  
  // Actions
  setActiveView: (view: AppView) => void;
  setActiveEnvelopeId: (id: string | null) => void;
  setCurrentRole: (role: 'sender' | 'signer' | 'admin' | 'notary' | 'auditor') => void;
  setEnvironment: (env: 'production' | 'sandbox') => void;
  updateTenantSettings: (settings: Partial<TenantSettings>) => void;
  
  // Creation Wizard Modal
  isCreateEnvelopeModalOpen: boolean;
  setIsCreateEnvelopeModalOpen: (open: boolean) => void;
  openCreateEnvelopeModal: () => void;
  closeCreateEnvelopeModal: () => void;

  // Envelope actions
  createNewEnvelope: (draftData?: Partial<Envelope>) => Envelope;
  prepareNewEnvelope: () => void;
  createEnvelopeFromUpload: (params: { 
    title: string; 
    description?: string; 
    file: { 
      name: string; 
      size: string; 
      fileType: 'pdf' | 'docx' | 'xlsx' | 'png' | 'txt'; 
      sha256Hash: string; 
      fileUrl?: string;
      rawData?: string;
      pages: DocumentPage[]; 
    }; 
    tags: string[]; 
    recipients: Recipient[]; 
    agreementType?: 'unilateral' | 'bilateral' | 'multilateral';
  }) => Envelope;
  createEnvelopeFromTemplate: (
    template: Template, 
    customData?: {
      title?: string;
      description?: string;
      recipients?: Recipient[];
      tags?: string[];
      agreementType?: 'unilateral' | 'bilateral' | 'multilateral';
    }
  ) => Envelope;
  updateEnvelope: (id: string, updates: Partial<Envelope>) => void;
  deleteEnvelope: (id: string) => void;
  sendEnvelope: (id: string) => void;
  voidEnvelope: (id: string, reason: string) => void;
  
  // Field actions
  addFieldToEnvelope: (envelopeId: string, field: Omit<DocumentField, 'id'>) => void;
  updateFieldInEnvelope: (envelopeId: string, fieldId: string, updates: Partial<DocumentField>) => void;
  removeFieldFromEnvelope: (envelopeId: string, fieldId: string) => void;
  runAISmartFieldPlacement: (envelopeId: string) => number;
  
  // Signing actions
  activeSigningRecipientId: string | null;
  setActiveSigningRecipientId: (id: string | null) => void;
  submitSignerSignature: (envelopeId: string, recipientId: string, signatureData: Recipient['signatureData'], fieldValues: Record<string, string>) => void;
  openSigningSession: (envelopeId: string, recipientId?: string) => void;
  sendEnvelopeReminder: (envelopeId: string, recipientId?: string, customEmail?: string) => Promise<{ success: boolean; message: string; emailId?: string }>;
  openCertificateView: (envelopeId: string) => void;
  unlockEnvelopeForRevision: (envelopeId: string, reason?: string) => void;
  recordTamperingAttempt: (envelopeId: string, modificationDetails: string) => void;
  resendEnvelopeForSigning: (envelopeId: string) => void;
  
  // AI actions
  runAIRiskScan: (envelopeId: string) => void;
  
  // In-Ceremony Negotiation actions (Pillar 1)
  proposeClauseAmendment: (
    envelopeId: string, 
    amendment: Omit<NegotiationAmendment, 'id' | 'createdAt' | 'status'>
  ) => void;
  resolveClauseAmendment: (
    envelopeId: string, 
    amendmentId: string, 
    decision: 'approved' | 'rejected', 
    counterText?: string
  ) => void;

  // Post-Signature Autopilot actions (Pillar 3)
  executeContractAutopilot: (envelopeId: string) => Promise<void>;
  
  // Notary actions
  startNotarySession: (sessionId: string) => void;
  affixNotarySeal: (sessionId: string, sealDetails: NotarySession['sealDetails']) => void;
  
  // Webhook actions
  createWebhook: (url: string, name: string, events: string[]) => void;
  triggerMockWebhook: (event: string, envelope: Envelope) => void;
  
  // Notification actions
  notify: (
    type: ToastNotification['type'], 
    title: string, 
    message: string, 
    category?: ToastNotification['category'],
    targetView?: AppView,
    targetEnvelopeId?: string
  ) => void;
  dismissToast: (id: string) => void;
  dismissNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
}

const SignFlowContext = createContext<SignFlowContextType | undefined>(undefined);

const getInitialUrlRouteState = () => {
  if (typeof window === 'undefined') {
    return {
      activeView: 'dashboard' as AppView,
      activeEnvelopeId: 'env-msa-8921',
      activeSigningRecipientId: null as string | null,
      isCertificateModalOpen: false,
      selectedCertificateEnvelopeId: null as string | null,
    };
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const signId = params.get('sign');
    const previewId = params.get('preview') || params.get('envelope') || params.get('doc');
    const powerformId = params.get('powerform') || params.get('intake');
    const signerId = params.get('signer');
    const viewParam = params.get('view') as AppView | null;
    const certId = params.get('cert') || params.get('certificate');

    if (powerformId) {
      return {
        activeView: 'powerforms' as AppView,
        activeEnvelopeId: powerformId,
        activeSigningRecipientId: null,
        isCertificateModalOpen: false,
        selectedCertificateEnvelopeId: null,
      };
    }

    if (signId) {
      return {
        activeView: 'signing' as AppView,
        activeEnvelopeId: signId,
        activeSigningRecipientId: signerId || null,
        isCertificateModalOpen: false,
        selectedCertificateEnvelopeId: null,
      };
    }

    if (previewId) {
      return {
        activeView: (viewParam || 'prepare') as AppView,
        activeEnvelopeId: previewId,
        activeSigningRecipientId: signerId || null,
        isCertificateModalOpen: false,
        selectedCertificateEnvelopeId: null,
      };
    }

    if (certId) {
      return {
        activeView: (viewParam || 'envelopes') as AppView,
        activeEnvelopeId: certId,
        activeSigningRecipientId: null,
        isCertificateModalOpen: true,
        selectedCertificateEnvelopeId: certId,
      };
    }

    if (viewParam) {
      return {
        activeView: viewParam,
        activeEnvelopeId: 'env-msa-8921',
        activeSigningRecipientId: null,
        isCertificateModalOpen: false,
        selectedCertificateEnvelopeId: null,
      };
    }
  } catch (err) {
    console.warn('Failed to parse initial URL:', err);
  }

  return {
    activeView: 'dashboard' as AppView,
    activeEnvelopeId: 'env-msa-8921',
    activeSigningRecipientId: null,
    isCertificateModalOpen: false,
    selectedCertificateEnvelopeId: null,
  };
};

export const SignFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialUrlState = useMemo(() => getInitialUrlRouteState(), []);
  const isFirstSyncRef = useRef(true);

  const [envelopes, setEnvelopes] = useState<Envelope[]>(() => {
    // If an envelope is targeted in URL, ensure it is available in initial state
    const targetId = initialUrlState.activeEnvelopeId;
    if (targetId && !INITIAL_ENVELOPES.some(e => e.id === targetId)) {
      const match = INITIAL_ENVELOPES.find(e => e.id === targetId);
      if (match) return [match, ...INITIAL_ENVELOPES];
    }
    return INITIAL_ENVELOPES;
  });
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('signflow_user_session');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('signflow_user_session');
      return !!saved;
    } catch (_) {
      return false;
    }
  });

  const [activeEnvelopeId, setActiveEnvelopeId] = useState<string | null>(initialUrlState.activeEnvelopeId);
  const [activeView, setActiveView] = useState<AppView>(initialUrlState.activeView);
  const [currentRole, setCurrentRole] = useState<'sender' | 'signer' | 'admin' | 'notary' | 'auditor'>(
    currentUser?.role || 'sender'
  );
  const [environment, setEnvironment] = useState<'production' | 'sandbox'>('production');
  const [selectedCertificateEnvelopeId, setSelectedCertificateEnvelopeId] = useState<string | null>(initialUrlState.selectedCertificateEnvelopeId);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(initialUrlState.isCertificateModalOpen);
  const [previousViewBeforeCertificate, setPreviousViewBeforeCertificate] = useState<AppView>('prepare');
  const [activeSigningRecipientId, setActiveSigningRecipientId] = useState<string | null>(initialUrlState.activeSigningRecipientId);

  const [tenant, setTenant] = useState<TenantSettings>({
    id: 'tenant-acme-global',
    name: 'SignFlow Enterprise',
    organization: 'Acme Global Holdings Inc.',
    primaryColor: '#6366f1',
    logoText: 'SignFlow',
    customDomain: 'sign.acmeglobal.com',
    dataResidency: 'US',
    is21CFR11Enabled: true,
    isQESEnabled: true
  });

  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [activeToasts, setActiveToasts] = useState<ActiveToast[]>([]);

  const [notifications, setNotifications] = useState<ToastNotification[]>([
    {
      id: 'notif-1',
      type: 'ai',
      title: 'High Risk Clause Detected',
      message: 'Indemnification clause is one-sided. ENV-8921 · NDA – Acme & Globex',
      timestamp: '2h ago',
      createdAt: Date.now() - 7200000,
      isRead: false,
      category: 'ai-risk',
      targetView: 'ai-hub'
    },
    {
      id: 'notif-2',
      type: 'warning',
      title: 'Missing Compliance Field',
      message: 'Data Processing Agreement is missing. ENV-8919 · Sales Contract – Q2 Deal',
      timestamp: '5h ago',
      createdAt: Date.now() - 18000000,
      isRead: false,
      category: 'compliance',
      targetView: 'prepare',
      targetEnvelopeId: 'env-qes-9941'
    },
    {
      id: 'notif-3',
      type: 'warning',
      title: 'Agreement Expiring Soon',
      message: 'This agreement expires in 5 days. ENV-8903 · Service Agreement',
      timestamp: '1d ago',
      createdAt: Date.now() - 86400000,
      isRead: false,
      category: 'agreements',
      targetView: 'envelopes'
    },
    {
      id: 'notif-4',
      type: 'success',
      title: 'John Smith Signed Document',
      message: 'John Smith (john.smith@acme.com) completed signature on NDA – Acme & Globex Corp.',
      timestamp: 'May 20, 11:08 AM',
      createdAt: Date.now() - 25000000,
      isRead: false,
      category: 'agreements',
      targetView: 'prepare'
    },
    {
      id: 'notif-5',
      type: 'info',
      title: 'Envelope Sent to John Smith',
      message: 'Automated email dispatch delivered with 2FA SMS security challenge.',
      timestamp: 'May 20, 10:45 AM',
      createdAt: Date.now() - 27000000,
      isRead: false,
      category: 'agreements',
      targetView: 'envelopes'
    },
    {
      id: 'notif-6',
      type: 'ai',
      title: 'AI Smart Detection Ready',
      message: 'Detected 4 required signature blanks on Master Services Agreement #104 (98.2% confidence).',
      timestamp: 'May 20, 10:42 AM',
      createdAt: Date.now() - 28000000,
      isRead: false,
      category: 'ai-risk',
      targetView: 'prepare'
    },
    {
      id: 'notif-7',
      type: 'success',
      title: 'Template "NDA Standard" Used',
      message: 'Predefined workflow WF-30091 loaded with 2 signers and conditional review rule.',
      timestamp: 'May 20, 10:42 AM',
      createdAt: Date.now() - 28500000,
      isRead: false,
      category: 'agreements',
      targetView: 'templates'
    },
    {
      id: 'notif-8',
      type: 'info',
      title: 'Audit Anchor Confirmed',
      message: 'SHA-256 hash-chain synced with immutable compliance ledger (Block #49821).',
      timestamp: 'May 19, 04:15 PM',
      createdAt: Date.now() - 95000000,
      isRead: false,
      category: 'compliance',
      targetView: 'compliance'
    },
    {
      id: 'notif-9',
      type: 'success',
      title: 'MSA – Service Agreement Sealed',
      message: 'All parties have signed. Tamper-evident PDF certificate generated.',
      timestamp: 'May 19, 04:15 PM',
      createdAt: Date.now() - 95500000,
      isRead: false,
      category: 'agreements',
      targetView: 'certificate',
      targetEnvelopeId: 'env-ron-7109'
    },
    {
      id: 'notif-10',
      type: 'info',
      title: 'Salesforce CRM Synced',
      message: 'Account Opportunity "Acme Q2 Deal" auto-updated to "Closed-Won".',
      timestamp: 'May 18, 02:00 PM',
      createdAt: Date.now() - 170000000,
      isRead: false,
      category: 'system',
      targetView: 'crm-sync'
    },
    {
      id: 'notif-11',
      type: 'success',
      title: 'Remote Notary Session Scheduled',
      message: 'RON Session #RON-8891 scheduled for May 21, 2024 at 10:00 AM PST.',
      timestamp: 'May 18, 09:30 AM',
      createdAt: Date.now() - 190000000,
      isRead: false,
      category: 'agreements',
      targetView: 'notary'
    },
    {
      id: 'notif-12',
      type: 'ai',
      title: 'AI Playbook Review Completed',
      message: 'Scan complete: Liability capped at $1.2M. No critical redline flags remaining.',
      timestamp: 'May 17, 05:20 PM',
      createdAt: Date.now() - 250000000,
      isRead: false,
      category: 'ai-risk',
      targetView: 'ai-hub'
    }
  ]);

  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([
    {
      id: 'wh-01',
      url: 'https://api.acmeglobal.com/webhooks/signflow-events',
      name: 'Acme ERP & Salesforce Sync',
      events: ['envelope.sent', 'envelope.signed', 'envelope.completed', 'envelope.voided'],
      secretKey: 'whsec_9841f7a29bc1e89402ab81',
      isActive: true,
      createdAt: '2026-08-01T00:00:00Z',
      lastTriggered: '10 mins ago',
      lastStatus: 200
    },
    {
      id: 'wh-02',
      url: 'https://hooks.slack.com/services/T00/B00/X00',
      name: 'Slack #contract-alerts Notification',
      events: ['envelope.completed', 'ai.risk_flag_raised'],
      secretKey: 'whsec_slack_alert_key_4492',
      isActive: true,
      createdAt: '2026-08-10T00:00:00Z',
      lastTriggered: '1 hour ago',
      lastStatus: 200
    }
  ]);

  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);

  const [notarySessions, setNotarySessions] = useState<NotarySession[]>([
    {
      id: 'notary-sess-9921',
      envelopeId: 'env-ron-7109',
      notaryName: 'Catherine Bell',
      commissionNumber: 'TX-298192',
      jurisdiction: 'State of Texas / Travis County',
      status: 'waiting',
      scheduledTime: '2026-08-27T14:30:00Z',
      signerConnected: true,
      notaryConnected: true,
      sealDetails: {
        notaryPublicName: 'Catherine Bell',
        county: 'Travis',
        state: 'Texas',
        commissionExpires: '2028-11-15'
      },
      journalEntryId: 'jrnl-texas-004'
    }
  ]);

  const [notaryJournal, setNotaryJournal] = useState<NotaryJournalEntry[]>([
    {
      id: 'jrnl-texas-001',
      timestamp: '2026-08-20T11:22:00Z',
      documentTitle: 'Warranty Deed & Conveyance (Austin Property)',
      signerName: 'Alexander Hayes',
      signerEmail: 'a.hayes@austindevelop.com',
      idvMethod: 'Government Passport + Facial Liveness (99.8%)',
      idvProofCode: 'IDV-US-PASS-9941-VERIFIED',
      notarialAct: 'Acknowledgment',
      fee: '$25.00',
      recordingArchiveId: 'REC-TX-2026-88192-S3',
      notarySignatureHash: 'c791f42198031e08db917c9d74944d18ec06f6ae9b6e3f225bb9d06bcf44e019'
    }
  ]);

  const [isDbReady, setIsDbReady] = useState(false);
  const [dbStats, setDbStats] = useState<DBStats | null>(null);

  // Initialize IndexedDB on startup and handle deep-linking query parameters
  useEffect(() => {
    const parseUrlRoute = (currentEnvelopes: Envelope[] = envelopes) => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const signId = params.get('sign');
      const previewId = params.get('preview') || params.get('envelope') || params.get('doc');
      const signerId = params.get('signer');
      const viewParam = params.get('view') as AppView | null;
      const certId = params.get('cert') || params.get('certificate');

      const targetId = signId || previewId || certId;
      if (targetId) {
        const found = currentEnvelopes.some(e => e.id === targetId);
        if (!found) {
          const seedMatch = INITIAL_ENVELOPES.find(e => e.id === targetId);
          if (seedMatch) {
            setEnvelopes(prev => [seedMatch, ...prev.filter(e => e.id !== targetId)]);
          }
        }
      }

      if (signId) {
        setActiveEnvelopeId(signId);
        if (signerId) {
          setActiveSigningRecipientId(signerId);
        }
        setActiveView('signing');
        return;
      }

      if (previewId) {
        setActiveEnvelopeId(previewId);
        setActiveView('prepare');
        return;
      }

      if (certId) {
        setSelectedCertificateEnvelopeId(certId);
        setIsCertificateModalOpen(true);
        setActiveEnvelopeId(certId);
        return;
      }

      if (viewParam) {
        setActiveView(viewParam);
      }
    };

    initLocalDatabase().then((loaded) => {
      const activeList = loaded && loaded.length > 0 ? loaded : INITIAL_ENVELOPES;
      setEnvelopes(activeList);
      setIsDbReady(true);
      getDatabaseStats().then(setDbStats);
      parseUrlRoute(activeList);
    }).catch(err => {
      console.warn('DB initialization error:', err);
      setIsDbReady(true);
      parseUrlRoute(INITIAL_ENVELOPES);
    });

    const onPopState = () => parseUrlRoute();
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Synchronize browser address bar with current activeView and activeEnvelopeId
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isFirstSyncRef.current) {
      isFirstSyncRef.current = false;
      return;
    }

    const params = new URLSearchParams();

    if (activeView === 'signing') {
      if (activeEnvelopeId) params.set('sign', activeEnvelopeId);
      if (activeSigningRecipientId) params.set('signer', activeSigningRecipientId);
    } else if (activeView === 'prepare') {
      if (activeEnvelopeId) params.set('envelope', activeEnvelopeId);
      params.set('view', 'prepare');
    } else if (activeView !== 'dashboard') {
      params.set('view', activeView);
    }

    const currentSearch = window.location.search;
    const newSearch = params.toString() ? `?${params.toString()}` : '';
    const newUrl = `${window.location.pathname}${newSearch}`;

    if (currentSearch !== newSearch) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [activeView, activeEnvelopeId, activeSigningRecipientId]);

  // Auto-sync envelopes to IndexedDB whenever state updates
  useEffect(() => {
    if (isDbReady && envelopes.length > 0) {
      saveAllEnvelopesToDB(envelopes).then(() => {
        getDatabaseStats().then(setDbStats);
      });
    }
  }, [envelopes, isDbReady]);

  const refreshDbStats = async () => {
    const stats = await getDatabaseStats();
    setDbStats(stats);
  };

  const exportDbBackup = async (): Promise<string> => {
    const json = await exportDatabaseJSON();
    return json;
  };

  const importDbBackup = async (json: string): Promise<boolean> => {
    const success = await importDatabaseJSON(json);
    if (success) {
      const refreshed = await initLocalDatabase();
      setEnvelopes(refreshed);
      await refreshDbStats();
      notify('success', 'Database Restored', 'All envelopes, templates, and audit logs imported.');
      return true;
    } else {
      notify('error', 'Restore Failed', 'Invalid JSON backup format or corrupted payload.');
      return false;
    }
  };

  const resetDb = async () => {
    const resetList = await resetDatabaseToDefaults();
    setEnvelopes(resetList);
    await refreshDbStats();
    notify('info', 'Database Reset', 'Reset all local stores to default enterprise seed records.');
  };

  const activeEnvelope = envelopes.find(e => e.id === activeEnvelopeId) || envelopes[0] || null;

  const notify = (
    type: ToastNotification['type'], 
    title: string, 
    message: string,
    category: ToastNotification['category'] = 'system',
    targetView?: AppView,
    targetEnvelopeId?: string
  ) => {
    const id = generateUUID();
    const newNotif: ToastNotification = {
      id,
      type,
      title,
      message,
      timestamp: 'Just now',
      createdAt: Date.now(),
      isRead: false,
      category,
      targetView,
      targetEnvelopeId
    };

    // 1. Add to permanent Notification Center History
    setNotifications(prev => [newNotif, ...prev]);

    // 2. Add to active screen popup toasts (with 1-minute auto-dismiss)
    const newToast: ActiveToast = {
      id,
      type,
      title,
      message,
      createdAt: Date.now(),
      durationMs: 60000 // 1 minute (60 seconds)
    };
    setActiveToasts(prev => [newToast, ...prev.slice(0, 3)]);

    // 3. Auto-remove popup from screen after 1 min (60,000 ms)
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== id));
    }, 60000);
  };

  const dismissToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setActiveToasts([]);
  };

  const updateTenantSettings = (settings: Partial<TenantSettings>) => {
    setTenant(prev => ({ ...prev, ...settings }));
    notify('success', 'Tenant Branding Updated', 'Custom styling and compliance settings applied.');
  };

  const triggerMockWebhook = (event: string, envelope: Envelope) => {
    const fullDocText = envelope.documents?.[0]?.pages?.map(p => p.content).join('\n') || '';
    const structuredTerms = envelope.structuredTerms || extractStructuredTerms(fullDocText, envelope.fields, envelope.totalPaymentAmount);
    const slackPayload = buildSlackWebhookPayload(envelope, structuredTerms);

    webhooks.forEach(wh => {
      if (!wh.isActive || !wh.events.includes(event)) return;

      const payload = {
        event,
        eventId: 'evt_' + generateUUID().slice(0, 12),
        timestamp: new Date().toISOString(),
        envelope: {
          id: envelope.id,
          title: envelope.title,
          status: envelope.status,
          sender: envelope.sender,
          recipients: envelope.recipients.map(r => ({ name: r.name, email: r.email, role: r.role, status: r.status })),
          documentSha256: envelope.documents[0]?.sha256Hash,
          merkleSealHash: envelope.lockSealHash || 'SHA256_SEALED',
          version: envelope.version || 1
        },
        // Webhooks 2.0 Enriched Intelligence
        contractIntelligence: {
          structuredTerms,
          summary: structuredTerms.keyObligationsSummary,
          governingLaw: structuredTerms.governingLaw,
          totalValueUsd: structuredTerms.totalValueUsd,
          autoRenewWindowDays: structuredTerms.autoRenewWindowDays,
          proofDownloadUrl: `http://localhost:5173/?cert=${envelope.id}`,
          verificationCode: `SF-ZTP-${envelope.id.toUpperCase()}`
        },
        slackBlocks: slackPayload.blocks
      };

      const payloadString = JSON.stringify(payload);
      const signatureHmac = generateHmacSignature(payloadString, wh.secretKey);

      const log: WebhookLog = {
        id: generateUUID(),
        endpointId: wh.id,
        event,
        timestamp: new Date().toISOString(),
        durationMs: Math.floor(Math.random() * 80 + 30),
        statusCode: 200,
        payload,
        signatureHmac
      };

      setWebhookLogs(prev => [log, ...prev.slice(0, 29)]);
    });
  };

  const createNewEnvelope = (draftData?: Partial<Envelope>): Envelope => {
    const newEnvelope: Envelope = {
      id: 'env-' + generateUUID().slice(0, 8),
      title: draftData?.title || 'Untitled New Agreement',
      description: draftData?.description || 'Draft envelope created for signature routing',
      sender: {
        name: 'Sarah Jenkins',
        email: 'sarah.j@signflow.ai',
        organization: tenant.organization,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      },
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      tags: draftData?.tags || ['Draft', 'Commercial'],
      requiresPayment: draftData?.requiresPayment || false,
      documents: draftData?.documents || [
        {
          id: 'doc-' + generateUUID().slice(0, 6),
          name: 'Commercial_Agreement_Draft.pdf',
          size: '1.2 MB',
          fileType: 'pdf',
          sha256Hash: generateFullSha256(),
          pages: [
            {
              pageNumber: 1,
              title: '1. Standard Commercial Terms',
              content: `### COMMERCIAL SERVICES AGREEMENT\n\nThis Agreement is entered into between **Provider** and **Client** as of the Effective Date.\n\n#### 1. SCOPE OF SERVICES\nProvider shall deliver the technical services and deliverables specified herein.\n\n#### 2. PAYMENT & INVOICING\nClient shall pay all fees within thirty (30) days of receipt of invoice.\n\n#### 3. LIMITATION OF LIABILITY\nAggregate liability is capped at the total amount paid in the prior 12 months.`
            },
            {
              pageNumber: 2,
              title: '2. Execution & Signatures',
              content: `#### 4. GOVERNING LAW\nThis Agreement is governed by the laws of the State of Delaware.\n\n---\n### IN WITNESS WHEREOF, the parties hereto have executed this Agreement.`
            }
          ]
        }
      ],
      fields: draftData?.fields || [],
      recipients: draftData?.recipients || [
        {
          id: 'rec-' + generateUUID().slice(0, 6),
          name: 'First Signer',
          email: 'signer@counterparty.com',
          role: 'signer',
          routingOrder: 1,
          authType: 'email',
          status: 'ready'
        }
      ],
      auditTrail: [
        {
          id: 'aud-' + generateUUID().slice(0, 6),
          timestamp: new Date().toISOString(),
          actor: 'Sarah Jenkins',
          action: 'Envelope Draft Created',
          details: 'Initialized new agreement draft session',
          ipAddress: getMockIpAddress(),
          geo: 'San Francisco, CA, US',
          device: getMockDeviceFingerprint(),
          hashChainPrevious: 'ROOT_GENESIS_HASH',
          hashChainCurrent: generateFullSha256(),
          complianceTags: ['ESIGN', 'SOC2']
        }
      ]
    };

    setEnvelopes(prev => [newEnvelope, ...prev]);
    setActiveEnvelopeId(newEnvelope.id);
    setActiveView('prepare');
    notify('success', 'New Envelope Created', `Draft "${newEnvelope.title}" is ready for editing.`);
    return newEnvelope;
  };

  const updateEnvelope = (id: string, updates: Partial<Envelope>) => {
    setEnvelopes(prev => prev.map(env => env.id === id ? { ...env, ...updates, updatedAt: new Date().toISOString() } : env));
  };

  const deleteEnvelope = async (id: string) => {
    try {
      await deleteEnvelopeFromDB(id);
    } catch (e) {
      console.warn('Failed to delete envelope from IndexedDB:', e);
    }
    setEnvelopes(prev => prev.filter(e => e.id !== id));
    if (activeEnvelopeId === id) {
      const remaining = envelopes.filter(e => e.id !== id);
      setActiveEnvelopeId(remaining[0]?.id || null);
      setActiveView('envelopes');
    }
    notify('info', 'Envelope Removed', 'Envelope has been permanently removed from your vault.');
  };

  const sendEnvelope = (id: string) => {
    const env = envelopes.find(e => e.id === id);
    if (!env) return;

    const newAudit: AuditEvent = {
      id: 'aud-' + generateUUID().slice(0, 6),
      timestamp: new Date().toISOString(),
      actor: `${env.sender.name} (${env.sender.email})`,
      action: 'Envelope Dispatched to Recipients',
      details: `Sent to ${env.recipients.length} recipients via secure email routing`,
      ipAddress: getMockIpAddress(),
      geo: 'San Francisco, CA, US',
      device: getMockDeviceFingerprint(),
      hashChainPrevious: env.auditTrail[env.auditTrail.length - 1]?.hashChainCurrent || 'GENESIS_0',
      hashChainCurrent: generateFullSha256(),
      complianceTags: ['ESIGN', 'eIDAS', 'SOC2']
    };

    const updated: Envelope = {
      ...env,
      status: 'sent',
      updatedAt: new Date().toISOString(),
      auditTrail: [...env.auditTrail, newAudit]
    };

    setEnvelopes(prev => prev.map(e => e.id === id ? updated : e));
    triggerMockWebhook('envelope.sent', updated);
    notify('success', 'Envelope Sent!', `Agreement "${env.title}" is on its way to recipients.`);
  };

  const voidEnvelope = (id: string, reason: string) => {
    const env = envelopes.find(e => e.id === id);
    if (!env) return;

    const newAudit: AuditEvent = {
      id: 'aud-' + generateUUID().slice(0, 6),
      timestamp: new Date().toISOString(),
      actor: 'Sarah Jenkins (Sender)',
      action: 'Envelope Voided',
      details: `Voided with reason: ${reason}`,
      ipAddress: getMockIpAddress(),
      geo: 'San Francisco, CA, US',
      device: getMockDeviceFingerprint(),
      hashChainPrevious: env.auditTrail[env.auditTrail.length - 1]?.hashChainCurrent || 'GENESIS_0',
      hashChainCurrent: generateFullSha256(),
      complianceTags: ['ESIGN', 'SOC2', '21CFR11']
    };

    const updated: Envelope = {
      ...env,
      status: 'voided',
      updatedAt: new Date().toISOString(),
      auditTrail: [...env.auditTrail, newAudit]
    };

    setEnvelopes(prev => prev.map(e => e.id === id ? updated : e));
    triggerMockWebhook('envelope.voided', updated);
    notify('warning', 'Envelope Voided', `Envelope "${env.title}" has been canceled.`);
  };

  const addFieldToEnvelope = (envelopeId: string, field: Omit<DocumentField, 'id'>) => {
    const newField: DocumentField = {
      ...field,
      id: 'fld-' + generateUUID().slice(0, 6)
    };
    setEnvelopes(prev => prev.map(env => {
      if (env.id !== envelopeId) return env;
      return {
        ...env,
        fields: [...env.fields, newField],
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const updateFieldInEnvelope = (envelopeId: string, fieldId: string, updates: Partial<DocumentField>) => {
    setEnvelopes(prev => prev.map(env => {
      if (env.id !== envelopeId) return env;
      return {
        ...env,
        fields: env.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f),
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const removeFieldFromEnvelope = (envelopeId: string, fieldId: string) => {
    setEnvelopes(prev => prev.map(env => {
      if (env.id !== envelopeId) return env;
      return {
        ...env,
        fields: env.fields.filter(f => f.id !== fieldId),
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const runAISmartFieldPlacement = (envelopeId: string): number => {
    const env = envelopes.find(e => e.id === envelopeId);
    if (!env) return 0;

    const doc = env.documents[0];
    if (!doc) return 0;

    const fullDocText = doc.pages.map(p => p.content).join('\n');
    const primaryRecipient = env.recipients[0]?.id || 'rec-default';
    const detected = detectSmartFields(fullDocText, primaryRecipient, doc.pages.length);

    setEnvelopes(prev => prev.map(e => {
      if (e.id !== envelopeId) return e;
      return {
        ...e,
        fields: [...e.fields, ...detected],
        updatedAt: new Date().toISOString()
      };
    }));

    notify('ai', 'AI Smart Fields Placed', `Auto-detected and placed ${detected.length} fields with 96%+ layout confidence.`);
    return detected.length;
  };

  const runAIRiskScan = (envelopeId: string) => {
    const env = envelopes.find(e => e.id === envelopeId);
    if (!env) return;

    const doc = env.documents[0];
    const fullText = doc ? doc.pages.map(p => p.content).join('\n') : '';
    const analysis = analyzeDocumentRisk(fullText);

    setEnvelopes(prev => prev.map(e => {
      if (e.id !== envelopeId) return e;
      return {
        ...e,
        aiAnalysis: analysis,
        updatedAt: new Date().toISOString()
      };
    }));

    notify('ai', 'Risk Review Complete', `Playbook Grade: ${analysis.playbookGrade} (${analysis.overallScore}/100) with ${analysis.findings.length} findings.`);
  };

  const submitSignerSignature = (
    envelopeId: string, 
    recipientId: string, 
    signatureData: Recipient['signatureData'],
    fieldValues: Record<string, string>
  ) => {
    const env = envelopes.find(e => e.id === envelopeId);
    if (!env) return;

    const now = new Date().toISOString();
    const updatedRecipients = env.recipients.map(r => {
      if (r.id === recipientId) {
        return {
          ...r,
          status: 'signed' as const,
          signedAt: now,
          signatureData
        };
      }
      return r;
    });

    // Check if all required participants (signers and approvers) have completed
    const requiredActionRecipients = updatedRecipients.filter(r => r.role === 'signer' || r.role === 'approver' || r.role === 'in_person');
    const allSigned = requiredActionRecipients.length > 0 && requiredActionRecipients.every(r => r.status === 'signed');
    const newStatus: EnvelopeStatus = allSigned ? 'completed' : 'sent';

    // If more signers are remaining, advance the next recipient in line
    let nextRecipient = updatedRecipients.find(r => (r.role === 'signer' || r.role === 'approver' || r.role === 'in_person') && r.status !== 'signed');
    if (nextRecipient && nextRecipient.status === 'waiting') {
      nextRecipient.status = 'ready';
    }

    // Update field values
    const updatedFields = env.fields.map(f => {
      if (fieldValues[f.id] !== undefined) {
        return { ...f, value: fieldValues[f.id] };
      }
      if (f.recipientId === recipientId && f.type === 'signature') {
        return { ...f, value: signatureData?.value || 'Signed' };
      }
      if (f.recipientId === recipientId && f.type === 'date_signed') {
        return { ...f, value: new Date().toLocaleDateString() };
      }
      return f;
    });

    const currentSigner = updatedRecipients.find(r => r.id === recipientId);
    const signingAudit: AuditEvent = {
      id: 'aud-' + generateUUID().slice(0, 6),
      timestamp: now,
      actor: currentSigner?.name || 'Signer',
      action: allSigned ? 'Document Signed & Cryptographically Sealed' : `Signature Applied (Step Completed)`,
      details: allSigned 
        ? `Final signature applied (${signatureData?.type}) with SHA-256 document binding and consent verification.`
        : `Signature applied (${signatureData?.type}). Sequential workflow advanced to next signer ${nextRecipient?.name || 'Counterparty'} (${nextRecipient?.email || ''}).`,
      ipAddress: signatureData?.ipAddress || getMockIpAddress(),
      geo: 'San Francisco, CA, US',
      device: signatureData?.deviceFingerprint || getMockDeviceFingerprint(),
      hashChainPrevious: env.auditTrail[env.auditTrail.length - 1]?.hashChainCurrent || 'GENESIS_0',
      hashChainCurrent: generateFullSha256(),
      complianceTags: ['ESIGN', 'eIDAS', '21CFR11', 'SOC2']
    };

    let completionAudit: AuditEvent | null = null;
    let updatedDocuments = env.documents;

    if (allSigned) {
      completionAudit = {
        id: 'aud-' + generateUUID().slice(0, 6),
        timestamp: now,
        actor: 'SignFlow Cryptographic Trust Vault',
        action: 'Document Cryptographically Sealed & Certificate Appended',
        details: 'All required parties signed. Immutable PDF Certificate of Completion appended to document. Document locked for editing with SHA-256 tamper seal.',
        ipAddress: '10.0.0.1 (SignFlow Core HSM Node)',
        geo: 'AWS us-east-1 (Delaware Region)',
        device: 'SignFlow-PKI-Engine-v4',
        hashChainPrevious: signingAudit.hashChainCurrent,
        hashChainCurrent: generateFullSha256(),
        complianceTags: ['ESIGN', 'eIDAS', '21CFR11', 'SOC2']
      };

      // Automatically append Certificate of Completion page to document
      if (env.documents?.[0]) {
        const doc = env.documents[0];
        const certPageNum = (doc.pages?.length || 0) + 1;
        const certPage = {
          pageNumber: certPageNum,
          title: 'Certificate of Completion & Cryptographic Audit Ledger',
          content: `### CERTIFICATE OF COMPLETION\n\n**Envelope Title**: ${env.title}\n**Envelope ID**: #COC-${env.id.toUpperCase()}\n**Organization**: ${tenant.organization}\n**Completed Date**: ${formatTimestamp(now)}\n**Document SHA-256 Digest**: ${doc.sha256Hash || 'a3b5c6d7e8f1f9a2b3c4d5e6f7a8b9c0d1e2f3e4b5c6d7e8f9a0b1c2d3e4f5a6b'}\n\n---\n#### 1. SIGNER VERIFICATION EVIDENCE\n${updatedRecipients.map(r => `• **${r.name}** (${r.email}) — Role: ${r.role} | Status: ${r.status === 'signed' ? 'Signed ✓' : 'Pending ⏳'} | Timestamp: ${r.signedAt ? formatTimestamp(r.signedAt) : 'Pending'} | IP: ${r.signatureData?.ipAddress || '198.51.100.82'} | Auth: ${r.authType || 'Email OTP (2FA)'}`).join('\n')}\n\n---\n#### 2. LEGAL NON-REPUDIATION SEAL\nThis electronic document has been cryptographically sealed and locked. Any alteration to this file breaks the SHA-256 digest and is recorded in the append-only audit trail under US ESIGN Act §101, UETA, & EU eIDAS (No 910/2014).\n\n**STATUS: 🔒 SEALED & IMMUTABLY LOCKED**`
        };

        updatedDocuments = [
          {
            ...doc,
            pages: [...doc.pages.filter(p => !p.title.includes('Certificate of Completion')), certPage]
          }
        ];
      }
    }

    const newAuditTrail = completionAudit 
      ? [...env.auditTrail, signingAudit, completionAudit] 
      : [...env.auditTrail, signingAudit];

    let structuredTerms: any = undefined;
    if (allSigned) {
      const fullDocText = updatedDocuments[0]?.pages?.map(p => p.content).join('\n') || '';
      structuredTerms = extractStructuredTerms(fullDocText, updatedFields, env.totalPaymentAmount);
    }

    const updatedEnv: Envelope = {
      ...env,
      status: newStatus,
      completedAt: allSigned ? now : undefined,
      isLocked: allSigned ? true : false,
      lockedAt: allSigned ? now : undefined,
      lockSealHash: allSigned ? generateFullSha256() : undefined,
      certificateAppended: allSigned ? true : false,
      documents: updatedDocuments,
      recipients: updatedRecipients,
      fields: updatedFields,
      auditTrail: newAuditTrail,
      structuredTerms,
      updatedAt: now
    };

    setEnvelopes(prev => prev.map(e => e.id === envelopeId ? updatedEnv : e));
    triggerMockWebhook(allSigned ? 'envelope.completed' : 'envelope.signed', updatedEnv);

    // If there is a next recipient, automatically dispatch signing invitation to them
    if (!allSigned && nextRecipient) {
      sendEnvelopeReminder(envelopeId, nextRecipient.id);
      notify('info', 'Advanced to Next Signer', `Signed as ${currentSigner?.name}. Sequential email invitation dispatched to ${nextRecipient.name} (${nextRecipient.email}).`);
    } else if (allSigned) {
      notify('success', 'Agreement Sealed & Locked!', 'All parties signed. Certificate of Completion appended to PDF and locked with SHA-256 seal.');
    }
  };

  // Unlock Completed/Locked Envelope for Revision & Re-signing
  const unlockEnvelopeForRevision = (envelopeId: string, reason: string = 'Authorized clause renegotiation & amendments') => {
    const env = envelopes.find(e => e.id === envelopeId);
    if (!env) return;

    const now = new Date().toISOString();
    const prevHash = env.auditTrail[env.auditTrail.length - 1]?.hashChainCurrent || 'GENESIS_0';
    const currentHash = generateFullSha256();
    const nextVersion = (env.version || 1) + 1;

    const unlockAudit: AuditEvent = {
      id: 'aud-' + generateUUID().slice(0, 6),
      timestamp: now,
      actor: 'Tanish Khosla (Envelope Owner / Admin)',
      action: 'Envelope Unlocked for Revision & Re-signing',
      details: `Agreement unlocked for editing. Reason: "${reason}". Previous cryptographic seal invalidated. Version bumped to v${nextVersion}.0. All parties will be required to re-sign.`,
      ipAddress: getMockIpAddress(),
      geo: 'San Francisco, CA, US',
      device: getMockDeviceFingerprint(),
      hashChainPrevious: prevHash,
      hashChainCurrent: currentHash,
      complianceTags: ['ESIGN', 'eIDAS', '21CFR11', 'SOC2']
    };

    // Remove appended certificate page so document is ready for live editing
    const cleanedDocuments = env.documents.map(doc => ({
      ...doc,
      pages: doc.pages.filter(p => !p.title.includes('Certificate of Completion'))
    }));

    // Reset recipient signatures for fresh re-signing
    const resetRecipients = env.recipients.map(r => ({
      ...r,
      status: 'ready' as const,
      signedAt: undefined,
      signatureData: undefined
    }));

    const updatedEnv: Envelope = {
      ...env,
      status: 'in_revision',
      isLocked: false,
      version: nextVersion,
      certificateAppended: false,
      completedAt: undefined,
      documents: cleanedDocuments,
      recipients: resetRecipients,
      auditTrail: [...env.auditTrail, unlockAudit],
      updatedAt: now
    };

    setEnvelopes(prev => prev.map(e => e.id === envelopeId ? updatedEnv : e));
    setActiveEnvelopeId(envelopeId);
    setActiveView('prepare');
    notify('warning', `Agreement Unlocked (v${nextVersion}.0)`, `Document is now open for editing. Previous signatures invalidated and recorded in audit trail.`);
  };

  // Record Tampering or Post-Completion Alteration Attempt in Audit Trail
  const recordTamperingAttempt = (envelopeId: string, modificationDetails: string) => {
    const env = envelopes.find(e => e.id === envelopeId);
    if (!env) return;

    const now = new Date().toISOString();
    const prevHash = env.auditTrail[env.auditTrail.length - 1]?.hashChainCurrent || 'GENESIS_0';
    const currentHash = generateFullSha256();

    const tamperAudit: AuditEvent = {
      id: 'aud-' + generateUUID().slice(0, 6),
      timestamp: now,
      actor: 'Security Integrity Sentinel',
      action: 'Document Alteration Attempt Recorded (Post-Seal Modification)',
      details: `Field alteration attempted on sealed envelope: "${modificationDetails}". Immutable ledger updated with checksum mismatch alert.`,
      ipAddress: getMockIpAddress(),
      geo: 'San Francisco, CA, US',
      device: getMockDeviceFingerprint(),
      hashChainPrevious: prevHash,
      hashChainCurrent: currentHash,
      complianceTags: ['ESIGN', 'eIDAS', '21CFR11', 'SOC2']
    };

    const updatedEnv: Envelope = {
      ...env,
      auditTrail: [...env.auditTrail, tamperAudit],
      updatedAt: now
    };

    setEnvelopes(prev => prev.map(e => e.id === envelopeId ? updatedEnv : e));
    notify('error', 'Tampering Event Logged', 'Post-completion alteration detected and permanently recorded in audit trail.');
  };

  // Re-send Revised Envelope for Signing
  const resendEnvelopeForSigning = (envelopeId: string) => {
    const env = envelopes.find(e => e.id === envelopeId);
    if (!env) return;

    const now = new Date().toISOString();
    const prevHash = env.auditTrail[env.auditTrail.length - 1]?.hashChainCurrent || 'GENESIS_0';
    const currentHash = generateFullSha256();

    const dispatchAudit: AuditEvent = {
      id: 'aud-' + generateUUID().slice(0, 6),
      timestamp: now,
      actor: 'Tanish Khosla (Envelope Owner)',
      action: 'Revised Agreement Dispatched for Re-signing',
      details: `Version ${env.version || 2}.0 dispatched to all recipients (${env.recipients.map(r => r.email).join(', ')}) with fresh tokenized signing links.`,
      ipAddress: getMockIpAddress(),
      geo: 'San Francisco, CA, US',
      device: getMockDeviceFingerprint(),
      hashChainPrevious: prevHash,
      hashChainCurrent: currentHash,
      complianceTags: ['ESIGN', 'eIDAS', '21CFR11', 'SOC2']
    };

    const updatedEnv: Envelope = {
      ...env,
      status: 'sent',
      auditTrail: [...env.auditTrail, dispatchAudit],
      updatedAt: now
    };

    setEnvelopes(prev => prev.map(e => e.id === envelopeId ? updatedEnv : e));
    triggerMockWebhook('envelope.sent', updatedEnv);
    notify('success', `Version ${env.version || 2}.0 Dispatched`, 'Sent updated agreement to all signers for re-signing.');
  };

  // In-Ceremony Live Clause Negotiation actions (Pillar 1)
  const proposeClauseAmendment = (
    envelopeId: string, 
    amendmentData: Omit<NegotiationAmendment, 'id' | 'createdAt' | 'status'>
  ) => {
    const env = envelopes.find(e => e.id === envelopeId);
    if (!env) return;

    const now = new Date().toISOString();
    const amendment: NegotiationAmendment = {
      ...amendmentData,
      id: 'amend-' + generateUUID().slice(0, 8),
      createdAt: now,
      status: 'pending'
    };

    const prevHash = env.auditTrail[env.auditTrail.length - 1]?.hashChainCurrent || 'GENESIS_0';
    const currentHash = generateFullSha256();

    const auditItem: AuditEvent = {
      id: 'aud-' + generateUUID().slice(0, 6),
      timestamp: now,
      actor: amendment.proposerName,
      action: 'In-Ceremony Clause Amendment Proposed',
      details: `Signer proposed in-place amendment on "${amendment.sectionTitle}": "${amendment.proposedText.slice(0, 90)}..." Reason: ${amendment.reason}`,
      ipAddress: getMockIpAddress(),
      geo: 'San Francisco, CA, US',
      device: getMockDeviceFingerprint(),
      hashChainPrevious: prevHash,
      hashChainCurrent: currentHash,
      complianceTags: ['ESIGN', 'eIDAS', '21CFR11', 'SOC2']
    };

    const updatedEnv: Envelope = {
      ...env,
      negotiationAmendments: [...(env.negotiationAmendments || []), amendment],
      auditTrail: [...env.auditTrail, auditItem],
      updatedAt: now
    };

    setEnvelopes(prev => prev.map(e => e.id === envelopeId ? updatedEnv : e));
    notify('ai', 'In-Ceremony Amendment Proposed', `Signer proposed alternative wording for "${amendment.sectionTitle}".`);
  };

  const resolveClauseAmendment = (
    envelopeId: string, 
    amendmentId: string, 
    decision: 'approved' | 'rejected', 
    counterText?: string
  ) => {
    const env = envelopes.find(e => e.id === envelopeId);
    if (!env) return;

    const amendment = env.negotiationAmendments?.find(a => a.id === amendmentId);
    if (!amendment) return;

    const now = new Date().toISOString();
    const prevHash = env.auditTrail[env.auditTrail.length - 1]?.hashChainCurrent || 'GENESIS_0';
    const currentHash = generateFullSha256();

    let updatedDocs = env.documents;
    if (decision === 'approved') {
      const targetText = counterText || amendment.proposedText;
      updatedDocs = env.documents.map(doc => ({
        ...doc,
        pages: doc.pages.map(page => {
          if (page.content.includes(amendment.originalText)) {
            return {
              ...page,
              content: page.content.replace(amendment.originalText, targetText)
            };
          }
          if (page.title.toLowerCase().includes(amendment.sectionTitle.toLowerCase()) || page.content.toLowerCase().includes(amendment.sectionTitle.toLowerCase())) {
            return {
              ...page,
              content: `${page.content}\n\n*Amendment Incorporated In-Ceremony (${formatTimestamp(now)}):*\n${targetText}`
            };
          }
          return page;
        })
      }));
    }

    const auditItem: AuditEvent = {
      id: 'aud-' + generateUUID().slice(0, 6),
      timestamp: now,
      actor: currentUser?.name || 'Document Administrator',
      action: `Clause Amendment ${decision === 'approved' ? 'Approved (In-Place Updated)' : 'Rejected'}`,
      details: decision === 'approved'
        ? `In-ceremony amendment on "${amendment.sectionTitle}" approved. Text updated in document canvas without envelope voiding. SHA-256 Merkle chain preserved.`
        : `In-ceremony amendment on "${amendment.sectionTitle}" was rejected.`,
      ipAddress: getMockIpAddress(),
      geo: 'San Francisco, CA, US',
      device: getMockDeviceFingerprint(),
      hashChainPrevious: prevHash,
      hashChainCurrent: currentHash,
      complianceTags: ['ESIGN', 'eIDAS', '21CFR11', 'SOC2']
    };

    const updatedAmendments = (env.negotiationAmendments || []).map(a => 
      a.id === amendmentId 
        ? { ...a, status: decision, resolvedAt: now, resolvedBy: currentUser?.name || 'Administrator' } 
        : a
    );

    const updatedEnv: Envelope = {
      ...env,
      documents: updatedDocs,
      negotiationAmendments: updatedAmendments,
      auditTrail: [...env.auditTrail, auditItem],
      updatedAt: now
    };

    setEnvelopes(prev => prev.map(e => e.id === envelopeId ? updatedEnv : e));
    if (decision === 'approved') {
      notify('success', 'Amendment Approved In-Place!', `"${amendment.sectionTitle}" updated in canvas. All prior signatures preserved.`);
    } else {
      notify('warning', 'Amendment Rejected', `Amendment for "${amendment.sectionTitle}" was declined.`);
    }
  };

  // Post-Signature Contract Autopilot (Pillar 3)
  const executeContractAutopilot = async (envelopeId: string) => {
    const env = envelopes.find(e => e.id === envelopeId);
    if (!env) return;

    const fullDocText = env.documents?.[0]?.pages?.map(p => p.content).join('\n') || '';
    const structuredTerms = extractStructuredTerms(fullDocText, env.fields, env.totalPaymentAmount);
    const obligations = generateAutopilotObligations(env, structuredTerms);

    const now = new Date().toISOString();
    const prevHash = env.auditTrail[env.auditTrail.length - 1]?.hashChainCurrent || 'GENESIS_0';
    const currentHash = generateFullSha256();

    const autopilotAudit: AuditEvent = {
      id: 'aud-' + generateUUID().slice(0, 6),
      timestamp: now,
      actor: 'SignFlow Autopilot & Radar Agent',
      action: 'Contract Autopilot Executed & Radar Armed',
      details: `Extracted ${structuredTerms.keyObligationsSummary?.length || 5} key business terms. Initialized ${obligations.length} actionable obligations (${obligations.map(o => o.title).join(', ')}). Webhooks 2.0 armed.`,
      ipAddress: '10.0.0.8 (Autopilot-Orchestrator)',
      geo: 'AWS us-east-1 (Delaware Region)',
      device: 'SignFlow-Autopilot-Engine-v1',
      hashChainPrevious: prevHash,
      hashChainCurrent: currentHash,
      complianceTags: ['ESIGN', 'SOC2']
    };

    const updatedEnv: Envelope = {
      ...env,
      structuredTerms,
      auditTrail: [...env.auditTrail, autopilotAudit],
      updatedAt: now
    };

    setEnvelopes(prev => prev.map(e => e.id === envelopeId ? updatedEnv : e));
    notify('ai', 'Contract Autopilot Active', `Obligation Radar armed with ${obligations.length} deadlines. Webhook 2.0 payload structured.`);
  };

  const openSigningSession = (envelopeId: string, recipientId?: string) => {
    setActiveEnvelopeId(envelopeId);
    setActiveSigningRecipientId(recipientId || null);
    setActiveView('signing');
  };

  const sendEnvelopeReminder = async (
    envelopeId: string, 
    recipientId?: string, 
    customEmail?: string
  ): Promise<{ success: boolean; message: string; emailId?: string }> => {
    const env = envelopes.find(e => e.id === envelopeId);
    if (!env) {
      return { success: false, message: 'Envelope not found' };
    }

    const recipientsToNotify = recipientId 
      ? env.recipients.filter(r => r.id === recipientId)
      : env.recipients.filter(r => r.status !== 'signed');

    if (recipientsToNotify.length === 0 && !customEmail) {
      notify('info', 'All Signatures Captured', 'All signers have already signed this envelope.');
      return { success: true, message: 'All signers have already signed.' };
    }

    const targetList = customEmail 
      ? [{ id: 'custom', name: 'Signer', email: customEmail, role: 'signer' as const, status: 'ready' as const }]
      : recipientsToNotify;

    let successCount = 0;
    let lastMsg = '';
    let lastEmailId = '';

    for (const r of targetList) {
      try {
        const response = await fetch('http://localhost:8090/api/v1/emails/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toEmail: r.email,
            recipientName: r.name,
            envelopeId: env.id,
            envelopeTitle: env.title,
            senderName: env.sender?.name || tenant.name || 'SignFlow Sender',
            senderOrg: env.sender?.organization || tenant.organization,
            magicLink: `${window.location.origin}/?sign=${env.id}&signer=${r.id}`
          })
        });

        const data = await response.json();
        if (data.success) {
          successCount++;
          lastEmailId = data.emailId;
          lastMsg = data.message || `Dispatched to ${r.email}`;
        } else if (data.liveApiCalled && data.error) {
          lastMsg = `Resend Notice: ${data.error}`;
        }
      } catch (err: any) {
        console.warn('Backend email reminder dispatch error:', err);
        lastMsg = `Dispatched locally (Backend offline: ${err.message})`;
      }
    }

    const now = new Date().toISOString();
    const reminderAudit: AuditEvent = {
      id: 'aud-' + generateUUID().slice(0, 6),
      timestamp: now,
      actor: 'Sarah Jenkins (SignFlow Operations)',
      action: 'Automated Reminder Dispatched',
      details: `Dispatched electronic signing reminder to ${targetList.map(r => `${r.name} <${r.email}>`).join(', ')}. SHA-256 session token active.`,
      ipAddress: getMockIpAddress(),
      geo: 'San Francisco, CA, US',
      device: getMockDeviceFingerprint(),
      hashChainPrevious: env.auditTrail[env.auditTrail.length - 1]?.hashChainCurrent || 'GENESIS_HASH',
      hashChainCurrent: generateFullSha256(),
      complianceTags: ['ESIGN', 'SOC2']
    };

    setEnvelopes(prev => prev.map(e => e.id === envelopeId ? {
      ...e,
      auditTrail: [...e.auditTrail, reminderAudit],
      updatedAt: now
    } : e));

    if (successCount > 0) {
      notify('success', 'Email Reminder Dispatched', `Sent signing reminder to ${targetList.map(r => r.email).join(', ')}.`);
    } else {
      notify('info', 'Reminder Status', lastMsg || 'Reminder processed.');
    }

    return { success: successCount > 0, message: lastMsg, emailId: lastEmailId };
  };

  const openCertificateView = (envelopeId: string) => {
    setSelectedCertificateEnvelopeId(envelopeId);
    setIsCertificateModalOpen(true);
    if (envelopeId) {
      setActiveEnvelopeId(envelopeId);
    }
    if (activeView !== 'certificate') {
      setPreviousViewBeforeCertificate(activeView);
    }
  };

  const closeCertificateView = () => {
    setIsCertificateModalOpen(false);
    setSelectedCertificateEnvelopeId(null);
    if (activeView === 'signing') {
      setActiveView('envelopes');
    } else if (activeView === 'certificate') {
      setActiveView(previousViewBeforeCertificate || 'prepare');
    }
  };

  const login = (credentials: { 
    email: string; 
    password?: string; 
    name?: string; 
    organization?: string; 
    role?: 'sender' | 'signer' | 'admin' | 'notary' | 'auditor';
  }) => {
    const role = credentials.role || 'sender';
    const profile: UserProfile = {
      id: 'usr-' + generateUUID().slice(0, 8),
      name: credentials.name || credentials.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: credentials.email,
      organization: credentials.organization || (credentials.email.split('@')[1] ? `${credentials.email.split('@')[1].split('.')[0].toUpperCase()} Corp` : 'SignFlow Enterprise'),
      role,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
      tier: 'Enterprise Tier 3'
    };

    setCurrentUser(profile);
    setIsAuthenticated(true);
    setCurrentRole(role);
    try {
      localStorage.setItem('signflow_user_session', JSON.stringify(profile));
    } catch (_) {}

    notify('success', 'Authenticated Successfully', `Welcome back, ${profile.name}!`);

    // If there was a pending envelope or signer target, direct there
    if (activeSigningRecipientId || activeView === 'signing') {
      setActiveView('signing');
    } else if (activeEnvelopeId && activeView === 'prepare') {
      setActiveView('prepare');
    } else {
      setActiveView(role === 'signer' ? 'signing' : 'dashboard');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('signflow_user_session');
    } catch (_) {}
    notify('info', 'Signed Out', 'You have been securely signed out.');
  };

  const verifySignerAccess = (envelopeId: string, recipientId?: string, email?: string): boolean => {
    const targetEnvelope = envelopes.find(e => e.id === envelopeId);
    const targetRecipient = targetEnvelope?.recipients.find(r => (recipientId && r.id === recipientId) || (email && r.email.toLowerCase() === email.toLowerCase())) 
      || targetEnvelope?.recipients[0];

    const signerProfile: UserProfile = {
      id: targetRecipient?.id || 'rec-signer-guest',
      name: targetRecipient?.name || 'Signatory Counterparty',
      email: targetRecipient?.email || email || 'signer@counterparty.com',
      organization: 'Counterparty Partner',
      role: 'signer',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      tier: 'Guest Signer'
    };

    setCurrentUser(signerProfile);
    setIsAuthenticated(true);
    setCurrentRole('signer');
    setActiveEnvelopeId(envelopeId);
    if (targetRecipient) {
      setActiveSigningRecipientId(targetRecipient.id);
    }
    setActiveView('signing');

    try {
      localStorage.setItem('signflow_user_session', JSON.stringify(signerProfile));
    } catch (_) {}

    notify('success', 'Signer Identity Verified', `Direct signing access granted for ${signerProfile.name}.`);
    return true;
  };

  const startNotarySession = (sessionId: string) => {
    setNotarySessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'in_session', signerConnected: true, notaryConnected: true } : s));
    notify('info', 'Live RON Session Active', 'WebRTC video and audio recording established with commissioned notary.');
  };

  const affixNotarySeal = (sessionId: string, sealDetails: NotarySession['sealDetails']) => {
    const now = new Date().toISOString();
    setNotarySessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      return {
        ...s,
        status: 'seal_affixed',
        sealDetails: {
          ...sealDetails,
          sealAffixedAt: now
        }
      };
    }));

    // Add entry to notary journal
    const newJournalEntry: NotaryJournalEntry = {
      id: 'jrnl-' + generateUUID().slice(0, 6),
      timestamp: now,
      documentTitle: 'Commercial Real Estate Lease & Deed (Austin Tech Hub)',
      signerName: 'Marcus Vance',
      signerEmail: 'marcus.vance@techcorp.com',
      idvMethod: 'Government ID + Biometric Facial Match (99.4%)',
      idvProofCode: 'IDV-TX-DL-882910-PASS',
      notarialAct: 'Acknowledgment',
      fee: '$25.00',
      recordingArchiveId: 'REC-TX-2026-' + generateUUID().slice(0, 8) + '-S3',
      notarySignatureHash: generateFullSha256()
    };

    setNotaryJournal(prev => [newJournalEntry, ...prev]);
    notify('success', 'Digital Notary Seal Affixed!', 'Notarial certificate applied and permanently recorded in electronic Notary Journal.');
  };

  const createWebhook = (url: string, name: string, events: string[]) => {
    const newWh: WebhookEndpoint = {
      id: 'wh-' + generateUUID().slice(0, 6),
      url,
      name,
      events,
      secretKey: 'whsec_' + generateUUID().replace(/-/g, ''),
      isActive: true,
      createdAt: new Date().toISOString()
    };
    setWebhooks(prev => [...prev, newWh]);
    notify('success', 'Webhook Registered', `Endpoint "${name}" will receive event dispatch.`);
  };

  const [isCreateEnvelopeModalOpen, setIsCreateEnvelopeModalOpen] = useState(false);

  const openCreateEnvelopeModal = () => setIsCreateEnvelopeModalOpen(true);
  const closeCreateEnvelopeModal = () => setIsCreateEnvelopeModalOpen(false);

  const prepareNewEnvelope = () => {
    setIsCreateEnvelopeModalOpen(true);
  };

  const createEnvelopeFromUpload = (params: {
    title: string;
    description?: string;
    file: {
      name: string;
      size: string;
      fileType: 'pdf' | 'docx' | 'xlsx' | 'png' | 'txt';
      sha256Hash: string;
      fileUrl?: string;
      rawData?: string;
      pages: DocumentPage[];
    };
    tags: string[];
    recipients: Recipient[];
    agreementType?: 'unilateral' | 'bilateral' | 'multilateral';
  }): Envelope => {
    const finalPageNum = params.file.pages?.length || 1;
    const finalRecipients: Recipient[] = (params.recipients && params.recipients.length > 0 ? params.recipients : [
      {
        id: 'rec-' + generateUUID().slice(0, 6),
        name: 'First Signer',
        email: 'signer@counterparty.com',
        role: 'signer',
        routingOrder: 1,
        authType: 'email',
        status: 'ready'
      }
    ]);

    const isUnilateral = params.agreementType === 'unilateral' || finalRecipients.length === 1;
    const determinedAgreementType: 'unilateral' | 'bilateral' | 'multilateral' = 
      params.agreementType || (finalRecipients.length === 1 ? 'unilateral' : finalRecipients.length === 2 ? 'bilateral' : 'multilateral');

    let recipientFields: DocumentField[] = [];
    if (isUnilateral) {
      const rec = finalRecipients[0];
      recipientFields = [
        {
          id: 'fld-' + generateUUID().slice(0, 6),
          type: 'signature' as const,
          recipientId: rec.id,
          label: `${rec.name} Signature`,
          page: finalPageNum,
          x: 18,
          y: 74,
          width: 200,
          height: 50,
          required: true
        },
        {
          id: 'fld-' + generateUUID().slice(0, 6),
          type: 'date_signed' as const,
          recipientId: rec.id,
          label: 'Date Signed',
          page: finalPageNum,
          x: 62,
          y: 74,
          width: 130,
          height: 40,
          required: true
        },
        {
          id: 'fld-' + generateUUID().slice(0, 6),
          type: 'name' as const,
          recipientId: rec.id,
          label: 'Printed Name',
          page: finalPageNum,
          x: 18,
          y: 86,
          width: 200,
          height: 38,
          required: true
        }
      ];
    } else {
      recipientFields = finalRecipients.flatMap((rec, idx) => [
        {
          id: 'fld-' + generateUUID().slice(0, 6),
          type: 'signature' as const,
          recipientId: rec.id,
          label: `${rec.name} Signature`,
          page: finalPageNum,
          x: (idx % 2 === 0) ? 12 : 55,
          y: 75 + Math.floor(idx / 2) * 12,
          width: 180,
          height: 50,
          required: true
        },
        {
          id: 'fld-' + generateUUID().slice(0, 6),
          type: 'date_signed' as const,
          recipientId: rec.id,
          label: `${rec.name} Date Signed`,
          page: finalPageNum,
          x: (idx % 2 === 0) ? 35 : 78,
          y: 75 + Math.floor(idx / 2) * 12,
          width: 140,
          height: 40,
          required: true
        }
      ]);
    }

    const newEnvelope: Envelope = {
      id: 'env-' + generateUUID().slice(0, 8),
      title: params.title || params.file.name.replace(/\.[^/.]+$/, ''),
      description: params.description || (isUnilateral ? 'Unilateral custom agreement document uploaded for single signee execution.' : 'Custom document uploaded for electronic execution.'),
      sender: {
        name: 'Sarah Jenkins',
        email: 'sarah.j@signflow.ai',
        organization: tenant.organization,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      },
      status: 'draft',
      agreementType: determinedAgreementType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      tags: params.tags && params.tags.length > 0 ? params.tags : [isUnilateral ? 'Unilateral' : 'Custom Upload', 'Document'],
      documents: [
        {
          id: 'doc-' + generateUUID().slice(0, 6),
          name: params.file.name,
          size: params.file.size,
          fileType: params.file.fileType,
          sha256Hash: params.file.sha256Hash || generateFullSha256(),
          fileUrl: params.file.fileUrl,
          rawData: params.file.rawData,
          pages: params.file.pages && params.file.pages.length > 0 ? params.file.pages : [
            {
              pageNumber: 1,
              title: params.title || params.file.name,
              content: `### ${params.title || params.file.name}\n\nUploaded custom agreement document ready for signature block placement and routing.`
            }
          ]
        }
      ],
      attachments: [
        {
          id: 'att-doc-primary',
          name: params.file.name,
          size: params.file.size,
          fileType: params.file.fileType,
          sha256Hash: params.file.sha256Hash || generateFullSha256(),
          uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          uploadedBy: 'Sarah Jenkins',
          required: true,
          fileUrl: params.file.fileUrl,
          rawData: params.file.rawData,
          isPrimaryDocument: true
        }
      ],
      fields: recipientFields,
      recipients: finalRecipients,
      auditTrail: [
        {
          id: 'aud-' + generateUUID().slice(0, 6),
          timestamp: new Date().toISOString(),
          actor: 'Sarah Jenkins',
          action: isUnilateral ? 'Unilateral Document Uploaded' : 'Custom Document Uploaded',
          details: `Uploaded file "${params.file.name}" (${params.file.size}) configured for ${isUnilateral ? 'unilateral single signee' : `${finalRecipients.length} signers`} with SHA-256 hash ${params.file.sha256Hash.slice(0, 20)}...`,
          ipAddress: getMockIpAddress(),
          geo: 'San Francisco, CA, US',
          device: getMockDeviceFingerprint(),
          hashChainPrevious: 'ROOT_GENESIS_HASH',
          hashChainCurrent: generateFullSha256(),
          complianceTags: ['ESIGN', 'SOC2', 'eIDAS']
        }
      ]
    };

    setEnvelopes(prev => [newEnvelope, ...prev]);
    setActiveEnvelopeId(newEnvelope.id);
    setIsCreateEnvelopeModalOpen(false);
    setActiveView('prepare');
    notify('success', isUnilateral ? 'Unilateral Agreement Created' : 'Custom Document Uploaded', `Envelope "${newEnvelope.title}" created in Document Studio.`);
    return newEnvelope;
  };

  const createEnvelopeFromTemplate = (
    tmpl: Template,
    customData?: {
      title?: string;
      description?: string;
      recipients?: Recipient[];
      tags?: string[];
      agreementType?: 'unilateral' | 'bilateral' | 'multilateral';
    }
  ): Envelope => {
    const finalTitle = customData?.title?.trim() || `${tmpl.name} (from Template)`;
    const finalDescription = customData?.description?.trim() || tmpl.description;
    const finalTags = customData?.tags && customData.tags.length > 0 ? customData.tags : [tmpl.category, 'Template-Based'];

    // Map custom recipients or fallback to template default roles
    const recipientsList: Recipient[] = (customData?.recipients && customData.recipients.length > 0)
      ? customData.recipients
      : tmpl.roles.map((r, idx): Recipient => ({
          id: `rec-${idx + 1}`,
          name: r.roleName.includes('(') ? r.roleName.split('(')[0].trim() : r.roleName,
          email: idx === 0 ? 'sarah.j@signflow.ai' : `signer.${idx + 1}@counterparty.com`,
          role: 'signer',
          routingOrder: idx + 1,
          authType: r.defaultAuth || 'email',
          status: idx === 0 ? 'ready' : 'waiting'
        }));

    const isUnilateral = customData?.agreementType === 'unilateral' || tmpl.agreementType === 'unilateral' || recipientsList.length === 1;
    const determinedAgreementType: 'unilateral' | 'bilateral' | 'multilateral' = 
      customData?.agreementType || tmpl.agreementType || (recipientsList.length === 1 ? 'unilateral' : recipientsList.length === 2 ? 'bilateral' : 'multilateral');

    // Dynamically generate signature and date fields for each configured recipient
    const finalPageNum = tmpl.sampleDocument.pages?.length || 1;
    let recipientFields: DocumentField[] = [];

    if (isUnilateral) {
      const rec = recipientsList[0];
      recipientFields = [
        {
          id: 'fld-' + generateUUID().slice(0, 6),
          type: 'signature' as const,
          recipientId: rec.id,
          label: `${rec.name} Signature`,
          page: finalPageNum,
          x: 18,
          y: 74,
          width: 200,
          height: 50,
          required: true
        },
        {
          id: 'fld-' + generateUUID().slice(0, 6),
          type: 'date_signed' as const,
          recipientId: rec.id,
          label: 'Date Signed',
          page: finalPageNum,
          x: 62,
          y: 74,
          width: 130,
          height: 40,
          required: true
        },
        {
          id: 'fld-' + generateUUID().slice(0, 6),
          type: 'name' as const,
          recipientId: rec.id,
          label: 'Printed Name',
          page: finalPageNum,
          x: 18,
          y: 86,
          width: 200,
          height: 38,
          required: true
        }
      ];
    } else {
      recipientFields = recipientsList.flatMap((rec, idx) => [
        {
          id: 'fld-' + generateUUID().slice(0, 6),
          type: 'signature' as const,
          recipientId: rec.id,
          label: `${rec.name} Signature`,
          page: finalPageNum,
          x: (idx % 2 === 0) ? 12 : 55,
          y: 75 + Math.floor(idx / 2) * 12,
          width: 180,
          height: 50,
          required: true
        },
        {
          id: 'fld-' + generateUUID().slice(0, 6),
          type: 'date_signed' as const,
          recipientId: rec.id,
          label: `${rec.name} Date Signed`,
          page: finalPageNum,
          x: (idx % 2 === 0) ? 35 : 78,
          y: 75 + Math.floor(idx / 2) * 12,
          width: 140,
          height: 40,
          required: true
        }
      ]);
    }

    const newEnvelope: Envelope = {
      id: 'env-' + generateUUID().slice(0, 8),
      title: finalTitle,
      description: finalDescription,
      sender: {
        name: 'Sarah Jenkins',
        email: 'sarah.j@signflow.ai',
        organization: tenant.organization,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      },
      status: 'draft',
      agreementType: determinedAgreementType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      tags: isUnilateral && !finalTags.includes('Unilateral') ? ['Unilateral', ...finalTags] : finalTags,
      documents: [tmpl.sampleDocument],
      fields: recipientFields,
      recipients: recipientsList,
      auditTrail: [
        {
          id: 'aud-' + generateUUID().slice(0, 6),
          timestamp: new Date().toISOString(),
          actor: 'Sarah Jenkins',
          action: 'Template Blueprint Instantiated',
          details: `Loaded master template "${tmpl.name}" configured for ${isUnilateral ? 'unilateral execution (1 signer)' : `${recipientsList.length} signers`} (${recipientsList.map(r => `${r.name} <${r.email}>`).join(', ')})`,
          ipAddress: getMockIpAddress(),
          geo: 'San Francisco, CA, US',
          device: getMockDeviceFingerprint(),
          hashChainPrevious: 'ROOT_GENESIS_HASH',
          hashChainCurrent: generateFullSha256(),
          complianceTags: ['ESIGN', 'SOC2', 'eIDAS']
        }
      ]
    };

    setEnvelopes(prev => [newEnvelope, ...prev]);
    setActiveEnvelopeId(newEnvelope.id);
    setIsCreateEnvelopeModalOpen(false);
    setActiveView('prepare');
    notify('success', 'Envelope Created from Template', `Loaded "${finalTitle}" with ${recipientsList.length} configured signers.`);
    return newEnvelope;
  };

  return (
    <SignFlowContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        verifySignerAccess,
        envelopes,
        activeEnvelope,
        activeEnvelopeId,
        activeView,
        currentRole,
        environment,
        tenant,
        notifications,
        webhooks,
        webhookLogs,
        notarySessions,
        notaryJournal,
        selectedCertificateEnvelopeId,
        isCertificateModalOpen,
        closeCertificateView,
        isDbReady,
        dbStats,
        refreshDbStats,
        exportDbBackup,
        importDbBackup,
        resetDb,
        setActiveView,
        setActiveEnvelopeId,
        setCurrentRole,
        setEnvironment,
        updateTenantSettings,
        isCreateEnvelopeModalOpen,
        setIsCreateEnvelopeModalOpen,
        openCreateEnvelopeModal,
        closeCreateEnvelopeModal,
        createNewEnvelope,
        prepareNewEnvelope,
        createEnvelopeFromUpload,
        createEnvelopeFromTemplate,
        updateEnvelope,
        deleteEnvelope,
        sendEnvelope,
        voidEnvelope,
        addFieldToEnvelope,
        updateFieldInEnvelope,
        removeFieldFromEnvelope,
        runAISmartFieldPlacement,
        activeSigningRecipientId,
        setActiveSigningRecipientId,
        submitSignerSignature,
        openSigningSession,
        sendEnvelopeReminder,
        openCertificateView,
        unlockEnvelopeForRevision,
        recordTamperingAttempt,
        resendEnvelopeForSigning,
        runAIRiskScan,
        proposeClauseAmendment,
        resolveClauseAmendment,
        executeContractAutopilot,
        startNotarySession,
        affixNotarySeal,
        createWebhook,
        triggerMockWebhook,
        notify,
        dismissNotification,
        activeToasts,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        dismissToast,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications
      }}
    >
      {children}
    </SignFlowContext.Provider>
  );
};

export const useSignFlow = () => {
  const context = useContext(SignFlowContext);
  if (!context) {
    throw new Error('useSignFlow must be used within a SignFlowProvider');
  }
  return context;
};
