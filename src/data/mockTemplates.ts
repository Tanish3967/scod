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
  }
];
