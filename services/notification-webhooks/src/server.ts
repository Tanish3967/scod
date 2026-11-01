import express, { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { sendAgreementEmail, dispatchedEmailsLog } from './email_service';
import { globalESPFanoutMesh, ESPProvider, FanoutRecipient } from './fanout_mesh';

const app = express();
const PORT = process.env.PORT || 8085;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

interface WebhookLogItem {
  id: string;
  event: string;
  url: string;
  timestamp: string;
  statusCode: number;
  durationMs: number;
  signatureHmac: string;
  payload: any;
}

const deliveryLogs: WebhookLogItem[] = [];

// Helper to calculate HMAC SHA-256 signature header
function calculateHmac(payloadString: string, secret: string): string {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
}

// Health probe
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'notification-webhooks',
    version: '2.0.0-scale',
    timestamp: new Date().toISOString(),
    mesh_status: 'online'
  });
});

// Standardized Prometheus Metrics Exporter
app.get('/metrics', (req: Request, res: Response) => {
  const tele = globalESPFanoutMesh.getTelemetry();
  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  const metrics = `# HELP signflow_esp_dispatches_total Total transactional recipient notifications dispatched
# TYPE signflow_esp_dispatches_total counter
signflow_esp_dispatches_total ${tele.total_dispatches || 0}

# HELP signflow_esp_failovers_total Total automatic circuit breaker failovers
# TYPE signflow_esp_failovers_total counter
signflow_esp_failovers_total ${tele.total_failovers || 0}

# HELP signflow_esp_deduplications_total Total duplicate dispatches prevented by 24h idempotency engine
# TYPE signflow_esp_deduplications_total counter
signflow_esp_deduplications_total ${tele.total_deduplications || 0}

# HELP signflow_idempotency_keys_active Currently cached 24h idempotency deduplication keys
# TYPE signflow_idempotency_keys_active gauge
signflow_idempotency_keys_active ${tele.active_idempotency_keys || 0}

# HELP signflow_service_health Service health status (1 = healthy)
# TYPE signflow_service_health gauge
signflow_service_health{service="notification-webhooks"} 1
`;
  res.send(metrics);
});

// 1. Dispatch Webhook Event
app.post('/api/v1/webhooks/dispatch', (req: Request, res: Response) => {
  const { event = 'envelope.completed', payload = {}, targetUrl = 'https://api.acmeglobal.com/webhook', secret = 'whsec_sample_secret_key' } = req.body;

  const payloadString = JSON.stringify(payload);
  const signature = calculateHmac(payloadString, secret);

  const logItem: WebhookLogItem = {
    id: 'whlog_' + Math.random().toString(36).substring(2, 9),
    event,
    url: targetUrl,
    timestamp: new Date().toISOString(),
    statusCode: 200,
    durationMs: Math.floor(Math.random() * 60 + 20),
    signatureHmac: signature,
    payload
  };

  deliveryLogs.unshift(logItem);
  if (deliveryLogs.length > 50) deliveryLogs.pop();

  res.json({
    success: true,
    message: `Event "${event}" dispatched with signed header`,
    signature,
    deliveryLog: logItem
  });
});

// 2. Fetch Webhook Logs
app.get('/api/v1/webhooks/logs', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: deliveryLogs.length,
    logs: deliveryLogs
  });
});

// 3. Email Dispatch Endpoint (using Mesh with Automatic Failover)
app.post('/api/v1/emails/send', async (req: Request, res: Response) => {
  const {
    toEmail = 'signer@example.com',
    recipientName = 'Valued Signer',
    envelopeId = 'env-demo',
    envelopeTitle = 'Commercial Agreement',
    senderName = 'Alex Rivera',
    senderOrg = 'Acme Global Inc',
    magicLink = 'http://localhost:5174/?sign=' + envelopeId,
    accessCode,
    provider = 'resend',
    idempotencyKey
  } = req.body;

  const result = await globalESPFanoutMesh.sendWithFailover(
    { email: toEmail, name: recipientName, magicLink, accessCode },
    envelopeId,
    envelopeTitle,
    senderName,
    senderOrg,
    provider as ESPProvider,
    idempotencyKey
  );

  res.json({
    success: true,
    message: `Transactional email processed for ${toEmail}`,
    emailId: result.messageId,
    dispatchResult: result
  });
});

// 4. Batch Fan-Out Dispatching (Bulk Multi-Recipient with Micro-Batching & Idempotency)
app.post('/api/v1/emails/fanout', async (req: Request, res: Response) => {
  const {
    envelopeId = 'env-batch-fanout',
    envelopeTitle = 'Enterprise Global Agreement',
    senderName = 'Legal Operations',
    senderOrg = 'SignFlow Enterprise',
    recipients = [],
    preferredProvider = 'resend',
    idempotencyKey
  } = req.body;

  const batchResult = await globalESPFanoutMesh.fanoutBatch({
    envelopeId,
    envelopeTitle,
    senderName,
    senderOrg,
    recipients,
    preferredProvider,
    idempotencyKey
  });

  res.json({
    success: true,
    ...batchResult
  });
});

// 5. Mesh Telemetry & Provider Health
app.get('/api/v1/mesh/telemetry', (req: Request, res: Response) => {
  res.json({
    success: true,
    telemetry: globalESPFanoutMesh.getTelemetry()
  });
});

// 6. Circuit Breaker Simulation & Chaos Testing
app.post('/api/v1/mesh/circuit-breaker/trip', (req: Request, res: Response) => {
  const { provider = 'resend', state = 'OPEN' } = req.body;
  globalESPFanoutMesh.setCircuitState(provider as ESPProvider, state);

  res.json({
    success: true,
    message: `Circuit breaker for provider [${provider}] set to [${state}]`,
    telemetry: globalESPFanoutMesh.getTelemetry()
  });
});

// 7. Fetch Virtual Signer Inbox Logs
app.get('/api/v1/emails/inbox', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: dispatchedEmailsLog.length,
    emails: dispatchedEmailsLog
  });
});

app.listen(PORT, () => {
  console.log(`[SignFlow Webhook & Notification Service] Listening on http://localhost:${PORT} (Multi-Provider ESP Mesh Online)`);
});
