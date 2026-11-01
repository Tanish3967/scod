import { ContractObligation, Envelope, ObligationType, ObligationStatus } from '../types/signflow';
import { generateUUID } from './cryptoUtils';

export const INITIAL_OBLIGATIONS: ContractObligation[] = [
  {
    id: 'obl-001',
    envelopeId: 'env-msa-8921',
    contractTitle: 'NDA – Acme & Globex Corp.',
    counterparty: 'Globex Corporation',
    type: 'renewal_notice',
    title: 'Mutual NDA Term Renewal & Notice Window',
    description: 'Agreement auto-renews for 2 successive years unless 60 days written notice is served before anniversary.',
    dueDate: '2026-11-20T00:00:00.000Z',
    noticeDeadline: '2026-09-21T00:00:00.000Z',
    status: 'at_risk',
    assignee: 'Sarah Jenkins (General Counsel)',
    assigneeEmail: 's.jenkins@signflow-enterprise.com',
    financialValue: 0,
    governingClause: 'Section 4.2 (Term & Termination Window)',
    confidenceScore: 98,
    autoRenewal: true,
    renewalNoticeDays: 60,
    remindersSent: 2,
    lastReminderAt: '2026-09-08T14:30:00.000Z',
    isEscalated: true
  },
  {
    id: 'obl-002',
    envelopeId: 'env-ron-7109',
    contractTitle: 'MSA – Enterprise Cloud Services Agreement',
    counterparty: 'Vance Capital Partners',
    type: 'payment_milestone',
    title: 'Phase II Milestone Payment ($125,000)',
    description: 'Release of Phase 2 milestone billing upon UAT sign-off and SOC2 Type II compliance attestation delivery.',
    dueDate: '2026-10-15T00:00:00.000Z',
    status: 'pending',
    assignee: 'Marcus Vance (VP Finance)',
    assigneeEmail: 'm.vance@vancecap.com',
    financialValue: 125000,
    governingClause: 'Exhibit B (Fee Schedule & Milestone Deliverables)',
    confidenceScore: 95,
    autoRenewal: false,
    remindersSent: 1,
    isEscalated: false
  },
  {
    id: 'obl-003',
    envelopeId: 'env-qes-9941',
    contractTitle: 'Commercial Lease Agreement – Austin HQ',
    counterparty: 'Austin Commercial Realty LP',
    type: 'insurance_renewal',
    title: 'Commercial General Liability Certificate Renewal ($5M)',
    description: 'Tenant must submit active ACORD 25 Certificate of Insurance naming Landlord as additional insured.',
    dueDate: '2026-10-01T00:00:00.000Z',
    noticeDeadline: '2026-09-15T00:00:00.000Z',
    status: 'at_risk',
    assignee: 'David Sterling (Real Estate Director)',
    assigneeEmail: 'd.sterling@acme.com',
    financialValue: 480000,
    governingClause: 'Section 11.4 (Mandatory Insurance Endorsement)',
    confidenceScore: 92,
    autoRenewal: true,
    renewalNoticeDays: 30,
    remindersSent: 3,
    isEscalated: true
  },
  {
    id: 'obl-004',
    envelopeId: 'env-msa-8921',
    contractTitle: 'NDA – Acme & Globex Corp.',
    counterparty: 'Globex Corporation',
    type: 'deliverable',
    title: 'Quarterly Confidentiality Compliance Audit',
    description: 'Submit written confirmation that all proprietary source blueprints remain encrypted under FIPS-140-2 enclaves.',
    dueDate: '2026-12-31T00:00:00.000Z',
    status: 'in_progress',
    assignee: 'Elena Rostova (Compliance Officer)',
    assigneeEmail: 'elena.rostova@globex.io',
    financialValue: 0,
    governingClause: 'Section 8.1 (Audit Rights & Verification)',
    confidenceScore: 89,
    autoRenewal: false,
    remindersSent: 0,
    isEscalated: false
  },
  {
    id: 'obl-005',
    envelopeId: 'env-ron-7109',
    contractTitle: 'MSA – Enterprise Cloud Services Agreement',
    counterparty: 'Vance Capital Partners',
    type: 'sla_performance',
    title: 'Quarterly Uptime Guarantee (99.95% Availability)',
    description: 'Provide monthly SLA performance report. Uptime below 99.95% triggers automatic 10% invoice service credit.',
    dueDate: '2026-09-30T00:00:00.000Z',
    status: 'fulfilled',
    assignee: 'Alex Chen (Site Reliability Lead)',
    assigneeEmail: 'a.chen@signflow-enterprise.com',
    financialValue: 15000,
    governingClause: 'Service Level Schedule 1 (Uptime & Penalty Matrix)',
    confidenceScore: 97,
    autoRenewal: false,
    remindersSent: 1,
    isEscalated: false
  }
];

/**
 * Extracts obligations from an envelope using AI legal intelligence pattern matching
 */
export function extractObligationsFromEnvelope(envelope: Envelope): ContractObligation[] {
  const obligations: ContractObligation[] = [];
  const counterpartyName = envelope.recipients.find(r => r.role === 'signer')?.name || 'Counterparty';

  // 1. Auto-Renewal Obligation Check
  const hasAutoRenewal = envelope.title.toLowerCase().includes('nda') || 
                         envelope.title.toLowerCase().includes('msa') || 
                         envelope.title.toLowerCase().includes('lease');

  if (hasAutoRenewal) {
    const today = new Date();
    const expiry = new Date(today.setFullYear(today.getFullYear() + 1));
    const noticeDays = 60;
    const noticeDate = new Date(expiry.getTime() - noticeDays * 24 * 60 * 60 * 1000);

    obligations.push({
      id: 'obl-' + generateUUID().slice(0, 8),
      envelopeId: envelope.id,
      contractTitle: envelope.title,
      counterparty: counterpartyName,
      type: 'renewal_notice',
      title: `${envelope.title} Annual Renewal & Non-Renewal Notice Window`,
      description: `Contract contains automatic renewal clause. Written non-renewal notice must be delivered at least ${noticeDays} days prior to expiration.`,
      dueDate: expiry.toISOString(),
      noticeDeadline: noticeDate.toISOString(),
      status: 'pending',
      assignee: envelope.sender.name,
      assigneeEmail: envelope.sender.email,
      financialValue: 50000,
      governingClause: 'Section 4 (Term, Renewal & Opt-Out Notice)',
      confidenceScore: 94,
      autoRenewal: true,
      renewalNoticeDays: noticeDays,
      remindersSent: 0,
      isEscalated: false
    });
  }

  // 2. Deliverable / Final Execution Confirmation
  obligations.push({
    id: 'obl-' + generateUUID().slice(0, 8),
    envelopeId: envelope.id,
    contractTitle: envelope.title,
    counterparty: counterpartyName,
    type: 'deliverable',
    title: 'Counterparty Executed Certificate Archive',
    description: 'Ensure sealed Certificate of Completion and Merkle proof receipt is archived in enterprise contract repository.',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: envelope.status === 'completed' ? 'fulfilled' : 'in_progress',
    assignee: envelope.sender.name,
    assigneeEmail: envelope.sender.email,
    financialValue: 0,
    governingClause: 'Closing Deliverables',
    confidenceScore: 99,
    autoRenewal: false,
    remindersSent: 0,
    isEscalated: false
  });

  return obligations;
}
