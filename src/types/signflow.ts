export type EnvelopeStatus = 
  | 'draft' 
  | 'sent' 
  | 'delivered' 
  | 'viewed' 
  | 'signed' 
  | 'partially_signed'
  | 'completed' 
  | 'declined' 
  | 'voided' 
  | 'expired'
  | 'in_revision';

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
  | 'idv_biometric'
  | 'passkey_webauthn';

export type FieldType = 
  | 'signature' 
  | 'initial' 
  | 'date_signed' 
  | 'name' 
  | 'email' 
  | 'text' 
  | 'number'
  | 'checkbox' 
  | 'radio' 
  | 'dropdown' 
  | 'attachment' 
  | 'payment' 
  | 'formula' 
  | 'stamp';

export type ConditionalOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'greater_than' 
  | 'less_than' 
  | 'is_checked' 
  | 'is_not_checked' 
  | 'contains';

export type ConditionalAction = 'show' | 'hide' | 'require';

export interface ConditionalRule {
  id: string;
  triggerFieldId: string;
  operator: ConditionalOperator;
  triggerValue: string;
  action: ConditionalAction;
}

export interface DocumentField {
  id: string;
  fieldName?: string; // programmatic identifier e.g. unit_price, total_cost
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
  defaultValue?: string;
  placeholder?: string;
  options?: string[]; // for dropdown or radio
  paymentAmount?: number;
  currency?: string;
  formulaExpression?: string; // e.g. "[qty] * [unit_price] * (1 + [tax_rate])"
  calculationFormula?: string;
  numberFormat?: 'currency' | 'percent' | 'integer' | 'decimal';
  isReadOnlyCalculated?: boolean;
  conditionalRules?: ConditionalRule[];
  customSignature?: CustomSignature;
  aiSuggested?: boolean;
  aiConfidence?: number;
}

export interface PowerFormConfig {
  id: string;
  envelopeId: string;
  title: string;
  description: string;
  isActive: boolean;
  requireEmailVerification: boolean;
  maxSubmissions?: number;
  submissionCount: number;
  redirectUrl?: string;
  customThemeColor?: string;
  accessPasscode?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ObligationType = 
  | 'renewal_notice' 
  | 'payment_milestone' 
  | 'sla_performance' 
  | 'deliverable' 
  | 'audit_compliance' 
  | 'insurance_renewal' 
  | 'termination_window';

export type ObligationStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'fulfilled' 
  | 'at_risk' 
  | 'breached';

export interface ContractObligation {
  id: string;
  envelopeId: string;
  contractTitle: string;
  counterparty: string;
  type: ObligationType;
  title: string;
  description: string;
  dueDate: string;
  noticeDeadline?: string; // e.g. 60 days before auto-renewal
  status: ObligationStatus;
  assignee: string;
  assigneeEmail?: string;
  financialValue?: number;
  governingClause?: string;
  confidenceScore: number;
  autoRenewal: boolean;
  renewalNoticeDays?: number; // e.g. 60
  remindersSent?: number;
  lastReminderAt?: string;
  isEscalated?: boolean;
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
    type: 'draw' | 'type' | 'upload' | 'stamp' | 'passkey';
    value: string; // dataUrl or font name + text
    fontFamily?: string;
    appliedAt: string;
    ipAddress: string;
    deviceFingerprint: string;
    passkeyDetails?: {
      credentialId: string;
      aaguid?: string;
      authenticatorName: string;
      hardwareEnclave: string;
      signatureAlgorithm: string;
      authTimestamp: string;
      securityLevel: 'AAL3_Hardware_Backed' | 'FIDO2_L2';
    };
  };
  idvVerification?: {
    provider: string;
    verified: boolean;
    livenessScore: number;
    documentType: 'Passport' | 'Drivers_License' | 'National_ID';
    timestamp: string;
    idvRecordId: string;
  };
  passkeyAuth?: {
    credentialId: string;
    authenticatorType: string;
    verifiedAt: string;
  };
}

export interface DocumentPage {
  pageNumber: number;
  title: string;
  content: string; // rich text or formatted markdown
  rawHtml?: string;
  imageUrl?: string;
}

export interface AgreementDocument {
  id: string;
  name: string;
  size: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'png' | 'txt';
  sha256Hash: string;
  fileUrl?: string;
  rawData?: string;
  pages: DocumentPage[];
}

export interface EnvelopeAttachment {
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
  isLocked?: boolean;
  lockedAt?: string;
  lockSealHash?: string;
  certificateAppended?: boolean;
  version?: number;
  documents: AgreementDocument[];
  attachments?: EnvelopeAttachment[];
  fields: DocumentField[];
  recipients: Recipient[];
  tags: string[];
  agreementType?: 'unilateral' | 'bilateral' | 'multilateral';
  requiresNotary?: boolean;
  notarySessionId?: string;
  requiresPayment?: boolean;
  totalPaymentAmount?: number;
  auditTrail: AuditEvent[];
  aiAnalysis?: AIRiskAnalysis;
  extractedObligations?: ObligationItem[];
  negotiationAmendments?: NegotiationAmendment[];
  structuredTerms?: StructuredContractTerms;
  dynamicSchedules?: DynamicScheduleInjection[];
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
  agreementType?: 'unilateral' | 'bilateral' | 'multilateral';
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

export interface CustomSignature {
  id: string;
  name: string;
  type: 'draw' | 'type' | 'upload' | 'stamp' | 'passkey';
  value: string; // Data URL or text string
  fontFamily?: string;
  inkColor?: string;
  initials?: string;
  isDefault?: boolean;
  createdAt: string;
  passkeyDetails?: {
    credentialId: string;
    authenticatorName: string;
    hardwareEnclave: string;
    signatureAlgorithm: string;
    verifiedAt: string;
    securityLevel: string;
  };
}

// Multi-Agent Collaborative Drafting Engine Interfaces (5 to 50+ Pages)
export interface DraftingSharedMemory {
  blueprint: {
    agreementTitle: string;
    agreementType: string;
    targetPageCount: number;
    estimatedWordCount: number;
    governingLaw: string;
    parties: { role: string; name: string; entityType: string }[];
    effectiveDate: string;
  };
  definedTerms: Record<string, { definition: string; introducedInSectionId: string }>;
  crossReferences: Record<string, { sectionNumber: string; title: string; summary: string }>;
  sections: Array<{
    id: string;
    sectionNumber: string;
    title: string;
    targetPages: number;
    targetWordCount: number;
    status: 'pending' | 'drafting' | 'completed' | 'verified';
    summary: string;
    generatedContent?: string;
  }>;
  styleGuardrails: {
    numberingScheme: 'decimal' | 'roman_articles' | 'alphanumeric';
    clauseDepth: 'deep_enterprise' | 'standard';
    tone: 'balanced' | 'pro_customer' | 'pro_vendor';
    prohibitSummaries: boolean;
  };
}

export interface ContextEnvelope {
  sectionId: string;
  sectionNumber: string;
  sectionTitle: string;
  targetPages: number;
  targetWords: number;
  parties: string[];
  governingLaw: string;
  relevantTerms: Record<string, string>;
  availableCrossRefs: Record<string, string>;
  precedingSectionBridge: string;
  mandatoryClauses: string[];
}

export interface AgentExecutionStep {
  agentId: 'orchestrator' | 'pattern_enforcer' | 'section_drafter' | 'layout_agent' | 'compiler' | 'verifier';
  agentName: string;
  status: 'idle' | 'active' | 'completed' | 'error';
  message: string;
  progressPercent: number;
  timestamp: string;
  detail?: string;
}

export interface VerificationQualityCertificate {
  certificateId: string;
  issuedAt: string;
  overallScore: number; // 0-100
  complianceGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  targetPagesRequested: number;
  actualPagesGenerated: number;
  totalWordCount: number;
  crossReferencesChecked: number;
  crossReferencesValid: number;
  definedTermsTracked: number;
  riskFindingsCount: number;
  isCertified: boolean;
  auditorNotes: string[];
}

export interface MultiAgentDraftResult {
  title: string;
  agreementType: string;
  targetPages: number;
  totalPages: number;
  totalWordCount: number;
  pages: DocumentPage[];
  tableOfContents: { sectionNumber: string; title: string; pageNumber: number }[];
  sharedMemory: DraftingSharedMemory;
  verification: VerificationQualityCertificate;
  executionLogs: AgentExecutionStep[];
}

// ==========================================
// DOCUSIGN DIFFERENTIATION 5 PILLARS TYPES
// ==========================================

// Pillar 1: In-Ceremony Live Clause Negotiation
export interface NegotiationAmendment {
  id: string;
  envelopeId: string;
  clauseId?: string;
  sectionTitle: string;
  proposerRecipientId: string;
  proposerName: string;
  originalText: string;
  proposedText: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'countered';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  playbookCompromiseUsed?: boolean;
}

// Pillar 2: Living Smart Contracts & Dynamic Assembly
export interface DynamicScheduleInjection {
  id: string;
  triggerFieldId: string;
  triggerValue: any;
  scheduleTitle: string;
  scheduleContent: string;
  schedulePageNumber?: number;
  injectedFields?: DocumentField[];
}

// Pillar 3: Post-Signature Contract Autopilot
export interface StructuredContractTerms {
  effectiveDate?: string;
  termMonths?: number;
  autoRenewWindowDays?: number;
  governingLaw?: string;
  liabilityCapUsd?: number;
  totalValueUsd?: number;
  paymentTerms?: string;
  counterparty?: string;
  keyObligationsSummary?: string[];
  extractedAt?: string;
}

// Pillar 4: Signer Guardian Angel Findings
export interface SignerGuardianFinding {
  id: string;
  category: 'uncapped_liability' | 'predatory_renewal' | 'asymmetric_indemnity' | 'broad_ip' | 'remote_jurisdiction' | 'hidden_penalty';
  title: string;
  severity: 'high' | 'medium' | 'critical';
  excerpt: string;
  explanation: string;
  plainEnglishRisk: string;
  recommendedCompromise: string;
  clauseReference: string;
}

export interface SignerGuardianReport {
  fairnessScore: number; // 0 - 100
  fairnessGrade: 'A' | 'B' | 'C' | 'F';
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  benchmarkComparison: string;
  findings: SignerGuardianFinding[];
  analyzedAt: string;
}

// Pillar 5: Zero-Trust Standalone Proof Bundle (.proof.json)
export interface ZeroTrustProofBundle {
  schemaVersion: 'signflow.pki.v1';
  envelopeId: string;
  envelopeTitle: string;
  organization: string;
  documentSha256: string;
  merkleRootHash: string;
  leafNodes: {
    index: number;
    type: 'document_page' | 'signature_evidence' | 'certificate_ledger';
    identifier: string;
    sha256Hash: string;
  }[];
  actorSignatures: {
    recipientId: string;
    name: string;
    email: string;
    role: string;
    status: string;
    appliedAt: string;
    ipAddress: string;
    deviceFingerprint: string;
    authType: string;
    signatureType: string;
    passkeyDetails?: Record<string, any>;
  }[];
  hashChain: {
    step: number;
    action: string;
    actor: string;
    timestamp: string;
    previousHash: string;
    currentHash: string;
  }[];
  completedAt: string;
  tamperProofVerificationCode: string;
}


