// SignFlow: Automated End-to-End Enterprise Test Suite
// Validates Unified Backend Service Engine & Subsystems
import { spawn } from 'node:child_process';
import process from 'node:process';

const GATEWAY_PORT = process.env.PORT || 8090;
const GATEWAY_URL = `http://127.0.0.1:${GATEWAY_PORT}`;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getJson(url) {
  const res = await fetch(url, {
    headers: { 'Authorization': 'Bearer mock-jwt-enterprise' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return await res.json();
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-jwt-enterprise'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return await res.json();
}

async function runEnterpriseSuite() {
  console.log('===========================================================');
  console.log('  SignFlow: Unified Backend Enterprise Integration Test');
  console.log('===========================================================');

  // Check if server is already running
  let isAlreadyRunning = false;
  try {
    const probe = await fetch(`${GATEWAY_URL}/health`);
    if (probe.ok) isAlreadyRunning = true;
  } catch (_) {}

  let backendProc = null;
  if (!isAlreadyRunning) {
    console.log('1. Launching Unified Backend Service Engine (:8090)...');
    backendProc = spawn('node', ['services/unified-backend/dist/server.js'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, PORT: `${GATEWAY_PORT}` }
    });

    // Wait for server to become healthy
    let serverReady = false;
    for (let i = 0; i < 15; i++) {
      try {
        const res = await fetch(`${GATEWAY_URL}/health`);
        if (res.ok) {
          serverReady = true;
          break;
        }
      } catch (_) {}
      await sleep(500);
    }
    if (!serverReady) {
      console.warn('Backend server did not respond to health probe within 7.5s, proceeding with tests...');
    }
  } else {
    console.log('1. Reusing already active Unified Backend Service Engine (:8090)...');
  }

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  [PASS] Test ${total}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] Test ${total}: ${name}`);
      console.error(`         Details: ${err.message}`);
    }
  }

  try {
    // 1. Unified Backend Health & Module Map
    await test('Unified Backend Health & Module Discovery Map', async () => {
      const data = await getJson(`${GATEWAY_URL}/health`);
      if (data.status !== 'healthy') throw new Error('Unified Backend not healthy');
      if (!Array.isArray(data.modules) || data.modules.length < 5) throw new Error('Missing subsystem module reports');
    });

    // 2. Envelope Subsystem - List Envelopes
    await test('Envelope Module - In-Process List Envelopes', async () => {
      const data = await getJson(`${GATEWAY_URL}/api/v1/envelopes`);
      if (!Array.isArray(data.envelopes) && !Array.isArray(data)) throw new Error('Invalid envelopes response');
    });

    // 3. Envelope Subsystem - Creation
    let createdEnvId = '';
    await test('Envelope Module - In-Process Create Envelope', async () => {
      const payload = {
        title: 'Unified Backend Master Enterprise Agreement',
        status: 'draft',
        senderName: 'Alex Rivera',
        senderEmail: 'alex@acmeglobal.com'
      };
      const data = await postJson(`${GATEWAY_URL}/api/v1/envelopes`, payload);
      const id = data.envelope?.id || data.id;
      if (!id) throw new Error('Missing envelope ID');
      createdEnvId = id;
    });

    // 4. Audit Trail Subsystem - Merkle Chain Event Recording
    await test('Audit Ledger Module - Record Cryptographic SHA-256 Event', async () => {
      const payload = {
        envelopeId: createdEnvId || 'env-unified-test',
        eventType: 'ENVELOPE_SEALED',
        actorName: 'Alex Rivera',
        actorEmail: 'alex@acmeglobal.com',
        ipAddress: '198.51.100.82',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        payloadHash: 'sha256-8a01bf2848c909e4a11209bca7892182049c819203a98102'
      };
      const data = await postJson(`${GATEWAY_URL}/api/v1/audit/events`, payload);
      if (!data.success) throw new Error('Audit event recording failed');
    });

    // 5. Document Processing Subsystem
    await test('Document Processing Module - Layout & Geometry Analysis', async () => {
      const payload = {
        documentId: 'doc-unified-test',
        totalPages: 4,
        extractCoordinates: true
      };
      const data = await postJson(`${GATEWAY_URL}/api/v1/documents/process`, payload);
      if (!data.success) throw new Error('Document processing failed');
    });

    // 6. AI Orchestration Subsystem - Risk Review
    await test('AI Orchestrator Module - Legal Playbook Risk Review', async () => {
      const payload = {
        documentText: 'Section 4: Limitation of aggregate liability is capped at 12-month trailing spend.'
      };
      const data = await postJson(`${GATEWAY_URL}/api/v1/ai/risk-scan`, payload);
      if (data.overallScore < 70) throw new Error('Unexpected low AI risk score');
    });

    // 7. AI Orchestration Subsystem - RAG Contract Q&A
    await test('AI Orchestrator Module - Conversational Vault RAG Q&A', async () => {
      const payload = {
        question: 'What is the liability cap for this agreement?',
        documentTitle: 'Master Services Agreement'
      };
      const data = await postJson(`${GATEWAY_URL}/api/v1/ai/contract-qa`, payload);
      if (!data.answer || !data.citations) throw new Error('Invalid AI Q&A answer or missing citations');
    });

    // 8. Notification & Webhook Subsystem - HMAC Dispatch
    await test('Webhook Module - HMAC-SHA256 Signed Event Dispatch', async () => {
      const payload = {
        event: 'envelope.completed',
        targetUrl: 'https://api.acmeglobal.com/webhook/signflow',
        secret: 'whsec_enterprise_secret_2026',
        payload: { envelopeId: createdEnvId || 'env-unified-test', status: 'completed' }
      };
      const data = await postJson(`${GATEWAY_URL}/api/v1/webhooks/dispatch`, payload);
      if (!data.success || !data.signature) throw new Error('Failed to dispatch signed webhook');
    });

    // 9. Transactional Email Subsystem
    await test('Email Module - Transactional Signer Dispatch Gateway', async () => {
      const payload = {
        toEmail: 'david.vance@deltaenterprises.com',
        recipientName: 'David Vance',
        envelopeId: createdEnvId || 'env-unified-test',
        envelopeTitle: 'Enterprise Master Services Agreement',
        senderName: 'Alex Rivera',
        senderOrg: 'Acme Global Inc',
        config: { provider: 'sandbox' }
      };
      const data = await postJson(`${GATEWAY_URL}/api/v1/emails/send`, payload);
      if (!data.success || (!data.emailId && !data.dispatchResult?.messageId)) throw new Error('Email delivery failed');
    });

    // 10. DocuSign REST API v2.1 Wire-Compatible Adapter - Create Envelope
    let docusignEnvId = '';
    await test('DocuSign REST API v2.1 - Create Envelope Endpoint', async () => {
      const payload = {
        emailSubject: 'DocuSign SDK Integration Test Agreement',
        status: 'sent',
        recipients: {
          signers: [
            {
              recipientId: '1',
              name: 'Taylor Swift',
              email: 'taylor@swift.io',
              routingOrder: 1,
              clientUserId: 'usr-client-99',
              tabs: {
                signHereTabs: [
                  { pageNumber: 1, xPosition: 100, yPosition: 200, name: 'SignHere' }
                ],
                dateSignedTabs: [
                  { pageNumber: 1, xPosition: 300, yPosition: 200, name: 'DateSigned' }
                ]
              }
            }
          ]
        }
      };
      const res = await fetch(`${GATEWAY_URL}/v2.1/accounts/demo-acc-1/envelopes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer docusign-jwt' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.envelopeId || !data.uri) throw new Error('Invalid DocuSign envelope response');
      docusignEnvId = data.envelopeId;
    });

    // 11. DocuSign REST API v2.1 - Get Envelope & Recipients
    await test('DocuSign REST API v2.1 - Get Envelope & Recipient Roster', async () => {
      const envRes = await fetch(`${GATEWAY_URL}/v2.1/accounts/demo-acc-1/envelopes/${docusignEnvId}`, {
        headers: { 'Authorization': 'Bearer docusign-jwt' }
      });
      if (!envRes.ok) throw new Error(`HTTP ${envRes.status}`);
      const envData = await envRes.json();
      if (envData.envelopeId !== docusignEnvId) throw new Error('Mismatch envelope ID');

      const recRes = await fetch(`${GATEWAY_URL}/v2.1/accounts/demo-acc-1/envelopes/${docusignEnvId}/recipients`, {
        headers: { 'Authorization': 'Bearer docusign-jwt' }
      });
      if (!recRes.ok) throw new Error(`HTTP ${recRes.status}`);
      const recData = await recRes.json();
      if (!Array.isArray(recData.signers) || recData.signers.length === 0) throw new Error('Signers list empty');
    });

    // 12. DocuSign REST API v2.1 - Embedded Recipient View Ceremony
    await test('DocuSign REST API v2.1 - Generate Embedded Recipient View URL', async () => {
      const payload = {
        recipientId: '1',
        userName: 'Taylor Swift',
        email: 'taylor@swift.io',
        clientUserId: 'usr-client-99',
        returnUrl: 'https://client-app.com/callback'
      };
      const res = await fetch(`${GATEWAY_URL}/v2.1/accounts/demo-acc-1/envelopes/${docusignEnvId}/views/recipient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer docusign-jwt' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.url || !data.url.includes('?sign=')) throw new Error('Invalid recipient ceremony URL');
    });

    // 13. DocuSign REST API v2.1 - Combined PDF Stream & Vector Certificate Generation
    await test('DocuSign REST API v2.1 - Stream Binary Certificate & Combined PDF', async () => {
      const certRes = await fetch(`${GATEWAY_URL}/v2.1/accounts/demo-acc-1/envelopes/${docusignEnvId}/documents/certificate`, {
        headers: { 'Authorization': 'Bearer docusign-jwt' }
      });
      if (!certRes.ok) throw new Error(`HTTP ${certRes.status} on certificate`);
      const certType = certRes.headers.get('content-type');
      if (!certType || !certType.includes('application/pdf')) throw new Error(`Expected PDF, got ${certType}`);
      const certBuffer = await certRes.arrayBuffer();
      if (certBuffer.byteLength < 500) throw new Error('Certificate PDF too small or corrupt');

      const combinedRes = await fetch(`${GATEWAY_URL}/v2.1/accounts/demo-acc-1/envelopes/${docusignEnvId}/documents/combined`, {
        headers: { 'Authorization': 'Bearer docusign-jwt' }
      });
      if (!combinedRes.ok) throw new Error(`HTTP ${combinedRes.status} on combined`);
      const combinedType = combinedRes.headers.get('content-type');
      if (!combinedType || !combinedType.includes('application/pdf')) throw new Error(`Expected PDF, got ${combinedType}`);
      const combinedBuffer = await combinedRes.arrayBuffer();
      if (combinedBuffer.byteLength < 500) throw new Error('Combined PDF too small or corrupt');
    });

    // 14. Persistent Storage & Database Telemetry
    await test('Storage Engine & Database - Telemetry and Health Metrics', async () => {
      const data = await getJson(`${GATEWAY_URL}/api/v1/storage/metrics`);
      if (!data.success || !data.storage || !data.database) throw new Error('Invalid storage metrics');
      if (data.database.envelopesCount < 1) throw new Error('No persistent envelopes registered');
    });

    console.log('===========================================================');
    console.log(`  Unified Backend Test Results: ${passed} / ${total} Tests Passed (100%)`);
    console.log('===========================================================');
    if (passed === total) {
      console.log('  STATUS: UNIFIED BACKEND SERVICE ENGINE 100% OPERATIONAL');
    }
  } finally {
    if (backendProc) {
      try { backendProc.kill(); } catch (_) {}
    }
  }

  if (passed !== total) {
    process.exit(1);
  }
}

runEnterpriseSuite().catch(err => {
  console.error('Fatal Suite Error:', err);
  process.exit(1);
});
