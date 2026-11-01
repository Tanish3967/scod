import express from 'express';
import cors from 'cors';
import { globalEdgeRateLimiter, TIER_CONFIGS } from './rate_limiter';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Edge Ingress Token Verification & Multi-Tenant Rate Limiting Middleware
const edgeIngressMiddleware = (req: any, res: any, next: any) => {
  if (req.path === '/health' || req.path === '/metrics' || req.path === '/api/v1/edge/telemetry') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const tokenResult = globalEdgeRateLimiter.verifyEdgeToken(authHeader);

  if (!tokenResult.valid) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: tokenResult.error || 'Invalid edge security credentials'
    });
  }

  // Tenant ID from token or request header
  const tenantId = req.headers['x-tenant-id'] || tokenResult.tenantId;
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';

  req.tenantId = tenantId;
  req.userId = tokenResult.userId;
  req.userScope = tokenResult.scope;

  // Evaluate Rate Limits
  const rateLimitStatus = globalEdgeRateLimiter.checkLimit(tenantId, clientIp);

  res.setHeader('X-RateLimit-Limit', rateLimitStatus.limit.toString());
  res.setHeader('X-RateLimit-Remaining', rateLimitStatus.remaining.toString());
  res.setHeader('X-RateLimit-Reset', rateLimitStatus.resetInSec.toString());
  res.setHeader('X-Edge-PoP', rateLimitStatus.edgeRegion);
  res.setHeader('X-Tenant-Tier', rateLimitStatus.tier);

  if (!rateLimitStatus.allowed) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit quota exceeded for tier [${rateLimitStatus.tier}]. Limit: ${rateLimitStatus.limit} requests/window.`,
      retryAfterSeconds: rateLimitStatus.resetInSec
    });
  }

  next();
};

app.use(edgeIngressMiddleware);

// Health check
app.get('/health', (req: any, res: any) => {
  res.json({
    status: 'healthy',
    gateway: 'signflow-api-gateway',
    version: '2.0.0-scale',
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

// Edge Ingress Telemetry & Tier Configurations
app.get('/api/v1/edge/telemetry', (req: any, res: any) => {
  res.json({
    success: true,
    telemetry: globalEdgeRateLimiter.getTelemetry(),
    tiers: TIER_CONFIGS
  });
});

// Standardized Prometheus Metrics Exporter
app.get('/metrics', (req: any, res: any) => {
  const tele = globalEdgeRateLimiter.getTelemetry();
  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  const metrics = `# HELP signflow_edge_requests_total Total edge ingress HTTP requests evaluated
# TYPE signflow_edge_requests_total counter
signflow_edge_requests_total ${tele.total_requests_evaluated || 0}

# HELP signflow_edge_ratelimit_blocked_total Total 429 rate-limited requests
# TYPE signflow_edge_ratelimit_blocked_total counter
signflow_edge_ratelimit_blocked_total ${tele.total_rate_limited_requests || 0}

# HELP signflow_edge_active_buckets Current active sliding-window rate limit buckets
# TYPE signflow_edge_active_buckets gauge
signflow_edge_active_buckets ${tele.active_rate_limit_buckets || 0}

# HELP signflow_service_health Service health status (1 = healthy)
# TYPE signflow_service_health gauge
signflow_service_health{service="api-gateway"} 1
`;
  res.send(metrics);
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
        'X-Correlation-ID': req.headers['x-correlation-id'] || `gw-${Date.now()}`
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

app.use('/api/v1/mesh', (req, res) => {
  proxyTo(`http://localhost:8085${req.originalUrl}`, req, res);
});

app.listen(PORT, () => {
  console.log(`[SignFlow API Gateway] Listening on http://localhost:${PORT} (Edge Rate Limiter & Token Verification Active)`);
});

