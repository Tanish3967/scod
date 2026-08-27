import React, { createContext, useContext, useState } from 'react';
import { 
  Envelope, 
  EnvelopeStatus, 
  DocumentField, 
  Recipient, 
  NotarySession, 
  NotaryJournalEntry, 
  WebhookEndpoint, 
  WebhookLog, 
  AuditEvent 
} from '../types/signflow';
import { INITIAL_ENVELOPES } from '../data/mockEnvelopes';
import { generateUUID, generateFullSha256, getMockIpAddress, getMockDeviceFingerprint, generateHmacSignature } from '../utils/cryptoUtils';
import { detectSmartFields, analyzeDocumentRisk } from '../utils/aiEngine';

export type AppView = 
  | 'dashboard'
  | 'envelopes'
  | 'prepare'
  | 'signing'
  | 'ai-hub'
  | 'notary'
  | 'templates'
  | 'powerforms'
  | 'certificate'
  | 'admin'
  | 'compliance';

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'ai';
  title: string;
  message: string;
  timestamp: string;
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

interface SignFlowContextType {
  envelopes: Envelope[];
  activeEnvelope: Envelope | null;
  activeEnvelopeId: string | null;
  activeView: AppView;
  currentRole: 'sender' | 'signer' | 'admin' | 'notary' | 'auditor';
  environment: 'production' | 'sandbox';
  tenant: TenantSettings;
  notifications: ToastNotification[];
  webhooks: WebhookEndpoint[];
  webhookLogs: WebhookLog[];
  notarySessions: NotarySession[];
  notaryJournal: NotaryJournalEntry[];
  selectedCertificateEnvelopeId: string | null;
  
  // Actions
  setActiveView: (view: AppView) => void;
  setActiveEnvelopeId: (id: string | null) => void;
  setCurrentRole: (role: 'sender' | 'signer' | 'admin' | 'notary' | 'auditor') => void;
  setEnvironment: (env: 'production' | 'sandbox') => void;
  updateTenantSettings: (settings: Partial<TenantSettings>) => void;
  
  // Envelope actions
  createNewEnvelope: (draftData?: Partial<Envelope>) => Envelope;
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
  submitSignerSignature: (envelopeId: string, recipientId: string, signatureData: Recipient['signatureData'], fieldValues: Record<string, string>) => void;
  openSigningSession: (envelopeId: string, recipientId?: string) => void;
  openCertificateView: (envelopeId: string) => void;
  
  // AI actions
  runAIRiskScan: (envelopeId: string) => void;
  
  // Notary actions
  startNotarySession: (sessionId: string) => void;
  affixNotarySeal: (sessionId: string, sealDetails: NotarySession['sealDetails']) => void;
  
  // Webhook actions
  createWebhook: (url: string, name: string, events: string[]) => void;
  triggerMockWebhook: (event: string, envelope: Envelope) => void;
  
  // Notification actions
  notify: (type: ToastNotification['type'], title: string, message: string) => void;
  dismissNotification: (id: string) => void;
}

const SignFlowContext = createContext<SignFlowContextType | undefined>(undefined);

export const SignFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [envelopes, setEnvelopes] = useState<Envelope[]>(INITIAL_ENVELOPES);
  const [activeEnvelopeId, setActiveEnvelopeId] = useState<string | null>('env-msa-8921');
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [currentRole, setCurrentRole] = useState<'sender' | 'signer' | 'admin' | 'notary' | 'auditor'>('sender');
  const [environment, setEnvironment] = useState<'production' | 'sandbox'>('production');
  const [selectedCertificateEnvelopeId, setSelectedCertificateEnvelopeId] = useState<string | null>(null);

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

  const [notifications, setNotifications] = useState<ToastNotification[]>([
    {
      id: 'notif-1',
      type: 'ai',
      title: 'AI Smart Detection Ready',
      message: 'Detected 4 required signature blanks on Master Services Agreement #104',
      timestamp: 'Just now'
    },
    {
      id: 'notif-2',
      type: 'info',
      title: 'Audit Anchor Confirmed',
      message: 'SHA-256 hash-chain synced with immutable compliance ledger',
      timestamp: '5m ago'
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

  const activeEnvelope = envelopes.find(e => e.id === activeEnvelopeId) || envelopes[0] || null;

  const notify = (type: ToastNotification['type'], title: string, message: string) => {
    const newNotif: ToastNotification = {
      id: generateUUID(),
      type,
      title,
      message,
      timestamp: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updateTenantSettings = (settings: Partial<TenantSettings>) => {
    setTenant(prev => ({ ...prev, ...settings }));
    notify('success', 'Tenant Branding Updated', 'Custom styling and compliance settings applied.');
  };

  const triggerMockWebhook = (event: string, envelope: Envelope) => {
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
          documentSha256: envelope.documents[0]?.sha256Hash
        }
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

  const deleteEnvelope = (id: string) => {
    setEnvelopes(prev => prev.filter(e => e.id !== id));
    if (activeEnvelopeId === id) {
      const remaining = envelopes.filter(e => e.id !== id);
      setActiveEnvelopeId(remaining[0]?.id || null);
      setActiveView('envelopes');
    }
    notify('info', 'Envelope Deleted', 'Envelope was removed from workspace.');
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

    const allSigned = updatedRecipients.every(r => r.role !== 'signer' || r.status === 'signed');
    const newStatus: EnvelopeStatus = allSigned ? 'completed' : 'signed';

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

    const signingAudit: AuditEvent = {
      id: 'aud-' + generateUUID().slice(0, 6),
      timestamp: now,
      actor: updatedRecipients.find(r => r.id === recipientId)?.name || 'Signer',
      action: 'Document Signed & Cryptographically Sealed',
      details: `Signature applied (${signatureData?.type}) with SHA-256 document binding and consent verification`,
      ipAddress: signatureData?.ipAddress || getMockIpAddress(),
      geo: 'San Francisco, CA, US',
      device: signatureData?.deviceFingerprint || getMockDeviceFingerprint(),
      hashChainPrevious: env.auditTrail[env.auditTrail.length - 1]?.hashChainCurrent || 'GENESIS_0',
      hashChainCurrent: generateFullSha256(),
      complianceTags: ['ESIGN', 'eIDAS', '21CFR11', 'SOC2']
    };

    let completionAudit: AuditEvent | null = null;
    if (allSigned) {
      completionAudit = {
        id: 'aud-' + generateUUID().slice(0, 6),
        timestamp: now,
        actor: 'SignFlow Trust Engine',
        action: 'Envelope Completed & Certificate Generated',
        details: 'All required parties signed. Immutable PDF archive and Certificate of Completion created.',
        ipAddress: '10.0.0.1 (SignFlow Core Vault)',
        geo: 'AWS us-east-1 (Delaware Region)',
        device: 'SignFlow-Engine-v4',
        hashChainPrevious: signingAudit.hashChainCurrent,
        hashChainCurrent: generateFullSha256(),
        complianceTags: ['ESIGN', 'eIDAS', '21CFR11', 'SOC2']
      };
    }

    const newAuditTrail = completionAudit 
      ? [...env.auditTrail, signingAudit, completionAudit] 
      : [...env.auditTrail, signingAudit];

    const updatedEnv: Envelope = {
      ...env,
      status: newStatus,
      completedAt: allSigned ? now : env.completedAt,
      recipients: updatedRecipients,
      fields: updatedFields,
      auditTrail: newAuditTrail,
      updatedAt: now
    };

    setEnvelopes(prev => prev.map(e => e.id === envelopeId ? updatedEnv : e));
    triggerMockWebhook(allSigned ? 'envelope.completed' : 'envelope.signed', updatedEnv);
    notify('success', allSigned ? 'Agreement Fully Completed!' : 'Signature Submitted', allSigned ? 'All parties have signed. Tamper-evident Certificate of Completion generated!' : 'Your signature has been registered and verified.');
  };

  const openSigningSession = (envelopeId: string) => {
    setActiveEnvelopeId(envelopeId);
    setActiveView('signing');
  };

  const openCertificateView = (envelopeId: string) => {
    setSelectedCertificateEnvelopeId(envelopeId);
    setActiveView('certificate');
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

  return (
    <SignFlowContext.Provider
      value={{
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
        setActiveView,
        setActiveEnvelopeId,
        setCurrentRole,
        setEnvironment,
        updateTenantSettings,
        createNewEnvelope,
        updateEnvelope,
        deleteEnvelope,
        sendEnvelope,
        voidEnvelope,
        addFieldToEnvelope,
        updateFieldInEnvelope,
        removeFieldFromEnvelope,
        runAISmartFieldPlacement,
        submitSignerSignature,
        openSigningSession,
        openCertificateView,
        runAIRiskScan,
        startNotarySession,
        affixNotarySeal,
        createWebhook,
        triggerMockWebhook,
        notify,
        dismissNotification
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
