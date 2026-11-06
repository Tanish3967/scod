import { Envelope, DocumentField, ContractObligation, StructuredContractTerms } from '../types/signflow';
import { generateUUID } from './cryptoUtils';

/**
 * Extracts structured legal and commercial metadata from contract text and field values.
 */
export function extractStructuredTerms(
  documentText: string,
  fields: DocumentField[] = [],
  fallbackTotalValue?: number
): StructuredContractTerms {
  const text = documentText || '';

  // 1. Term Duration (months)
  let termMonths = 12; // default 1 year
  if (/(?:term of|for a period of)\s*(?:three|3)\s*(?:\(?3\)?\s*)?years?/i.test(text)) {
    termMonths = 36;
  } else if (/(?:term of|for a period of)\s*(?:two|2)\s*(?:\(?2\)?\s*)?years?/i.test(text)) {
    termMonths = 24;
  } else if (/(?:term of|for a period of)\s*(?:six|6)\s*(?:\(?6\)?\s*)?months?/i.test(text)) {
    termMonths = 6;
  } else if (/(?:term of|for a period of)\s*(?:five|5)\s*(?:\(?5\)?\s*)?years?/i.test(text)) {
    termMonths = 60;
  }

  // 2. Auto-Renewal Notice Window (days)
  let autoRenewWindowDays = 30; // default standard
  const renewalMatch = text.match(/(?:at least|minimum of)\s*(\d{1,3})\s*days?(?:\s*written)?\s*notice/i);
  if (renewalMatch && renewalMatch[1]) {
    autoRenewWindowDays = parseInt(renewalMatch[1], 10);
  } else if (/ninety\s*\(?90\)?\s*days/i.test(text)) {
    autoRenewWindowDays = 90;
  } else if (/sixty\s*\(?60\)?\s*days/i.test(text)) {
    autoRenewWindowDays = 60;
  }

  // 3. Governing Law & Jurisdiction
  let governingLaw = 'State of Delaware, US';
  if (/laws of (?:the State of )?California/i.test(text)) {
    governingLaw = 'State of California, US';
  } else if (/laws of (?:the State of )?New York/i.test(text)) {
    governingLaw = 'State of New York, US';
  } else if (/laws of (?:the State of )?Texas/i.test(text)) {
    governingLaw = 'State of Texas, US';
  } else if (/laws of England and Wales/i.test(text)) {
    governingLaw = 'England & Wales (UK)';
  } else if (/Federal Republic of Germany|laws of Germany/i.test(text)) {
    governingLaw = 'Germany (EU / eIDAS)';
  }

  // 4. Liability Cap Amount
  let liabilityCapUsd = 250000;
  if (/capped at total fees paid in the (?:prior|preceding)\s*twelve\s*\(?12\)?\s*months/i.test(text)) {
    liabilityCapUsd = 120000;
  } else if (/capped at \$?([0-9,]+)/i.test(text)) {
    const match = text.match(/capped at \$?([0-9,]+)/i);
    if (match && match[1]) {
      liabilityCapUsd = parseInt(match[1].replace(/,/g, ''), 10);
    }
  }

  // 5. Total Contract Value
  let totalValueUsd = fallbackTotalValue || 0;
  if (!totalValueUsd) {
    const paymentField = fields.find(f => f.type === 'payment' && f.paymentAmount);
    if (paymentField && paymentField.paymentAmount) {
      totalValueUsd = paymentField.paymentAmount;
    } else {
      const formulaTotalField = fields.find(f => f.fieldName === 'total_cost' || f.fieldName === 'total_price' || f.label.toLowerCase().includes('total'));
      if (formulaTotalField && formulaTotalField.value) {
        const parsed = parseFloat(String(formulaTotalField.value).replace(/[^0-9.-]+/g, ''));
        if (!isNaN(parsed) && parsed > 0) totalValueUsd = parsed;
      }
    }
  }
  if (!totalValueUsd) totalValueUsd = 125000; // sensible enterprise default

  // 6. Payment Terms
  let paymentTerms = 'Net 30 Days';
  if (/within fifteen\s*\(?15\)?\s*days/i.test(text) || /Net 15/i.test(text)) {
    paymentTerms = 'Net 15 Days';
  } else if (/within forty-five\s*\(?45\)?\s*days/i.test(text) || /Net 45/i.test(text)) {
    paymentTerms = 'Net 45 Days';
  } else if (/within sixty\s*\(?60\)?\s*days/i.test(text) || /Net 60/i.test(text)) {
    paymentTerms = 'Net 60 Days';
  } else if (/due immediately|due upon receipt/i.test(text)) {
    paymentTerms = 'Due Upon Receipt';
  }

  const effectiveDate = new Date().toISOString();

  return {
    effectiveDate,
    termMonths,
    autoRenewWindowDays,
    governingLaw,
    liabilityCapUsd,
    totalValueUsd,
    paymentTerms,
    counterparty: 'Authorized Signatory',
    keyObligationsSummary: [
      `Contract Term: ${termMonths} Months (${termMonths / 12} Year${termMonths > 12 ? 's' : ''})`,
      `Non-Renewal Notice Deadline: ${autoRenewWindowDays} Days prior to anniversary`,
      `Governing Jurisdiction: ${governingLaw}`,
      `Liability Cap: $${liabilityCapUsd.toLocaleString()}`,
      `Payment Terms: ${paymentTerms}`
    ],
    extractedAt: new Date().toISOString()
  };
}

/**
 * Automatically generates actionable ContractObligations when an envelope is signed & sealed.
 */
export function generateAutopilotObligations(
  envelope: Envelope,
  terms: StructuredContractTerms
): ContractObligation[] {
  const primarySigner = envelope.recipients.find(r => r.role === 'signer' || r.role === 'in_person') || envelope.recipients[0];
  const counterpartyName = primarySigner?.name || 'Counterparty';
  const counterpartyEmail = primarySigner?.email || 'counterparty@enterprise.com';

  const effectiveDate = terms.effectiveDate ? new Date(terms.effectiveDate) : new Date();
  
  // Calculate Expiration Date
  const expiryDate = new Date(effectiveDate);
  expiryDate.setMonth(expiryDate.getMonth() + (terms.termMonths || 12));

  // Calculate Renewal Notice Deadline
  const noticeDeadlineDate = new Date(expiryDate);
  noticeDeadlineDate.setDate(noticeDeadlineDate.getDate() - (terms.autoRenewWindowDays || 30));

  // Milestone 1 Date (30 days from signing)
  const milestone1Date = new Date(effectiveDate);
  milestone1Date.setDate(milestone1Date.getDate() + 30);

  // Milestone 2 Date (Mid-term audit 6 months)
  const auditDate = new Date(effectiveDate);
  auditDate.setMonth(auditDate.getMonth() + 6);

  const obligations: ContractObligation[] = [
    {
      id: 'obl-' + generateUUID().slice(0, 8),
      envelopeId: envelope.id,
      contractTitle: envelope.title,
      counterparty: counterpartyName,
      type: 'renewal_notice',
      title: `Contract Expiry & Renewal Notice Window (${terms.autoRenewWindowDays || 30}-Day Notice)`,
      description: `Contract auto-renews on ${expiryDate.toLocaleDateString()}. Written opt-out notice must be served by ${noticeDeadlineDate.toLocaleDateString()} to avoid binding extension.`,
      dueDate: expiryDate.toISOString(),
      noticeDeadline: noticeDeadlineDate.toISOString(),
      status: 'pending',
      assignee: 'General Counsel / Deal Lead',
      assigneeEmail: envelope.sender.email,
      financialValue: terms.totalValueUsd,
      governingClause: `Term & Renewal Clause (${terms.termMonths} Months)`,
      confidenceScore: 99,
      autoRenewal: true,
      renewalNoticeDays: terms.autoRenewWindowDays || 30,
      remindersSent: 0,
      isEscalated: false
    },
    {
      id: 'obl-' + generateUUID().slice(0, 8),
      envelopeId: envelope.id,
      contractTitle: envelope.title,
      counterparty: counterpartyName,
      type: 'payment_milestone',
      title: `Initial Invoicing & Milestone Settlement (${terms.paymentTerms || 'Net 30'})`,
      description: `Disbursement of initial contract installment ($${Math.round((terms.totalValueUsd || 100000) * 0.5).toLocaleString()}) in accordance with ${terms.paymentTerms}.`,
      dueDate: milestone1Date.toISOString(),
      status: 'pending',
      assignee: 'Finance & Accounts Receivable',
      assigneeEmail: envelope.sender.email,
      financialValue: Math.round((terms.totalValueUsd || 100000) * 0.5),
      governingClause: `Payment Terms (${terms.paymentTerms || 'Net 30'})`,
      confidenceScore: 96,
      autoRenewal: false,
      remindersSent: 0,
      isEscalated: false
    },
    {
      id: 'obl-' + generateUUID().slice(0, 8),
      envelopeId: envelope.id,
      contractTitle: envelope.title,
      counterparty: counterpartyName,
      type: 'audit_compliance',
      title: 'Mid-Term SOC 2 & Security Attestation Exchange',
      description: `Exchange annual SOC 2 Type II attestation, data processing annex verification, and liability compliance record with ${counterpartyName}.`,
      dueDate: auditDate.toISOString(),
      status: 'in_progress',
      assignee: 'Compliance & Security Officer',
      assigneeEmail: counterpartyEmail,
      financialValue: 0,
      governingClause: `Audit Rights & Security Compliance (${terms.governingLaw})`,
      confidenceScore: 94,
      autoRenewal: false,
      remindersSent: 0,
      isEscalated: false
    }
  ];

  return obligations;
}

/**
 * Builds rich Slack Block Kit webhook payload for celebration alerts upon contract execution.
 */
export function buildSlackWebhookPayload(
  envelope: Envelope,
  terms: StructuredContractTerms
): Record<string, any> {
  const primarySigner = envelope.recipients.find(r => r.role === 'signer') || envelope.recipients[0];
  const valueFormatted = (terms.totalValueUsd || 0).toLocaleString();

  return {
    text: `🎉 *Deal Closed & Executed: ${envelope.title}* ($${valueFormatted})`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚀 Deal Executed & Cryptographically Sealed',
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${envelope.title}* has been fully executed by all parties.\n*Contract Value:* $${valueFormatted} USD | *Term:* ${terms.termMonths || 12} Months | *Governing Law:* ${terms.governingLaw}`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Primary Signer:*\n${primarySigner?.name || 'Counterparty'} (${primarySigner?.email || ''})`
          },
          {
            type: 'mrkdwn',
            text: `*Envelope ID:*\n\`#${envelope.id.toUpperCase()}\``
          },
          {
            type: 'mrkdwn',
            text: `*Renewal Radar Armed:*\n${terms.autoRenewWindowDays || 30}-day non-renewal notification window`
          },
          {
            type: 'mrkdwn',
            text: `*Audit Ledger Hash:*\n\`${envelope.lockSealHash ? envelope.lockSealHash.slice(0, 16) + '...' : 'SHA256_SEALED'}\``
          }
        ]
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Audit Certificate',
              emoji: true
            },
            url: `http://localhost:5173/?cert=${envelope.id}`,
            style: 'primary'
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Open Obligation Radar',
              emoji: true
            },
            url: `http://localhost:5173/?view=obligations`
          }
        ]
      }
    ]
  };
}
