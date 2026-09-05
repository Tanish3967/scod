import express, { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { sendAgreementEmail, dispatchedEmailsLog } from './email_service';

const app = express();
const PORT = process.env.PORT || 8085;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

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

// 3. Email Dispatch Endpoint
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
    config = { provider: 'sandbox' }
  } = req.body;

  const result = await sendAgreementEmail(
    toEmail,
    recipientName,
    envelopeId,
    envelopeTitle,
    senderName,
    senderOrg,
    magicLink,
    accessCode,
    config
  );

  res.json({
    success: true,
    message: `Transactional email sent to ${toEmail}`,
    emailId: result.id,
    provider: result.provider
  });
});

// 4. Fetch Virtual Signer Inbox Logs
app.get('/api/v1/emails/inbox', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: dispatchedEmailsLog.length,
    emails: dispatchedEmailsLog
  });
});

app.listen(PORT, () => {
  console.log(`[SignFlow Webhook & Notification Service] Listening on http://localhost:${PORT}`);
});
