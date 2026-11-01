import { Template } from '../types/signflow';

export const MOCK_TEMPLATES: Template[] = [
  {
    id: 'tmpl-01',
    name: 'Standard Mutual Non-Disclosure Agreement (MNDA)',
    description: 'Bilateral 2-year confidentiality agreement with standard Delaware governing law and IP protections.',
    category: 'Legal & Corporate',
    usageCount: 428,
    lastUsed: '10 mins ago',
    roles: [
      { roleName: 'First Discloser (Sender)', description: 'Company executing the agreement', defaultAuth: 'email' },
      { roleName: 'Counterparty Signer', description: 'Authorized executive of partner company', defaultAuth: 'email' }
    ],
    agreementType: 'bilateral',
    defaultFieldsCount: 6,
    sampleDocument: {
      id: 'doc-t1',
      name: 'Standard_MNDA_Template.pdf',
      size: '480 KB',
      fileType: 'pdf',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      pages: [
        {
          pageNumber: 1,
          title: 'Mutual NDA Agreement Terms',
          content: '### MUTUAL NON-DISCLOSURE AGREEMENT\n\nThis Agreement is entered into between Company and Counterparty...\n\n1. Scope of Confidential Information\n2. Non-Disclosure Obligations (3-Year Term)\n3. Exclusions & Permitted Disclosures\n4. Remedies & Injunctive Relief'
        }
      ]
    }
  },
  {
    id: 'tmpl-02',
    name: 'Executive Employment Offer Letter & IP Assignment',
    description: 'Comprehensive employment agreement including salary, equity vesting, at-will terms, and proprietary invention assignment.',
    category: 'HR & Hiring',
    usageCount: 194,
    lastUsed: '2 hours ago',
    agreementType: 'multilateral',
    roles: [
      { roleName: 'Hiring Manager (Sender)', description: 'VP or HR Director', defaultAuth: 'email' },
      { roleName: 'Candidate (Employee)', description: 'Prospective full-time hire', defaultAuth: 'sms_otp' },
      { roleName: 'HR Compliance (Approver)', description: 'People Ops Verification', defaultAuth: 'email' }
    ],
    defaultFieldsCount: 12,
    sampleDocument: {
      id: 'doc-t2',
      name: 'Executive_Offer_Letter.pdf',
      size: '1.2 MB',
      fileType: 'pdf',
      sha256Hash: '9a721c4801e08db917c9d74944d18ec06f6ae9b6e3f225bb9d06bcf44e054129',
      pages: [
        {
          pageNumber: 1,
          title: 'Offer of Employment Terms',
          content: '### OFFER OF EMPLOYMENT\n\nDear [Candidate Name],\n\nWe are pleased to offer you the position of [Job Title] at [Company Name].\n\n- Base Salary: [Annual Salary]\n- Stock Option Grant: [Number of Shares], subject to 4-year vesting with 1-year cliff\n- Start Date: [Start Date]'
        }
      ]
    }
  },
  {
    id: 'tmpl-03',
    name: 'Enterprise Master Services Agreement (MSA)',
    description: 'Standard enterprise customer vendor agreement with trailing 12-month liability cap and Net 30 invoicing.',
    category: 'Sales',
    usageCount: 612,
    lastUsed: 'Yesterday',
    agreementType: 'multilateral',
    roles: [
      { roleName: 'Account Executive (Sender)', description: 'SignFlow Sales Team', defaultAuth: 'email' },
      { roleName: 'Client Signer', description: 'Customer Signer with financial authority', defaultAuth: 'sms_otp' },
      { roleName: 'Legal Approver', description: 'General Counsel or VP Finance', defaultAuth: 'email' }
    ],
    defaultFieldsCount: 8,
    sampleDocument: {
      id: 'doc-t3',
      name: 'Enterprise_MSA_Template.pdf',
      size: '2.1 MB',
      fileType: 'pdf',
      sha256Hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      pages: [
        {
          pageNumber: 1,
          title: 'Services Agreement Terms',
          content: '### MASTER SERVICES AGREEMENT\n\nStandard terms for professional software implementation and service delivery.'
        }
      ]
    }
  },
  {
    id: 'tmpl-04',
    name: 'General Commercial Lease & Sublease Agreement',
    description: 'Real estate lease agreement with Remote Online Notarization (RON) and Travis County / Delaware jurisdiction.',
    category: 'Procurement',
    usageCount: 89,
    lastUsed: '3 days ago',
    agreementType: 'multilateral',
    roles: [
      { roleName: 'Lessor (Landlord)', description: 'Property Owner', defaultAuth: 'email' },
      { roleName: 'Lessee (Tenant)', description: 'Commercial Tenant', defaultAuth: 'idv_biometric' },
      { roleName: 'Remote Notary Officer', description: 'Commissioned State Notary', defaultAuth: 'access_code' }
    ],
    defaultFieldsCount: 14,
    sampleDocument: {
      id: 'doc-t4',
      name: 'Commercial_Lease_Template.pdf',
      size: '3.1 MB',
      fileType: 'pdf',
      sha256Hash: 'b45c2198031e08db917c9d74944d18ec06f6ae9b6e3f225bb9d06bcf44e01928',
      pages: [
        {
          pageNumber: 1,
          title: 'Lease & Conveyance',
          content: '### COMMERCIAL LEASE AGREEMENT\n\nPremises description, monthly rent payments, maintenance obligations, and notarial seal requirements.'
        }
      ]
    }
  },
  {
    id: 'tmpl-05',
    name: 'Unilateral Non-Disclosure Agreement (One-Way Discloser)',
    description: 'Unilateral single-signatory confidentiality undertaking protecting proprietary code, trade secrets, and algorithms.',
    category: 'Legal & Corporate',
    usageCount: 310,
    lastUsed: '4 hours ago',
    agreementType: 'unilateral',
    roles: [
      { roleName: 'Recipient / Receiving Party', description: 'Individual or entity receiving confidential information', defaultAuth: 'email' }
    ],
    defaultFieldsCount: 3,
    sampleDocument: {
      id: 'doc-t5',
      name: 'Unilateral_NDA_Undertaking.pdf',
      size: '340 KB',
      fileType: 'pdf',
      sha256Hash: 'c12a84b009ef3a1b8996fb92427ae41e4649b934ca495991b7852b8559a721c4',
      pages: [
        {
          pageNumber: 1,
          title: 'Unilateral Confidentiality Undertaking',
          content: `### UNILATERAL CONFIDENTIALITY UNDERTAKING & NON-DISCLOSURE AGREEMENT

The undersigned ("Recipient") acknowledges that in connection with evaluating a potential commercial relationship with **SignFlow Technologies Inc.** ("Discloser"), Recipient will receive confidential and proprietary technical and business information.

#### 1. RECIPIENT UNDERTAKING & OBLIGATIONS
Recipient hereby undertakes and covenants to:
(a) Hold all Discloser Confidential Information in strict confidence using the highest standard of care;
(b) Not disclose, publish, reverse-engineer, or distribute any proprietary software, architecture, or credentials;
(c) Promptly return or destroy all confidential materials upon Discloser\'s written request.

#### 2. SOLE SIGNATORY EXECUTION
This Undertaking is unilateral and takes immediate legal effect upon electronic execution by the Recipient.

---
**RECIPIENT SIGNATORY ACCEPTANCE**`
        }
      ]
    }
  },
  {
    id: 'tmpl-06',
    name: 'Employee Proprietary Information & Inventions Agreement (PIIA)',
    description: 'Unilateral employee IP assignment and non-disclosure undertaking signed solely by new hires and contractors.',
    category: 'HR & Hiring',
    usageCount: 245,
    lastUsed: '1 day ago',
    agreementType: 'unilateral',
    roles: [
      { roleName: 'Employee / Contractor', description: 'Individual executing the unilateral IP assignment', defaultAuth: 'passkey_webauthn' }
    ],
    defaultFieldsCount: 4,
    sampleDocument: {
      id: 'doc-t6',
      name: 'Employee_PIIA_Agreement.pdf',
      size: '510 KB',
      fileType: 'pdf',
      sha256Hash: '8b721c4801e08db917c9d74944d18ec06f6ae9b6e3f225bb9d06bcf44e054199',
      pages: [
        {
          pageNumber: 1,
          title: 'Proprietary Information & Inventions Assignment',
          content: `### PROPRIETARY INFORMATION AND INVENTIONS ASSIGNMENT AGREEMENT (PIIA)

As a condition of my engagement with **SignFlow Technologies Inc.** ("Company"), I hereby agree to the following terms:

#### 1. ASSIGNMENT OF INVENTIONS
I hereby irrevocably assign and transfer to the Company all my right, title, and interest in and to all inventions, software, trade secrets, workflows, and discoveries made by me during my engagement.

#### 2. GOVERNING LAW & SEVERABILITY
This Agreement is governed by Delaware law and shall be permanently bound in the Company\'s cryptographic HR registry upon signature.

---
**EMPLOYEE / CONTRACTOR ACKNOWLEDGMENT**`
        }
      ]
    }
  },
  {
    id: 'tmpl-07',
    name: 'General Liability Waiver & Media Release',
    description: 'Unilateral participant waiver, assumption of risk, and media consent form signed solely by the attendee.',
    category: 'Legal & Corporate',
    usageCount: 152,
    lastUsed: '3 days ago',
    agreementType: 'unilateral',
    roles: [
      { roleName: 'Participant / Signatory', description: 'Individual assuming risk and providing consent', defaultAuth: 'email' }
    ],
    defaultFieldsCount: 3,
    sampleDocument: {
      id: 'doc-t7',
      name: 'General_Liability_Waiver.pdf',
      size: '290 KB',
      fileType: 'pdf',
      sha256Hash: '4f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9077',
      pages: [
        {
          pageNumber: 1,
          title: 'Liability Waiver & Release',
          content: `### GENERAL LIABILITY WAIVER & MEDIA RELEASE

By signing below, I express my voluntary consent and agreement to release and hold harmless **SignFlow Technologies Inc.**, its officers, employees, and agents from any claims, damages, or liabilities arising from my participation.

I further grant full permission to use photographs and recordings taken during company events for marketing and documentation purposes.

---
**PARTICIPANT SIGNATURE & CONSENT**`
        }
      ]
    }
  }
];
