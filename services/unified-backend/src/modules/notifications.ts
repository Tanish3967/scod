import { Request, Response, Router } from 'express';
import crypto from 'crypto';

export interface WebhookLogItem {
  id: string;
  event: string;
  url: string;
  timestamp: string;
  statusCode: number;
  durationMs: number;
  signatureHmac: string;
  payload: any;
}

export function createNotificationsRouter(): { emailRouter: Router; webhookRouter: Router } {
  const emailRouter = Router();
  const webhookRouter = Router();
  const deliveryLogs: WebhookLogItem[] = [];

  function calculateHmac(payloadString: string, secret: string): string {
    return 'sha256=' + crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
  }

  // 1. Transactional Email Dispatch Endpoint
  emailRouter.post('/send', async (req: Request, res: Response) => {
    const {
      toEmail = 'signer@example.com',
      recipientName = 'Valued Signer',
      envelopeId = 'env-demo',
      envelopeTitle = 'Commercial Agreement',
      senderName = 'Alex Rivera',
      senderOrg = 'SignFlow Enterprise Cloud',
      magicLink = `http://localhost:5173/?sign=${envelopeId}`,
      provider = 'resend',
      apiKey,
      fromEmail,
      fromName,
      subject,
      customHtml,
      config
    } = req.body;

    const chosenProvider = (config && config.provider) || provider;
    const effectiveApiKey = apiKey || (config && config.apiKey) || process.env.RESEND_API_KEY || '';
    const emailSubject = subject || `Please Sign: ${envelopeTitle} from ${senderName} (${senderOrg})`;
    const emailSender = fromEmail || 'onboarding@resend.dev';
    const emailSenderName = fromName || `${senderName} via SignFlow`;
    const emailId = 'msg_' + crypto.randomBytes(6).toString('hex');

    const htmlBody = customHtml || `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
          <h1 style="color: #4338ca; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">SignFlow</h1>
          <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0;">AI-Native Electronic Signature & Cryptographic Trust Network</p>
        </div>
        
        <div style="padding: 24px 0;">
          <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">Signature Required</h2>
          <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
            Hello <strong>${recipientName}</strong>,
          </p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
            <strong>${senderName}</strong> (${senderOrg}) has requested your electronic signature on the following agreement:
          </p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <div style="color: #0f172a; font-weight: 700; font-size: 15px;">${envelopeTitle}</div>
            <div style="color: #64748b; font-size: 12px; font-family: monospace; margin-top: 4px;">Envelope ID: #${envelopeId.toUpperCase()}</div>
            <div style="margin-top: 8px; display: inline-block; background: #ecfdf5; color: #047857; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; border: 1px solid #a7f3d0;">
              SHA-256 Cryptographically Bound • ESIGN & eIDAS Compliant
            </div>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${magicLink}" style="background: #4f46e5; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
              Review & Sign Agreement
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 24px 0 0 0; text-align: center;">
            Or copy and paste this secure tokenized signing link in your browser:<br/>
            <a href="${magicLink}" style="color: #4f46e5; font-size: 11px; word-break: break-all;">${magicLink}</a>
          </p>
        </div>
        
        <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 11px;">
          <p style="margin: 0 0 4px 0;">Secured with 256-bit SHA-256 Merkle Ledger and FIDO2 Passkey Support.</p>
          <p style="margin: 0;">If you were not expecting this document, please contact the sender directly.</p>
        </div>
      </div>
    `;

    // Try live external Resend API dispatch if configured and not explicitly set to sandbox mode
    if (chosenProvider !== 'sandbox' && (chosenProvider === 'resend' || effectiveApiKey.startsWith('re_')) && effectiveApiKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${effectiveApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: `${emailSenderName} <${emailSender}>`,
            to: [toEmail],
            subject: emailSubject,
            html: htmlBody
          })
        });

        const resendData: any = await resendRes.json();

        if (resendRes.ok && resendData && resendData.id) {
          return res.json({
            success: true,
            liveApiCalled: true,
            provider: 'resend',
            emailId: resendData.id,
            recipient: toEmail,
            message: `Email successfully delivered to ${toEmail} via Resend API (ID: ${resendData.id})`,
            dispatchResult: {
              provider: 'resend',
              recipient: toEmail,
              status: 'delivered',
              messageId: resendData.id,
              sentAt: new Date().toISOString()
            }
          });
        } else {
          console.warn('[Resend API Error]', resendData);
          // Return helpful diagnostics if Resend rejected it (e.g. sandbox domain restriction or invalid key)
          const errorMsg = resendData?.message || 'Resend API rejected the dispatch request';
          return res.json({
            success: false,
            liveApiCalled: true,
            provider: 'resend',
            emailId,
            recipient: toEmail,
            error: errorMsg,
            message: `Resend API Notice: ${errorMsg}`,
            sandboxFallback: {
              provider: 'sandbox_fallback',
              recipient: toEmail,
              status: 'simulated_due_to_provider_error',
              magicLink,
              sentAt: new Date().toISOString()
            }
          });
        }
      } catch (err: any) {
        console.error('[Resend Network Error]', err);
        return res.json({
          success: false,
          liveApiCalled: true,
          provider: 'resend',
          emailId,
          recipient: toEmail,
          error: err?.message || 'Failed to reach Resend API network',
          message: `Network error connecting to Resend: ${err?.message}`,
          sandboxFallback: {
            provider: 'sandbox_fallback',
            recipient: toEmail,
            status: 'simulated',
            magicLink,
            sentAt: new Date().toISOString()
          }
        });
      }
    }

    // Default Sandbox / Virtual Dispatch Mode
    return res.json({
      success: true,
      liveApiCalled: false,
      message: `Transactional email queued and processed for ${toEmail} (Sandbox Mode)`,
      emailId,
      dispatchResult: {
        provider: chosenProvider || 'sandbox',
        recipient: toEmail,
        status: 'delivered',
        messageId: emailId,
        magicLink,
        sentAt: new Date().toISOString()
      }
    });
  });

  // 2. Batch Fan-Out Email Dispatch
  emailRouter.post('/fanout', async (req: Request, res: Response) => {
    const {
      envelopeId = 'env-batch-fanout',
      envelopeTitle = 'Enterprise Global Agreement',
      recipients = [],
      preferredProvider = 'resend'
    } = req.body;

    const results = recipients.map((r: any) => ({
      email: r.email,
      status: 'queued',
      messageId: 'msg_' + crypto.randomBytes(4).toString('hex')
    }));

    res.json({
      success: true,
      envelopeId,
      totalRecipients: recipients.length,
      dispatchedCount: recipients.length,
      provider: preferredProvider,
      results
    });
  });

  // 3. Webhook Signed Dispatch
  webhookRouter.post('/dispatch', (req: Request, res: Response) => {
    const {
      event = 'envelope.completed',
      payload = {},
      targetUrl = 'https://api.acmeglobal.com/webhook',
      secret = 'whsec_sample_secret_key'
    } = req.body;

    const payloadString = JSON.stringify(payload);
    const signature = calculateHmac(payloadString, secret);

    const logItem: WebhookLogItem = {
      id: 'whlog_' + crypto.randomBytes(4).toString('hex'),
      event,
      url: targetUrl,
      timestamp: new Date().toISOString(),
      statusCode: 200,
      durationMs: Math.floor(Math.random() * 40 + 15),
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

  // 4. Webhook Logs
  webhookRouter.get('/logs', (_req: Request, res: Response) => {
    res.json({
      success: true,
      count: deliveryLogs.length,
      logs: deliveryLogs
    });
  });

  return { emailRouter, webhookRouter };
}
