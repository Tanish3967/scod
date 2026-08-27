export type EnvelopeStatus = 
  | 'draft' 
  | 'sent' 
  | 'delivered' 
  | 'viewed' 
  | 'signed' 
  | 'completed' 
  | 'declined' 
  | 'voided' 
  | 'expired';

export type RecipientRole = 
  | 'signer' 
  | 'approver' 
  | 'cc' 
  | 'in_person' 
  | 'certified_delivery' 
  | 'editor';

export type AuthType = 
  | 'email' 
  | 'access_code' 
  | 'sms_otp' 
  | 'kba' 
  | 'idv_biometric';

export type FieldType = 
  | 'signature' 
  | 'initial' 
  | 'date_signed' 
  | 'name' 
  | 'email' 
  | 'text' 
  | 'checkbox' 
  | 'radio' 
  | 'dropdown' 
  | 'attachment' 
  | 'payment' 
  | 'formula' 
  | 'stamp';

export interface DocumentField {
  id: string;
  type: FieldType;
  label: string;
  recipientId: string;
  page: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number;
  height: number;
  required: boolean;
  value?: string;
  options?: string[]; // for dropdown or radio
  paymentAmount?: number;
  currency?: string;
  formulaExpression?: string;
  aiSuggested?: boolean;
  aiConfidence?: number;
}

export interface Recipient {
  id: string;
  name: string;
  email: string;
  role: RecipientRole;
  routingOrder: number;
  authType: AuthType;
  accessCode?: string;
  phoneNumber?: string;
  status: 'waiting' | 'ready' | 'viewed' | 'signed' | 'declined';
  declinedReason?: string;
  signedAt?: string;
  signatureData?: {
    type: 'draw' | 'type' | 'upload';
    value: string; // dataUrl or font name + text
    fontFamily?: string;
    appliedAt: string;
    ipAddress: string;
    deviceFingerprint: string;
  };
  idvVerification?: {
    provider: string;
    verified: boolean;
    livenessScore: number;
    documentType: 'Passport' | 'Drivers_License' | 'National_ID';
    timestamp: string;
    idvRecordId: string;
  };
}

export interface DocumentPage {
  pageNumber: number;
  title: string;
  content: string; // rich text or formatted markdown
  rawHtml?: string;
}

export interface AgreementDocument {
  id: string;
  name: string;
  size: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'png';
  sha256Hash: string;
  pages: DocumentPage[];
}

export interface Envelope {
  id: string;
  title: string;
  description?: string;
  sender: {
    name: string;
    email: string;
    organization: string;
    avatarUrl?: string;
  };
  status: EnvelopeStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  completedAt?: string;
  documents: AgreementDocument[];
  fields: DocumentField[];
  recipients: Recipient[];
  tags: string[];
  requiresNotary?: boolean;
  notarySessionId?: string;
  requiresPayment?: boolean;
  totalPaymentAmount?: number;
  auditTrail: AuditEvent[];
  aiAnalysis?: AIRiskAnalysis;
  extractedObligations?: ObligationItem[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  ipAddress: string;
  geo: string;
  device: string;
  hashChainPrevious: string;
  hashChainCurrent: string;
  complianceTags: ('ESIGN' | 'eIDAS' | '21CFR11' | 'SOC2')[];
}

export interface AIRiskFinding {
  id: string;
  clauseName: string;
  riskType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
  playbookStandard: string;
  recommendedEdit: string;
  pageNumber: number;
  lineReference: string;
  status: 'flagged' | 'accepted' | 'ignored';
}

export interface AIRiskAnalysis {
  overallScore: number; // 0 - 100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  playbookGrade: 'A' | 'B' | 'C' | 'F';
  analyzedAt: string;
  modelVersion: string;
  guardrailPassed: boolean;
  findings: AIRiskFinding[];
}

export interface ObligationItem {
  id: string;
  title: string;
  type: 'renewal' | 'payment' | 'compliance' | 'deliverable' | 'termination_notice';
  dueDate: string;
  responsibleParty: string;
  amount?: string;
  clauseReference: string;
  status: 'active' | 'upcoming' | 'overdue' | 'completed';
  autoReminder: boolean;
}

export interface AIDraftClauseSuggestion {
  id: string;
  title: string;
  category: string;
  sourceTemplate: string;
  sourceCitation: string;
  originalText: string;
  suggestedText: string;
  status: 'suggested' | 'accepted' | 'rejected';
}

export interface AIDraftState {
  prompt: string;
  agreementType: string;
  jurisdiction: string;
  effectiveTerm: string;
  clauses: AIDraftClauseSuggestion[];
  fullDraftContent: string;
}

export interface NotarySession {
  id: string;
  envelopeId: string;
  notaryName: string;
  commissionNumber: string;
  jurisdiction: string;
  status: 'waiting' | 'in_session' | 'verified' | 'seal_affixed' | 'completed';
  scheduledTime: string;
  signerConnected: boolean;
  notaryConnected: boolean;
  sealDetails: {
    notaryPublicName: string;
    county: string;
    state: string;
    commissionExpires: string;
    sealUrl?: string;
    sealAffixedAt?: string;
  };
  journalEntryId: string;
}

export interface NotaryJournalEntry {
  id: string;
  timestamp: string;
  documentTitle: string;
  signerName: string;
  signerEmail: string;
  idvMethod: string;
  idvProofCode: string;
  notarialAct: 'Acknowledgment' | 'Jurat' | 'Certified Copy' | 'Oath';
  fee: string;
  recordingArchiveId: string;
  notarySignatureHash: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'Sales' | 'HR & Hiring' | 'Legal & Corporate' | 'Finance' | 'Procurement';
  usageCount: number;
  lastUsed: string;
  roles: { roleName: string; description: string; defaultAuth: AuthType }[];
  defaultFieldsCount: number;
  sampleDocument: AgreementDocument;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  name: string;
  events: string[];
  secretKey: string;
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  lastStatus?: number;
}

export interface WebhookLog {
  id: string;
  endpointId: string;
  event: string;
  timestamp: string;
  durationMs: number;
  statusCode: number;
  payload: Record<string, unknown>;
  signatureHmac: string;
}
