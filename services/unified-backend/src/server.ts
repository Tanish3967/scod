/**
 * SignFlow — Unified Backend Service Engine
 * 
 * Consolidates all microservice subsystems into an in-process, zero-network-hop,
 * ultra-low-latency backend mesh:
 *  - Envelopes & Sharding Module (/api/v1/envelopes)
 *  - Cryptographic Audit Trail & Merkle Ledger Module (/api/v1/audit)
 *  - Document Processing & Vector Seal Module (/api/v1/documents)
 *  - AI Orchestrator & Multi-Agent Swarm Drafter Module (/api/v1/ai)
 *  - Transactional Emails & HMAC Webhooks Module (/api/v1/emails, /api/v1/webhooks)
 *  - Edge Telemetry, Prometheus Metrics & Health Monitoring (/health, /metrics, /api/v1/edge/telemetry)
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createRateLimiter, edgeAuthMiddleware } from './rate_limiter.js';
import { createEnvelopeRouter } from './modules/envelopes.js';
import { createAuditRouter } from './modules/audit.js';
import { createDocumentsRouter } from './modules/documents.js';
import { createAiRouter } from './modules/ai.js';
import { createNotificationsRouter } from './modules/notifications.js';
import { createDocusignRouter, createDocusignOAuthRouter } from './modules/docusign_v2_1.js';
import { storageEngine } from './modules/storage.js';
import { persistentDb } from './modules/database.js';
import fs from 'fs';
import path from 'path';

// Load .env variables from root if present
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...rest] = trimmed.split('=');
        const val = rest.join('=').trim();
        if (key && !process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    }
  }
} catch (e) {
  // Ignore env loading errors
}

const app = express();
const PORT = process.env.PORT || 8090;

// Enable CORS for frontend and edge integrations
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-SignFlow-Signature', 'X-SignFlow-Timestamp', 'X-Service-Token', 'x-tenant-id']
}));

// Payload parsing with generous limits for high-DPI document payloads and raster vector blobs
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Global edge token rate limiter
app.use(createRateLimiter(500, 60000));

// Request telemetry logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  const method = req.method;
  
  _res.on('finish', () => {
    const duration = Date.now() - start;
    if (path !== '/health' && path !== '/metrics') {
      console.log(`[UnifiedBackend] ${method} ${path} -> ${_res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Module Subsystems
const envelopeRouter = createEnvelopeRouter();
const auditRouter = createAuditRouter();
const documentsRouter = createDocumentsRouter();
const aiRouter = createAiRouter();
const notificationsModule = createNotificationsRouter();
const docusignRouter = createDocusignRouter();
const docusignOAuthRouter = createDocusignOAuthRouter();

// Mount Subsystem Routers under /api/v1/
app.use('/api/v1/envelopes', envelopeRouter);
app.use('/api/v1/audit', auditRouter);
app.use('/api/v1/documents', documentsRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/emails', notificationsModule.emailRouter);
app.use('/api/v1/webhooks', notificationsModule.webhookRouter);

// Mount DocuSign v2.1 Wire-Compatible REST API
app.use('/v2.1/accounts', docusignRouter);
app.use('/oauth', docusignOAuthRouter);

// Persistent Storage & Database Telemetry
app.get('/api/v1/storage/metrics', (_req: Request, res: Response) => {
  res.json({
    success: true,
    storage: storageEngine.getStorageMetrics(),
    database: persistentDb.getStats()
  });
});

// System Health & Subsystem Mesh Discovery
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'signflow-unified-backend',
    version: '2.0.0-unified',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    modules: [
      { name: 'envelopes', status: 'online', path: '/api/v1/envelopes' },
      { name: 'audit_merkle_ledger', status: 'online', path: '/api/v1/audit' },
      { name: 'document_processor', status: 'online', path: '/api/v1/documents' },
      { name: 'ai_orchestrator', status: 'online', path: '/api/v1/ai' },
      { name: 'notification_webhooks', status: 'online', path: '/api/v1/emails & /api/v1/webhooks' },
      { name: 'docusign_v2_1_adapter', status: 'online', path: '/v2.1/accounts/:accountId/envelopes' },
      { name: 'cloud_storage_db', status: 'online', path: '/api/v1/storage/metrics' }
    ]
  });
});

// Prometheus & OpenTelemetry Metrics
app.get('/metrics', (_req: Request, res: Response) => {
  const mem = process.memoryUsage();
  const metrics = [
    '# HELP signflow_backend_uptime_seconds Process uptime in seconds',
    '# TYPE signflow_backend_uptime_seconds counter',
    `signflow_backend_uptime_seconds ${Math.floor(process.uptime())}`,
    '',
    '# HELP signflow_memory_heap_used_bytes Heap memory in use',
    '# TYPE signflow_memory_heap_used_bytes gauge',
    `signflow_memory_heap_used_bytes ${mem.heapUsed}`,
    '',
    '# HELP signflow_memory_heap_total_bytes Total allocated heap memory',
    '# TYPE signflow_memory_heap_total_bytes gauge',
    `signflow_memory_heap_total_bytes ${mem.heapTotal}`,
    '',
    '# HELP signflow_active_modules Active in-process subsystem modules',
    '# TYPE signflow_active_modules gauge',
    'signflow_active_modules 5'
  ].join('\n');
  
  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  res.send(metrics);
});

// Edge Telemetry Ingestion
app.post('/api/v1/edge/telemetry', (req: Request, res: Response) => {
  const event = req.body;
  console.log(`[EdgeTelemetry] Ingested event: ${event.type || 'generic'} from ${req.ip}`);
  res.json({
    received: true,
    timestamp: new Date().toISOString(),
    server_time_ms: Date.now()
  });
});

// Root Gateway Banner
app.get('/', (_req: Request, res: Response) => {
  res.json({
    platform: 'SignFlow Enterprise — Unified Backend Service Engine',
    version: '2.0.0',
    mesh_topology: 'In-Process Monolithic Engine (Zero Network Hops)',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      envelopes: '/api/v1/envelopes',
      audit: '/api/v1/audit',
      documents: '/api/v1/documents',
      ai: '/api/v1/ai',
      emails: '/api/v1/emails',
      webhooks: '/api/v1/webhooks',
      telemetry: '/api/v1/edge/telemetry',
      docusign_v2_1: '/v2.1/accounts/:accountId/envelopes',
      docusign_oauth: '/oauth/userinfo',
      storage_metrics: '/api/v1/storage/metrics'
    }
  });
});

// Global 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'NotFound',
    message: `Route ${req.method} ${req.path} not found on SignFlow Unified Backend Engine`,
    available_endpoints: ['/api/v1/envelopes', '/api/v1/audit', '/api/v1/documents', '/api/v1/ai', '/api/v1/emails', '/api/v1/webhooks', '/health']
  });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[UnifiedBackend][Error]', err);
  res.status(500).json({
    error: 'InternalServerError',
    message: err.message || 'An unexpected error occurred in the unified backend engine',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(`🚀 SignFlow Unified Backend Engine live on port ${PORT}`);
    console.log(`📡 In-Process Modules: Envelopes, Audit Ledger, Document Processor, AI Orchestrator, Notifications`);
    console.log(`🔗 API Gateway Base: http://localhost:${PORT}/api/v1/`);
    console.log(`🩺 Health Probe:     http://localhost:${PORT}/health`);
    console.log(`========================================================`);
  });
}

export default app;
