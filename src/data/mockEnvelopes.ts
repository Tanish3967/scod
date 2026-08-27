import { Envelope } from '../types/signflow';
import { generateFullSha256 } from '../utils/cryptoUtils';

export const INITIAL_ENVELOPES: Envelope[] = [
  {
    id: 'env-msa-8921',
    title: 'Master Services Agreement & SOW #104',
    description: 'Enterprise consulting and software architecture agreement with Acme Corp.',
    sender: {
      name: 'Sarah Jenkins',
      email: 'sarah.j@signflow.ai',
      organization: 'SignFlow Enterprise Cloud',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    status: 'sent',
    createdAt: '2026-08-26T10:15:00Z',
    updatedAt: '2026-08-27T08:30:00Z',
    expiresAt: '2026-09-25T23:59:59Z',
    tags: ['Enterprise', 'Sales', 'High-Value'],
    requiresPayment: false,
    documents: [
      {
        id: 'doc-msa-01',
        name: 'Master_Services_Agreement_2026.pdf',
        size: '1.8 MB',
        fileType: 'pdf',
        sha256Hash: 'a89f71c4801e08db917c9d74944d18ec06f6ae9b6e3f225bb9d06bcf44e05412',
        pages: [
          {
            pageNumber: 1,
            title: '1. Purpose & Scope of Services',
            content: `### MASTER SERVICES AGREEMENT (MSA)

This Master Services Agreement ("Agreement") is made and entered into as of August 26, 2026 ("Effective Date"), by and between **SignFlow Technologies Inc.**, a Delaware corporation ("Provider"), and **Acme Global Enterprises Inc.**, a Delaware corporation ("Client").

#### 1. SERVICES AND STATEMENTS OF WORK
Provider shall provide the software engineering, technical advisory, and implementation services described in one or more Statements of Work ("SOW") executed by the parties. Each SOW shall be subject to the terms and conditions set forth in this Master Agreement.

#### 2. FEES, INVOICING AND EXPENSES
Client agrees to pay all undisputed invoices within thirty (30) days of receipt ("Net 30"). Invoices not paid within forty-five (45) days shall accrue interest at the rate of 1.5% per month or the highest rate permitted by law.

#### 3. INTELLECTUAL PROPERTY RIGHTS
Client shall own all Deliverables explicitly identified as "Work Product" in an applicable SOW upon receipt of full payment. Provider retains sole ownership of all pre-existing software, developer tooling, background IP, and general algorithms.`
          },
          {
            pageNumber: 2,
            title: '2. Liability, Indemnity & Execution',
            content: `#### 4. LIMITATION OF LIABILITY
EXCEPT FOR WILLFUL MISCONDUCT OR BREACHES OF CONFIDENTIALITY, IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.

THE AGGREGATE CUMULATIVE LIABILITY OF EITHER PARTY ARISING OUT OF OR RELATED TO THIS AGREEMENT SHALL BE STRICTLY CAPPED AT THE TOTAL FEES PAID BY CLIENT IN THE TWELVE (12) MONTHS PRECEDING THE APPLICABLE CLAIM.

#### 5. GOVERNING LAW & JURISDICTION
This Agreement shall be governed by the laws of the State of Delaware. Any dispute shall be submitted to the exclusive jurisdiction of the state and federal courts in Wilmington, Delaware.

---

### IN WITNESS WHEREOF, the parties hereto have executed this Master Services Agreement as of the Effective Date.`
          }
        ]
      }
    ],
    fields: [
      {
        id: 'fld-101',
        type: 'signature',
        label: 'Client Authorized Signature',
        recipientId: 'rec-client-01',
        page: 2,
        x: 10,
        y: 72,
        width: 38,
        height: 10,
        required: true,
        aiSuggested: true,
        aiConfidence: 0.98
      },
      {
        id: 'fld-102',
        type: 'date_signed',
        label: 'Date Signed',
        recipientId: 'rec-client-01',
        page: 2,
        x: 55,
        y: 72,
        width: 35,
        height: 8,
        required: true,
        aiSuggested: true,
        aiConfidence: 0.95
      },
      {
        id: 'fld-103',
        type: 'name',
        label: 'Signer Full Name',
        recipientId: 'rec-client-01',
        page: 2,
        x: 10,
        y: 84,
        width: 38,
        height: 7,
        required: true
      },
      {
        id: 'fld-104',
        type: 'text',
        label: 'Title / Designation',
        recipientId: 'rec-client-01',
        page: 2,
        x: 55,
        y: 84,
        width: 35,
        height: 7,
        required: true
      }
    ],
    recipients: [
      {
        id: 'rec-client-01',
        name: 'David Vance',
        email: 'd.vance@acmeglobal.com',
        role: 'signer',
        routingOrder: 1,
        authType: 'sms_otp',
        phoneNumber: '+1 (555) 392-8819',
        status: 'ready'
      },
      {
        id: 'rec-cfo-02',
        name: 'Elena Rostova (VP Finance)',
        email: 'e.rostova@signflow.ai',
        role: 'approver',
        routingOrder: 2,
        authType: 'email',
        status: 'waiting'
      }
    ],
    auditTrail: [
      {
        id: 'aud-001',
        timestamp: '2026-08-26T10:15:00Z',
        actor: 'Sarah Jenkins (sarah.j@signflow.ai)',
        action: 'Envelope Created & Configured',
        details: 'Uploaded Master_Services_Agreement_2026.pdf with SHA-256 validation',
        ipAddress: '198.51.100.24',
        geo: 'San Francisco, CA, US',
        device: 'Chrome 124 / macOS',
        hashChainPrevious: 'GENESIS_ROOT_HASH_000000000000000000000000000000000000000000000000',
        hashChainCurrent: generateFullSha256(),
        complianceTags: ['ESIGN', 'SOC2', '21CFR11']
      },
      {
        id: 'aud-002',
        timestamp: '2026-08-26T10:16:12Z',
        actor: 'SignFlow AI Engine v4.2',
        action: 'Smart Field Auto-Detection',
        details: 'Detected 4 signing coordinates with 97.2% aggregate layout confidence',
        ipAddress: '10.0.4.12 (Internal AI Gateway)',
        geo: 'AWS us-east-1',
        device: 'SignFlow-Worker-AI-CV',
        hashChainPrevious: 'PREV_HASH_PLACEHOLDER',
        hashChainCurrent: generateFullSha256(),
        complianceTags: ['SOC2']
      },
      {
        id: 'aud-003',
        timestamp: '2026-08-26T10:18:00Z',
        actor: 'Sarah Jenkins',
        action: 'Envelope Sent to Recipients',
        details: 'Dispatched notification via SendGrid SMTP with TLS 1.3 encryption',
        ipAddress: '198.51.100.24',
        geo: 'San Francisco, CA, US',
        device: 'Chrome 124 / macOS',
        hashChainPrevious: 'PREV_HASH_PLACEHOLDER',
        hashChainCurrent: generateFullSha256(),
        complianceTags: ['ESIGN', 'eIDAS']
      }
    ],
    aiAnalysis: {
      overallScore: 92,
      riskLevel: 'low',
      playbookGrade: 'A',
      analyzedAt: '2026-08-26T10:16:30Z',
      modelVersion: 'SignFlow-Legal-LLM-v3.8',
      guardrailPassed: true,
      findings: [
        {
          id: 'risk-01',
          clauseName: 'Payment Interest Term',
          riskType: 'Aggressive Late Fee',
          severity: 'low',
          explanation: '1.5% monthly late fee equals 18% APR, which is near state statutory usury ceilings in certain jurisdictions.',
          playbookStandard: 'Recommend 1.0% per month or statutory prime rate.',
          recommendedEdit: 'Invoices not paid within forty-five (45) days shall accrue interest at 1.0% per month.',
          pageNumber: 1,
          lineReference: 'Section 2, Paragraph 2',
          status: 'flagged'
        }
      ]
    },
    extractedObligations: [
      {
        id: 'ob-01',
        title: 'Net 30 Invoicing Payment Due',
        type: 'payment',
        dueDate: '2026-09-30',
        responsibleParty: 'Acme Global Enterprises',
        amount: '$45,000.00',
        clauseReference: 'Section 2 (Fees & Invoicing)',
        status: 'upcoming',
        autoReminder: true
      },
      {
        id: 'ob-02',
        title: 'Initial SOW Milestones Delivery',
        type: 'deliverable',
        dueDate: '2026-11-15',
        responsibleParty: 'SignFlow Technologies',
        clauseReference: 'SOW #104 Deliverable Schedule',
        status: 'active',
        autoReminder: true
      }
    ]
  },
  {
    id: 'env-nda-4402',
    title: 'Mutual Non-Disclosure Agreement (Apex Partners)',
    description: 'Bilateral confidentiality agreement for strategic joint-venture exploratory discussions.',
    sender: {
      name: 'Michael Chang',
      email: 'm.chang@signflow.ai',
      organization: 'SignFlow Legal Operations'
    },
    status: 'completed',
    createdAt: '2026-08-25T14:00:00Z',
    updatedAt: '2026-08-25T16:20:00Z',
    expiresAt: '2026-09-25T00:00:00Z',
    completedAt: '2026-08-25T16:20:00Z',
    tags: ['NDA', 'Legal', 'Mutual'],
    requiresPayment: false,
    documents: [
      {
        id: 'doc-nda-01',
        name: 'Mutual_NDA_Apex_2026.pdf',
        size: '640 KB',
        fileType: 'pdf',
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        pages: [
          {
            pageNumber: 1,
            title: 'Mutual Non-Disclosure Agreement',
            content: `### MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is executed on August 25, 2026, between **SignFlow Technologies Inc.** and **Apex Global Partners LLC**.

1. **Definition of Confidential Information**: Any proprietary or technical information, product roadmaps, source code, business strategies, and customer data disclosed by either party.
2. **Obligations**: Each party shall hold the other\'s Confidential Information in strict confidence for a period of three (3) years from disclosure.
3. **Exclusions**: Does not include information publicly known, previously known without restriction, or independently developed.
4. **Governing Law**: State of New York.`
          }
        ]
      }
    ],
    fields: [
      {
        id: 'fld-nda-01',
        type: 'signature',
        label: 'Apex Partner Signature',
        recipientId: 'rec-apex-01',
        page: 1,
        x: 12,
        y: 75,
        width: 36,
        height: 10,
        required: true,
        value: 'Amanda Sterling'
      },
      {
        id: 'fld-nda-02',
        type: 'date_signed',
        label: 'Date',
        recipientId: 'rec-apex-01',
        page: 1,
        x: 55,
        y: 75,
        width: 30,
        height: 8,
        required: true,
        value: '2026-08-25'
      }
    ],
    recipients: [
      {
        id: 'rec-apex-01',
        name: 'Amanda Sterling',
        email: 'amanda@apexpartners.io',
        role: 'signer',
        routingOrder: 1,
        authType: 'email',
        status: 'signed',
        signedAt: '2026-08-25T16:20:00Z',
        signatureData: {
          type: 'draw',
          value: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><text x="10" y="35" font-family="Dancing Script" font-size="28" fill="%231e3a8a">Amanda Sterling</text></svg>',
          fontFamily: 'Dancing Script',
          appliedAt: '2026-08-25T16:20:00Z',
          ipAddress: '198.51.100.118',
          deviceFingerprint: 'Safari / iPhone iOS 17.4'
        }
      }
    ],
    auditTrail: [
      {
        id: 'aud-nda-01',
        timestamp: '2026-08-25T14:00:00Z',
        actor: 'Michael Chang',
        action: 'Envelope Created and Sent',
        details: 'NDA generated from Standard Vetted Legal Template #T-004',
        ipAddress: '198.51.100.88',
        geo: 'New York, NY, US',
        device: 'Chrome / Windows 11',
        hashChainPrevious: 'GENESIS_HASH_847192',
        hashChainCurrent: generateFullSha256(),
        complianceTags: ['ESIGN', 'SOC2']
      },
      {
        id: 'aud-nda-02',
        timestamp: '2026-08-25T16:15:30Z',
        actor: 'Amanda Sterling (amanda@apexpartners.io)',
        action: 'Document Viewed & Consent Given',
        details: 'Signer accepted Electronic Signature Disclosure & Consent (ESIGN Act §101(c))',
        ipAddress: '198.51.100.118',
        geo: 'Boston, MA, US',
        device: 'Safari / iPhone iOS 17.4',
        hashChainPrevious: 'PREV_HASH_12984',
        hashChainCurrent: generateFullSha256(),
        complianceTags: ['ESIGN', 'eIDAS']
      },
      {
        id: 'aud-nda-03',
        timestamp: '2026-08-25T16:20:00Z',
        actor: 'Amanda Sterling',
        action: 'Signature Applied & Envelope Completed',
        details: 'Applied digital signature with SHA-256 seal; Certificate of Completion generated',
        ipAddress: '198.51.100.118',
        geo: 'Boston, MA, US',
        device: 'Safari / iPhone iOS 17.4',
        hashChainPrevious: 'PREV_HASH_98273',
        hashChainCurrent: generateFullSha256(),
        complianceTags: ['ESIGN', 'eIDAS', '21CFR11']
      }
    ]
  },
  {
    id: 'env-ron-7109',
    title: 'Commercial Real Estate Lease & Deed (Austin Tech Hub)',
    description: 'Requires Remote Online Notarization (RON), Government ID biometric check, and official notary seal.',
    sender: {
      name: 'Robert Hastings',
      email: 'r.hastings@signflow.ai',
      organization: 'SignFlow Real Estate & Title'
    },
    status: 'sent',
    createdAt: '2026-08-27T09:00:00Z',
    updatedAt: '2026-08-27T11:15:00Z',
    expiresAt: '2026-09-10T00:00:00Z',
    tags: ['Notarization', 'RON', 'Real Estate', 'High-Risk'],
    requiresNotary: true,
    notarySessionId: 'notary-sess-9921',
    requiresPayment: false,
    documents: [
      {
        id: 'doc-lease-01',
        name: 'Commercial_Deed_Austin_Hub.pdf',
        size: '3.4 MB',
        fileType: 'pdf',
        sha256Hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        pages: [
          {
            pageNumber: 1,
            title: 'Deed of Commercial Conveyance',
            content: `### DEED OF LEASE AND CONVEYANCE
**STATE OF TEXAS, COUNTY OF TRAVIS**

KNOW ALL MEN BY THESE PRESENTS:
That the undersigned Grantor and Grantee agree to the terms of the Commercial Lease for Suite 400, 100 Congress Avenue, Austin, Texas.

**NOTARIAL ACKNOWLEDGMENT REQUIREMENT:**
This instrument requires Remote Online Notarization pursuant to Texas Government Code Chapter 406, Subchapter C.`
          }
        ]
      }
    ],
    fields: [
      {
        id: 'fld-ron-01',
        type: 'signature',
        label: 'Grantee Signer Signature',
        recipientId: 'rec-ron-signer',
        page: 1,
        x: 10,
        y: 65,
        width: 38,
        height: 10,
        required: true
      },
      {
        id: 'fld-ron-stamp',
        type: 'stamp',
        label: 'Official Notary Public Digital Seal',
        recipientId: 'rec-notary-officer',
        page: 1,
        x: 55,
        y: 65,
        width: 35,
        height: 18,
        required: true
      }
    ],
    recipients: [
      {
        id: 'rec-ron-signer',
        name: 'Marcus Vance',
        email: 'marcus.vance@techcorp.com',
        role: 'signer',
        routingOrder: 1,
        authType: 'idv_biometric',
        phoneNumber: '+1 (512) 883-9912',
        status: 'ready'
      },
      {
        id: 'rec-notary-officer',
        name: 'Catherine Bell (Commission #TX-298192)',
        email: 'c.bell@txnotaryportal.gov',
        role: 'signer',
        routingOrder: 2,
        authType: 'access_code',
        status: 'waiting'
      }
    ],
    auditTrail: [
      {
        id: 'aud-ron-01',
        timestamp: '2026-08-27T09:00:00Z',
        actor: 'Robert Hastings',
        action: 'RON Envelope Scheduled & Video Room Provisioned',
        details: 'WebRTC encrypted session provisioned with 1080p audit recording ledger',
        ipAddress: '198.51.100.15',
        geo: 'Austin, TX, US',
        device: 'Edge 123 / Windows',
        hashChainPrevious: 'GENESIS_ROOT_DEED_001',
        hashChainCurrent: generateFullSha256(),
        complianceTags: ['ESIGN', 'eIDAS', '21CFR11']
      }
    ]
  },
  {
    id: 'env-saas-stripe-3310',
    title: 'Enterprise SaaS Order Form & Payment Retainer',
    description: 'Includes interactive Stripe payment field for $12,500 annual platform retainer upon signing.',
    sender: {
      name: 'Jessica Reynolds',
      email: 'jessica@signflow.ai',
      organization: 'SignFlow Global Enterprise'
    },
    status: 'draft',
    createdAt: '2026-08-27T11:00:00Z',
    updatedAt: '2026-08-27T11:45:00Z',
    expiresAt: '2026-09-27T00:00:00Z',
    tags: ['Payment', 'Stripe', 'SaaS', 'OrderForm'],
    requiresPayment: true,
    totalPaymentAmount: 12500,
    documents: [
      {
        id: 'doc-saas-01',
        name: 'SignFlow_Order_Form_Acme.pdf',
        size: '920 KB',
        fileType: 'pdf',
        sha256Hash: 'b45c2198031e08db917c9d74944d18ec06f6ae9b6e3f225bb9d06bcf44e01928',
        pages: [
          {
            pageNumber: 1,
            title: 'SaaS Subscription Order Form',
            content: `### ENTERPRISE SUBSCRIPTION ORDER FORM
**Service Plan**: SignFlow Ultra-Enterprise Dedicated (250 Seats)
**Annual Subscription Fee**: $12,500.00 USD
**Payment Term**: Credit Card / ACH due upon electronic execution.

By signing below, Customer authorizes the immediate charge of $12,500.00 to the payment method provided in the integrated payment block.`
          }
        ]
      }
    ],
    fields: [
      {
        id: 'fld-saas-sig',
        type: 'signature',
        label: 'Buyer Signature',
        recipientId: 'rec-buyer-01',
        page: 1,
        x: 10,
        y: 60,
        width: 38,
        height: 10,
        required: true
      },
      {
        id: 'fld-saas-pay',
        type: 'payment',
        label: 'Annual Retainer Payment ($12,500.00)',
        recipientId: 'rec-buyer-01',
        page: 1,
        x: 10,
        y: 74,
        width: 80,
        height: 14,
        required: true,
        paymentAmount: 12500,
        currency: 'USD'
      }
    ],
    recipients: [
      {
        id: 'rec-buyer-01',
        name: 'Jonathan Meyers (CTO)',
        email: 'j.meyers@venturepoint.co',
        role: 'signer',
        routingOrder: 1,
        authType: 'email',
        status: 'waiting'
      }
    ],
    auditTrail: [
      {
        id: 'aud-saas-01',
        timestamp: '2026-08-27T11:00:00Z',
        actor: 'Jessica Reynolds',
        action: 'Draft Order Form Created',
        details: 'Attached Stripe payment intent (amount: $12,500.00 USD, currency: usd)',
        ipAddress: '198.51.100.99',
        geo: 'San Francisco, CA, US',
        device: 'Chrome 124 / macOS',
        hashChainPrevious: 'GENESIS_PAYMENT_9921',
        hashChainCurrent: generateFullSha256(),
        complianceTags: ['ESIGN', 'SOC2']
      }
    ]
  }
];
