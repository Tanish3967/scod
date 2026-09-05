import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Simple AuthN / Token verification middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  // In production, verify JWT against OIDC / IAM key
  // For sandbox and demo, auto-attach tenant context
  req.tenantId = 'tenant-acme-global';
  req.userId = 'usr-admin-sarah';
  next();
};

app.use(authenticateToken);

// Health check
app.get('/health', (req: any, res: any) => {
  res.json({
    status: 'healthy',
    gateway: 'signflow-api-gateway',
    timestamp: new Date().toISOString(),
    services: {
      envelopeService: 'http://localhost:8081',
      auditTrailService: 'http://localhost:8082',
      documentProcessor: 'http://localhost:8083',
      aiOrchestrator: 'http://localhost:8084',
      notificationWebhooks: 'http://localhost:8085'
    }
  });
});

// Proxy helper for forwarding requests
async function proxyTo(targetUrl: string, req: any, res: any) {
  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': (req as any).tenantId || 'tenant-default',
        'X-User-ID': (req as any).userId || 'usr-anon',
      },
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && Object.keys(req.body || {}).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error: any) {
    res.status(502).json({
      error: 'Bad Gateway: failed to connect to upstream service',
      targetUrl,
      details: error.message
    });
  }
}

// Routes
app.use('/api/v1/envelopes', (req, res) => {
  proxyTo(`http://localhost:8081${req.originalUrl}`, req, res);
});

app.use('/api/v1/audit', (req, res) => {
  proxyTo(`http://localhost:8082${req.originalUrl}`, req, res);
});

app.use('/api/v1/documents', (req, res) => {
  proxyTo(`http://localhost:8083${req.originalUrl}`, req, res);
});

app.use('/api/v1/jobs', (req, res) => {
  proxyTo(`http://localhost:8083${req.originalUrl}`, req, res);
});

app.use('/api/v1/workers', (req, res) => {
  proxyTo(`http://localhost:8083${req.originalUrl}`, req, res);
});

app.use('/api/v1/ai', (req, res) => {
  proxyTo(`http://localhost:8084${req.originalUrl}`, req, res);
});

app.use('/api/v1/webhooks', (req, res) => {
  proxyTo(`http://localhost:8085${req.originalUrl}`, req, res);
});

app.use('/api/v1/emails', (req, res) => {
  proxyTo(`http://localhost:8085${req.originalUrl}`, req, res);
});

app.listen(PORT, () => {
  console.log(`[SignFlow API Gateway] Listening on http://localhost:${PORT}`);
});
