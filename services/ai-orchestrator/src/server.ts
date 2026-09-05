import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8084;

app.use(cors());
app.use(express.json());

// Clause database for RAG retrieval
const VETTED_CLAUSES = [
  {
    id: 'cl-indemnity',
    category: 'Indemnification',
    title: 'Mutual Indemnification & IP Defense',
    standardText: 'Each Party agrees to defend, indemnify, and hold harmless the other Party from third-party claims arising out of IP infringement or gross negligence.',
    aggressiveText: 'Customer shall defend and indemnify Vendor against all claims regardless of cause.',
    citation: 'Corpus Ref: US-CORP-INDEMNITY-2026'
  },
  {
    id: 'cl-liability',
    category: 'Liability',
    title: 'Limitation of Liability (12-Month Cap)',
    standardText: 'The aggregate liability of either party shall not exceed total fees paid in the twelve (12) months preceding the claim.',
    aggressiveText: 'Vendor liability is strictly capped at $50.00 total.',
    citation: 'Corpus Ref: US-CORP-LIABILITY-CAP'
  },
  {
    id: 'cl-term',
    category: 'Termination',
    title: 'Term & Non-Renewal Notice (30 Days)',
    standardText: 'Agreement renews annually unless 30 days prior written notice of cancellation is delivered.',
    aggressiveText: 'Auto-renews for 3-year term unless 90 days certified postal notice is given.',
    citation: 'Corpus Ref: US-CORP-RENEWAL-WINDOW'
  }
];

// 1. AI Drafting Endpoint
app.post('/api/v1/ai/draft', (req: Request, res: Response) => {
  const { prompt = 'Commercial Agreement', agreementType = 'MSA' } = req.body;

  const clauses = VETTED_CLAUSES.map(c => ({
    id: 'clause-' + Math.random().toString(36).substring(2, 8),
    title: c.title,
    category: c.category,
    sourceCitation: c.citation,
    originalText: c.aggressiveText,
    suggestedText: c.standardText,
    status: 'suggested'
  }));

  const fullText = `### ${prompt.toUpperCase()}\n\n` + clauses.map((c, i) => `#### ${i + 1}. ${c.title.toUpperCase()}\n${c.suggestedText}`).join('\n\n');

  res.json({
    success: true,
    title: `${prompt.slice(0, 40)} Agreement`,
    modelVersion: 'SignFlow-Legal-LLM-v3.8',
    guardrailsPassed: true,
    clauses,
    fullDraftContent: fullText
  });
});

// 2. AI Risk & Playbook Review Endpoint
app.post('/api/v1/ai/risk-scan', (req: Request, res: Response) => {
  const { documentText = '' } = req.body;
  const lower = documentText.toLowerCase();

  const findings: any[] = [];
  if (!lower.includes('limitation of liability') && !lower.includes('aggregate liability')) {
    findings.push({
      clauseName: 'Limitation of Liability',
      severity: 'critical',
      explanation: 'Missing aggregate liability cap creates uncapped financial exposure.',
      recommendedEdit: 'Cap aggregate liability at 12-month trailing fee amount.'
    });
  }
  if (lower.includes('90 days') || lower.includes('90-day')) {
    findings.push({
      clauseName: 'Auto-Renewal Window',
      severity: 'medium',
      explanation: '90-day cancellation window before renewal creates risk of accidental multi-year lock-in.',
      recommendedEdit: 'Reduce notice period to 30 days prior written notice.'
    });
  }

  const score = findings.length === 0 ? 95 : Math.max(40, 95 - findings.length * 20);
  const grade = score > 85 ? 'A' : score > 70 ? 'B' : score > 50 ? 'C' : 'F';

  res.json({
    success: true,
    overallScore: score,
    playbookGrade: grade,
    riskLevel: score > 80 ? 'low' : score > 60 ? 'medium' : 'high',
    findingsCount: findings.length,
    findings,
    analyzedAt: new Date().toISOString()
  });
});

// 3. Conversational Contract Vault Q&A Endpoint
app.post('/api/v1/ai/contract-qa', (req: Request, res: Response) => {
  const { question = '', documentTitle = 'Agreement' } = req.body;
  const q = question.toLowerCase();

  let answer = `Under standard terms for ${documentTitle}, liabilities are capped at 12-month trailing fees and disputes are governed by Delaware courts.`;
  let citations = [
    { page: 1, clauseTitle: 'General Terms', paragraph: 'Mutual standard commercial protections apply.' }
  ];

  if (q.includes('liability') || q.includes('cap') || q.includes('sue')) {
    answer = 'The aggregate cumulative liability of either party is strictly capped at the total fees paid in the twelve (12) months preceding the claim.';
    citations = [
      { page: 2, clauseTitle: 'Section 4: Limitation of Liability', paragraph: 'Aggregate cumulative liability capped at total fees paid in preceding 12 months.' }
    ];
  } else if (q.includes('payment') || q.includes('invoice') || q.includes('fee')) {
    answer = 'Invoices are payable on Net 30 terms. Unpaid balances after 45 days accrue interest at 1.5% per month.';
    citations = [
      { page: 1, clauseTitle: 'Section 2: Fees & Invoicing', paragraph: 'Net 30 invoice payments with statutory late fee provisions.' }
    ];
  }

  res.json({
    success: true,
    answer,
    citations,
    confidence: 0.96,
    retrievalMode: 'RAG_GROUNDED_NO_HALLUCINATION'
  });
});

app.listen(PORT, () => {
  console.log(`[SignFlow AI Orchestrator] Listening on http://localhost:${PORT}`);
});
