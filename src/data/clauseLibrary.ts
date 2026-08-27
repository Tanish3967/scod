export interface ClauseItem {
  id: string;
  category: 'Indemnification' | 'Liability' | 'Termination' | 'Confidentiality' | 'Intellectual Property' | 'Governing Law' | 'Payment Terms' | 'Data Protection (GDPR/CCPA)' | 'Warranties';
  title: string;
  standardText: string;
  aggressiveVendorText: string;
  aggressiveClientText: string;
  riskExplanation: string;
  playbookStandard: string;
}

export const CLAUSE_LIBRARY: ClauseItem[] = [
  {
    id: 'cl-indemnity',
    category: 'Indemnification',
    title: 'Mutual Indemnification & IP Defense',
    standardText: 'Each Party ("Indemnifying Party") agrees to defend, indemnify, and hold harmless the other Party, its affiliates, and their respective officers, directors, and employees from and against any third-party claims, damages, liabilities, and expenses arising directly out of the Indemnifying Party\'s gross negligence, willful misconduct, or infringement of valid third-party Intellectual Property rights.',
    aggressiveVendorText: 'Customer shall defend and indemnify Vendor against any and all claims, losses, damages, or expenses arising from Customer\'s use of the Platform, regardless of cause or contributory negligence.',
    aggressiveClientText: 'Vendor agrees to indemnify, defend, and hold harmless Customer from any and all claims, liabilities, lost profits, indirect damages, and attorneys\' fees arising out of any breach, service interruption, or data anomaly.',
    riskExplanation: 'Uncapped or one-sided indemnity exposes one party to unlimited external third-party liability without proportional reciprocity.',
    playbookStandard: 'Require mutual indemnification strictly limited to IP infringement, gross negligence, and willful misconduct, subject to prompt written notice.'
  },
  {
    id: 'cl-liability',
    category: 'Liability',
    title: 'Limitation of Liability & Aggregate Cap',
    standardText: 'Except for breaches of Section (Confidentiality) or indemnification obligations, neither party shall be liable for any indirect, incidental, consequential, special, or punitive damages. The aggregate liability of either party arising out of or related to this Agreement shall not exceed the total fees paid or payable by Customer in the twelve (12) months preceding the claim.',
    aggressiveVendorText: 'Vendor\'s total cumulative liability under this Agreement is strictly limited to fifty US Dollars ($50.00). In no event shall Vendor be liable for data loss, service downtime, or security incidents.',
    aggressiveClientText: 'Vendor shall have unlimited liability for any breaches of data privacy, service level agreements, or confidentiality, with no aggregate financial cap or exclusion of consequential damages.',
    riskExplanation: 'Lack of a mutual 12-month trailing fee liability cap creates existential financial risk for standard commercial contracts.',
    playbookStandard: 'Cap aggregate liability at 1x–2x total fees paid in the prior 12 months, with super-caps for confidentiality/data breach capped at 3x–5x fees.'
  },
  {
    id: 'cl-term',
    category: 'Termination',
    title: 'Term, Auto-Renewal & Termination for Convenience',
    standardText: 'This Agreement shall commence on the Effective Date for an initial term of one (1) year. It shall automatically renew for successive one-year terms unless either party gives written notice of non-renewal at least thirty (30) days prior to the expiration of the then-current term. Either party may terminate for convenience upon sixty (60) days prior written notice.',
    aggressiveVendorText: 'This Agreement renews automatically for successive three-year periods unless written notice of cancellation is delivered exclusively via certified mail ninety (90) days prior to the end of the term. No termination for convenience is permitted.',
    aggressiveClientText: 'Customer may terminate this Agreement at any time, with or without cause, effective immediately upon email notice, and receive a full pro-rata refund of all prepaid fees.',
    riskExplanation: 'Onerous 90+ day auto-renewal traps or immediate unilateral termination without cause undermine operational predictability.',
    playbookStandard: 'Standard 30-day non-renewal notification window and mutual 30 to 60 days termination for material breach with 30-day cure period.'
  },
  {
    id: 'cl-ip',
    category: 'Intellectual Property',
    title: 'IP Ownership & Customer Data Rights',
    standardText: 'Customer retains all right, title, and interest in and to Customer Data. Provider retains all rights, title, and interest in and to the Platform, Services, and underlying software. Provider is granted a limited, non-exclusive license to process Customer Data solely to deliver the Services.',
    aggressiveVendorText: 'Provider owns all derivative works, analytical models, insights, aggregated telemetry, and output generated from Customer Data, and may utilize Customer Data for any commercial purpose.',
    aggressiveClientText: 'Customer shall own all custom code, platform modifications, and IP developed during the provision of the Services, including Provider core infrastructure adjustments.',
    riskExplanation: 'Ambiguous IP assignment can inadvertently transfer proprietary customer datasets or core vendor platform rights.',
    playbookStandard: 'Customer retains 100% ownership of raw data. Provider owns general platform code and telemetry in anonymized, aggregated form only.'
  },
  {
    id: 'cl-confidentiality',
    category: 'Confidentiality',
    title: 'Mutual Confidentiality & Standard of Care',
    standardText: 'Each Receiving Party agrees to protect the Disclosing Party\'s Confidential Information with the same degree of care it uses for its own confidential materials (and not less than reasonable care), and shall not disclose such information to third parties without prior written consent, for a period of three (3) years.',
    aggressiveVendorText: 'Confidentiality obligations apply solely to information marked in bold red text as "STRICTLY SECRET" and expire after thirty (30) days.',
    aggressiveClientText: 'Confidentiality obligations are perpetual for all business communications, verbal or written, with liquidated damages of $1,000,000 per disclosure.',
    riskExplanation: 'Overly restrictive or under-protective non-disclosure obligations risk leaking trade secrets or imposing unmanageable compliance burdens.',
    playbookStandard: 'Standard mutual NDA protection with a 3 to 5 year term, with perpetual protection strictly reserved for true trade secrets and source code.'
  },
  {
    id: 'cl-governing-law',
    category: 'Governing Law',
    title: 'Governing Law & Dispute Resolution',
    standardText: 'This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws principles. Any legal suit or proceeding shall be instituted exclusively in the state or federal courts located in Wilmington, Delaware.',
    aggressiveVendorText: 'This Agreement is governed by the laws of the Cayman Islands, and all disputes must be arbitrated in London under ICC rules at Customer\'s sole expense.',
    aggressiveClientText: 'Governing law shall be the local municipal jurisdiction of the Customer\'s remote branch office.',
    riskExplanation: 'Unfavorable foreign jurisdictions cause excessive litigation expense and uncertain legal enforcement.',
    playbookStandard: 'Delaware, New York, or California state/federal courts with mutual waiver of jury trial.'
  }
];
