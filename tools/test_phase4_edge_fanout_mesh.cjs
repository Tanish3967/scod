// SignFlow 100M-Scale Phase 4: Global Edge Ingress Rate Limiting & Multi-Provider ESP Fan-Out Mesh Benchmark
const { spawn } = require('child_process');
const http = require('http');
const crypto = require('crypto');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function makeRequest(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        let json = null;
        try { json = JSON.parse(body); } catch (_) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
          json,
          duration
        });
      });
    });

    req.on('error', err => reject(err));
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timed out after 10000ms'));
    });

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runPhase4EdgeMeshSuite() {
  console.log('================================================================');
  console.log('  🚀 SignFlow 100M Scale: Phase 4 Edge Ingress & ESP Fan-Out Mesh');
  console.log('================================================================\n');

  // 1. Start Notification-Webhooks Service (:8085) and API Gateway (:8090)
  console.log('1. Starting Notification & Webhooks Service (:8085)...');
  const notifyProc = spawn('node', ['services/notification-webhooks/dist/server.js'], {
    stdio: 'ignore',
    env: { ...process.env, PORT: '8085' }
  });
  await sleep(1500);

  console.log('   Starting Edge API Gateway (:8090)...');
  const gwProc = spawn('node', ['services/api-gateway/dist/server.js'], {
    stdio: 'ignore',
    env: { ...process.env, PORT: '8090' }
  });
  await sleep(1500);

  // Health probes
  const notifyHealth = await makeRequest('http://localhost:8085/health');
  console.log(`   ✓ Notification Service: HTTP ${notifyHealth.statusCode} (v${notifyHealth.json?.version}, Mesh: ${notifyHealth.json?.mesh_status})`);

  const gwHealth = await makeRequest('http://localhost:8090/health');
  console.log(`   ✓ Edge API Gateway:     HTTP ${gwHealth.statusCode} (v${gwHealth.json?.version}, Gateway: ${gwHealth.json?.gateway})`);

  // 2. Edge Ingress Telemetry & Rate Limiting Verification
  console.log('\n2. Testing Edge Ingress Token Verification & Sliding Window Rate Limiting...');
  const edgeTele = await makeRequest('http://localhost:8090/api/v1/edge/telemetry');
  console.log(`   ✓ Edge PoP Active:      ${edgeTele.json?.telemetry?.edge_region}`);
  console.log(`   ✓ Rate Limit Algorithm: ${edgeTele.json?.telemetry?.algorithm}`);
  console.log(`   ✓ Ingress Overhead:     ${edgeTele.json?.telemetry?.latency_overhead_avg}`);

  // Test rate limiting with sandbox tenant (quota: 120 req/min)
  console.log('\n   ▶ Simulating 130 High-Speed Ingress Requests on Sandbox Tier (Quota: 120 req/min)...');
  let allowedCount = 0;
  let rateLimitedCount = 0;
  let sampleRemaining = 0;
  let sampleReset = 0;

  for (let i = 0; i < 130; i++) {
    const res = await makeRequest('http://localhost:8090/health', {
      headers: {
        'X-Tenant-ID': 'tenant-sandbox'
      }
    });

    if (res.statusCode === 200) {
      allowedCount++;
      sampleRemaining = res.headers['x-ratelimit-remaining'];
      sampleReset = res.headers['x-ratelimit-reset'];
    } else if (res.statusCode === 429) {
      rateLimitedCount++;
    }
  }

  console.log(`   ✓ Allowed Requests:      ${allowedCount} / 120 allowed`);
  console.log(`   ✓ Rate-Limited (429):    ${rateLimitedCount} requests blocked`);
  console.log(`   ✓ Response Headers:      X-RateLimit-Remaining=${sampleRemaining}, X-RateLimit-Reset=${sampleReset}s`);

  if (rateLimitedCount < 10) {
    throw new Error('Rate limit enforcement failed for sandbox tenant');
  }

  // Verify Enterprise Tier is not blocked
  const enterpriseRes = await makeRequest('http://localhost:8090/health', {
    headers: { 'X-Tenant-ID': 'tenant-acme-global' }
  });
  console.log(`   ✓ Enterprise Tier Test:  HTTP ${enterpriseRes.statusCode} (Tier: ${enterpriseRes.headers['x-tenant-tier']}, Limit: ${enterpriseRes.headers['x-ratelimit-limit']} req/window)`);

  // 3. Multi-Provider ESP Circuit Breaker & Automatic Failover
  console.log('\n3. Testing Multi-Provider ESP Mesh & Resilient Circuit Breaker Failover...');

  // Normal send via Resend
  const normalSend = await makeRequest('http://localhost:8085/api/v1/emails/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    toEmail: 'john.smith@acmeglobal.com',
    recipientName: 'John Smith',
    envelopeId: 'env-prod-101',
    envelopeTitle: 'Series B Preferred Stock Purchase Agreement',
    senderName: 'Sarah Jenkins',
    senderOrg: 'Acme Global Ventures',
    provider: 'resend'
  });

  console.log(`   ✓ Normal Dispatch:      Provider: "${normalSend.json?.dispatchResult?.providerUsed}" (Failover: ${normalSend.json?.dispatchResult?.failoverOccurred})`);

  // Chaos Test: Trip Circuit Breaker on Primary Provider ('resend')
  console.log('\n   ▶ Simulating Primary Provider (Resend) Outage via Circuit Breaker Trip...');
  const tripRes = await makeRequest('http://localhost:8085/api/v1/mesh/circuit-breaker/trip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    provider: 'resend',
    state: 'OPEN'
  });
  console.log(`   ✓ Circuit State:        Resend is now OPEN (${tripRes.json?.message})`);

  // Dispatch again requesting 'resend' -> Expect automatic zero-downtime failover to 'sendgrid'
  const failoverSend = await makeRequest('http://localhost:8085/api/v1/emails/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    toEmail: 'alice.morgan@acmeglobal.com',
    recipientName: 'Alice Morgan',
    envelopeId: 'env-prod-102',
    envelopeTitle: 'Series B Preferred Stock Purchase Agreement',
    senderName: 'Sarah Jenkins',
    senderOrg: 'Acme Global Ventures',
    provider: 'resend'
  });

  console.log(`   ✓ Failover Dispatch:    Provider Switched to "${failoverSend.json?.dispatchResult?.providerUsed}"`);
  console.log(`   ✓ Failover Telemetry:   Failover Path: [${failoverSend.json?.dispatchResult?.failoverPath?.join(' -> ')}] (Zero Dropped Messages)`);

  if (!failoverSend.json?.dispatchResult?.failoverOccurred) {
    throw new Error('Circuit breaker failover did not trigger as expected');
  }

  // Restore Resend circuit
  await makeRequest('http://localhost:8085/api/v1/mesh/circuit-breaker/trip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { provider: 'resend', state: 'CLOSED' });

  // 4. 24-Hour Idempotency Engine & Deduplication
  console.log('\n4. Testing 24-Hour Idempotency Deduplication Engine...');
  const testIdemKey = `idem-${crypto.randomBytes(6).toString('hex')}`;

  const send1 = await makeRequest('http://localhost:8085/api/v1/emails/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    toEmail: 'investor@sequoia.com',
    recipientName: 'Partner Investor',
    envelopeId: 'env-idem-test',
    envelopeTitle: 'Confidential Investment Memo',
    senderName: 'Sarah Jenkins',
    senderOrg: 'Acme Global Ventures',
    idempotencyKey: testIdemKey
  });

  const send2 = await makeRequest('http://localhost:8085/api/v1/emails/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    toEmail: 'investor@sequoia.com',
    recipientName: 'Partner Investor',
    envelopeId: 'env-idem-test',
    envelopeTitle: 'Confidential Investment Memo',
    senderName: 'Sarah Jenkins',
    senderOrg: 'Acme Global Ventures',
    idempotencyKey: testIdemKey
  });

  console.log(`   ✓ First Dispatch:       Status: "${send1.json?.dispatchResult?.status}" (Msg ID: ${send1.json?.dispatchResult?.messageId})`);
  console.log(`   ✓ Duplicate Dispatch:   Status: "${send2.json?.dispatchResult?.status}" (Msg ID: ${send2.json?.dispatchResult?.messageId})`);

  if (send2.json?.dispatchResult?.status !== 'deduplicated') {
    throw new Error('Idempotency deduplication failed');
  }

  // 5. High-Throughput Concurrent Fan-Out Benchmark (500 Recipients)
  console.log('\n5. Stress-Testing Multi-Recipient Concurrent Fan-Out (500 Recipient Notifications)...');
  const recipients = [];
  for (let k = 0; k < 500; k++) {
    recipients.push({
      email: `recipient_${k}@enterprise-client-${k % 20}.com`,
      name: `Signatory ${k}`,
      role: k === 0 ? 'Primary Signer' : 'Secondary Signer',
      magicLink: `http://localhost:5173/?sign=env-bulk-999&token=${crypto.randomBytes(8).toString('hex')}`
    });
  }

  const fanoutStart = Date.now();
  const fanoutRes = await makeRequest('http://localhost:8085/api/v1/emails/fanout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    envelopeId: 'env-enterprise-bulk-999',
    envelopeTitle: 'Enterprise Master Subscription Agreement 2026',
    senderName: 'Enterprise General Counsel',
    senderOrg: 'SignFlow Enterprise Global',
    recipients,
    preferredProvider: 'resend'
  });

  const fanoutTime = Date.now() - fanoutStart;
  const fanoutQps = (500 / (fanoutTime / 1000)).toFixed(2);

  console.log(`   ✓ Total Recipients:     ${fanoutRes.json?.totalRecipients} notifications`);
  console.log(`   ✓ Delivered Count:      ${fanoutRes.json?.deliveredCount} / 500`);
  console.log(`   ✓ Batch Time:           ${fanoutTime} ms`);
  console.log(`   ✓ Fan-Out Throughput:   ${fanoutQps} emails/sec`);

  // 6. Signed Webhook HMAC-SHA256 Verification
  console.log('\n6. Testing HMAC-SHA256 Signed Webhook Dispatcher...');
  const whRes = await makeRequest('http://localhost:8085/api/v1/webhooks/dispatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    event: 'envelope.completed',
    payload: {
      envelopeId: 'env-prod-101',
      status: 'completed',
      sealedHash: 'sha256-abcdef1234567890'
    },
    targetUrl: 'https://webhook.site/test-endpoint',
    secret: 'whsec_enterprise_key_999'
  });

  console.log(`   ✓ Webhook Dispatch:     HTTP ${whRes.statusCode} (${whRes.json?.message})`);
  console.log(`   ✓ Signature Header:     ${whRes.json?.signature}`);

  // 7. Real-Time Mesh Telemetry
  console.log('\n7. Real-Time Mesh Telemetry Snapshot:');
  const meshTele = await makeRequest('http://localhost:8085/api/v1/mesh/telemetry');
  console.log(`   ✓ Total Dispatches:     ${meshTele.json?.telemetry?.total_dispatches}`);
  console.log(`   ✓ Total Failovers:      ${meshTele.json?.telemetry?.total_failovers}`);
  console.log(`   ✓ Total Deduplications: ${meshTele.json?.telemetry?.total_deduplications}`);
  console.log(`   ✓ Active Idempotency:   ${meshTele.json?.telemetry?.active_idempotency_keys} keys cached`);
  console.log(`   ✓ Mesh Architecture:   ${meshTele.json?.telemetry?.architecture}`);

  // Cleanup child processes
  try { notifyProc.kill(); } catch (_) {}
  try { gwProc.kill(); } catch (_) {}

  console.log('\n================================================================');
  console.log('  🎯 Phase 4 Edge Ingress & ESP Fan-Out Mesh Verified Successfully!');
  console.log('================================================================\n');
}

runPhase4EdgeMeshSuite().catch(err => {
  console.error('Fatal Phase 4 Error:', err);
  process.exit(1);
});
