# SignFlow — Enterprise Project Memory & System Architecture

> **CRITICAL PERSISTENT MEMORY**: This document serves as the master architectural reference, system memory, workflow blueprint, and operational guide for the **SignFlow** platform.

---

## 1. Project Overview & Identity

- **Platform Name**: **SignFlow** (AI-Native Electronic Signatures, Contract Lifecycle Management, DocuSign Parity & Remote Online Notarization).
- **Core Value Proposition**: 100% DocuSign / Adobe Sign commercial-grade parity combined with autonomous AI legal intelligence, EU eIDAS Qualified Electronic Signatures (QES), Remote Online Notarization (RON) with live webcam biometrics, and SHA-256 tamper-evident Merkle sealing.
- **Frontend Stack**: React 19, TypeScript 5.7+, Vite 8, Tailwind CSS v4, Lucide Icons, Canvas API, PDF.js, Web Crypto API, IndexedDB.
- **Backend Stack**: Unified Backend Service Engine (`services/unified-backend/` on `:8090` / `:8080`) with in-process zero-network-hop modules:
  - `DocuSign eSignature REST API v2.1 Wire Adapter` (`/v2.1/accounts/:accountId/envelopes`)
  - `Envelopes & Sharding Module` (`/api/v1/envelopes` with 16-shard consistent hash)
  - `Cryptographic Merkle Audit Ledger Module` (`/api/v1/audit`)
  - `Document Processing & Layout Engine` (`/api/v1/documents`)
  - `AI Orchestrator & Swarm Drafter Module` (`/api/v1/ai`)
  - `Transactional Emails & HMAC Webhooks Module` (`/api/v1/emails`, `/api/v1/webhooks`)
  - `Cloud Document Storage & Database Store` (`services/unified-backend/data/`)
  - `Edge Telemetry & Prometheus Metrics` (`/health`, `/metrics`, `/api/v1/edge/telemetry`)
- **Containerization**: Docker Compose (`docker-compose.yml`, `Dockerfile`, `Dockerfile.backend`, `nginx.conf`).
- **Local Runners**: `run_local.bat` (automated port clearing & concurrent launch), `start.bat`, `stop.bat`, `docker_run.bat`.

---

## 2. Directory Layout & Critical File Reference

```
c:/Users/KIIT/Desktop/scod/
├── src/
│   ├── components/
│   │   ├── dashboard/       # DashboardOverview.tsx, EnvelopePipeline.tsx (KPIs, sparklines)
│   │   ├── prepare/         # DocumentPrepStudio.tsx (7-Tab flagship studio), ShareEnvelopeModal.tsx, FieldPalette.tsx
│   │   ├── signatures/      # CustomSignatureModal.tsx (5-tab designer: Draw, Fonts, Upload, Seal, Vault)
│   │   ├── signing/         # SigningExperience.tsx (Guided Signer UX, QR mobile sync, WebAuthn Passkey), SignSuccessModal.tsx
│   │   ├── notary/          # NotarySessionView.tsx (Live getUserMedia webcam, Biometric HUD, State Seal)
│   │   ├── envelopes/       # EnvelopeVaultList.tsx, CreateEnvelopeModal.tsx (PDF.js rasterizer, templates, AI drafter)
│   │   ├── certificate/     # CertificateOfCompletionModal.tsx (Cryptographic audit ledger & PDF export)
│   │   ├── layout/          # Navbar.tsx, Sidebar.tsx, NotificationToast.tsx, NotificationCenterDrawer.tsx
│   │   ├── compliance/      # QESTSPVerificationView.tsx (EU eIDAS Tier 3 QES & TSP Hub)
│   │   ├── admin/           # LocalDatabaseManagerView.tsx, EmailDispatcherConsole.tsx, ComplianceTrustCenter.tsx
│   │   ├── ai/              # AILegalHub.tsx, ContractQABot.tsx, AIDraftingStudio.tsx (6-agent long-form drafter)
│   │   ├── clm/             # AINegotiationWorkbench.tsx (Side-by-side redlining & negotiation)
│   │   ├── collaborate/     # LiveCoBrowsingRoom.tsx (Multi-party WebRTC cursor collaboration)
│   │   ├── integrations/    # CRMSyncHub.tsx (Salesforce & HubSpot bidirectional sync)
│   │   ├── offline/         # OfflineSigningQueue.tsx (Service Worker & IndexedDB mobile PWA queue)
│   │   ├── migration/       # LegacyMigrationImporterView.tsx (Batch XML/PDF DocuSign converter)
│   │   └── workflows/       # WorkflowCanvasBuilder.tsx (Visual drag-and-drop routing canvas with Save/Exit modal)
│   ├── context/
│   │   └── SignFlowContext.tsx  # Master state machine, IndexedDB persistence, sealing, unlock actions, deep linking
│   ├── types/
│   │   └── signflow.ts      # Core TypeScript interfaces (Envelope, DocumentField, CustomSignature, Recipient, AuditEvent)
│   ├── utils/
│   │   ├── pdfFlattener.ts  # Client-side ISO 32000 PDF burning engine with Certificate of Completion appending
│   │   ├── cryptoUtils.ts   # SHA-256 hashing, HMAC signatures, UUID generator, formatTimestamp
│   │   ├── pdfRasterizer.ts # Client-side PDF.js high-DPI page rasterizer & text extractor
│   │   ├── documentParser.ts # Multi-format document parser (.pdf, .docx, .md, .txt) with vector canvas rendering
│   │   ├── aiMultiAgentDrafter.ts # Multi-agent collaborative long-form drafting engine (5-50+ pages)
│   │   ├── aiEngine.ts      # Smart field detection, risk scanning, obligation extraction
│   │   ├── localDatabase.ts # Browser IndexedDB storage manager (5 stores, backup export/import)
│   │   └── downloadUtils.ts # RFC-4180 CSV and JSON file download handlers
│   ├── index.css            # Stitch Obsidian & Lumina precision design tokens, typography, keyframes
│   └── App.tsx              # Router, global modal mounts, and active view switcher
├── services/
│   └── unified-backend/     # Unified In-Process Node/Express Engine
│       ├── src/
│       │   ├── server.ts             # Gateway server mounting all routes, health probe, and metrics
│       │   ├── rate_limiter.ts       # Sliding-window tenant rate limiter
│       │   └── modules/
│       │       ├── docusign_v2_1.ts   # DocuSign REST API v2.1 Wire-Compatible Adapter & OAuth
│       │       ├── envelopes.ts       # In-memory consistent hash router (16 shards) & state machine
│       │       ├── database.ts        # Atomic JSON disk-backed database (signflow_db.json)
│       │       ├── storage.ts         # LocalStorageProvider & S3 cloud storage abstraction
│       │       ├── server_pdf.ts      # Server-side pdf-lib vector Certificate & flattening engine
│       │       ├── audit.ts           # SHA-256 Merkle chain event recording
│       │       ├── documents.ts       # Document layout & geometry analyzer
│       │       ├── ai.ts              # Legal playbook risk scanner & vault RAG Q&A
│       │       └── notifications.ts   # Transactional email gateway & HMAC-SHA256 webhook dispatcher
│       ├── data/                    # Persistent storage (data/storage/ & data/db/)
│       ├── package.json             # Backend dependencies (express, cors, pdf-lib, typescript)
│       └── tsconfig.json            # CommonJS backend TypeScript config
├── docker-compose.yml       # Production multi-service Docker configuration
├── docker-compose.dev.yml   # Development Docker configuration with hot reload
├── Dockerfile               # Multi-stage production frontend Dockerfile (Node -> Nginx)
├── Dockerfile.backend       # Production backend Dockerfile
├── nginx.conf               # Nginx reverse proxy configuration for SPA & backend API routing
├── run_local.bat            # 1-Click local launch script with automatic port conflict clearance
├── start.bat                # Standard local launch script
├── stop.bat                 # 1-Click process terminator and port releaser
├── docker_run.bat           # 1-Click Docker Compose runner
├── tools/
│   ├── run_e2e_suite.js     # Automated 14-test end-to-end integration test runner
│   ├── run_load_stress_suite.js # 100M-scale benchmark load stress harness
│   └── rea_docusign_workflow.mjs # REA reverse-engineering workflow tool
├── feature_checklist.md     # Master feature inventory and compliance checklist
├── GRAPH_REPORT.md          # Architectural knowledge graph report
└── AGENTS.md                # AI Agent memory and operational rulebook
```

---

## 3. Core Implemented Workflows & Business Logic

### A. Binary PDF Flattening Engine (`pdfFlattener.ts` & `server_pdf.ts`)
- **Standard**: Burns vector signatures, handwritten cursive strokes, dates, initials, and text fields directly into standard ISO 32000 PDF content streams using `pdf-lib`.
- **Coordinate Conversion**: Transforms web percentage coordinates (origin: top-left, 680px paper baseline) into standard PDF point coordinates (origin: bottom-left):
  $$x_{\text{pdf}} = \frac{\text{field.x}}{100} \times \text{pageWidth}$$
  $$y_{\text{pdf}} = \text{pageHeight} - \left(\frac{\text{field.y}}{100} \times \text{pageHeight}\right) - \text{fieldHeight}_{\text{pdf}}$$
- **Certificate Appending**: Automatically creates a high-DPI vector **Certificate of Completion** as the final page, embedding:
  - Document Title and Envelope ID
  - Signer Audit Table (Name, Email, Timestamp, IP, Auth Level, Signature Status)
  - Cryptographic Merkle Root SHA-256 Checksum
  - Compliance Attestation (US ESIGN Act §101, UETA, EU eIDAS QES)
- **Direct Downloads**: Available in `CertificateOfCompletionModal.tsx`, `DocumentPrepStudio.tsx` (locked banner), and `SignSuccessModal.tsx`.

---

### B. DocuSign eSignature REST API v2.1 Wire-Compatible Adapter (`docusign_v2_1.ts`)
Allows external DocuSign SDKs (Node, Python, Java, C#, Go) to interact with SignFlow with zero code changes:
- `POST /v2.1/accounts/:accountId/envelopes`: Accepts DocuSign JSON payloads (`emailSubject`, `documents` base64 streams, `recipients.signers` with `signHereTabs`, `dateSignedTabs`, `textTabs`, `carbonCopies`). Decodes base64 documents into storage and persists records to the database.
- `GET /v2.1/accounts/:accountId/envelopes/:envelopeId`: Returns envelope status (`created`, `sent`, `delivered`, `completed`, `voided`), URIs, and timestamps.
- `GET /v2.1/accounts/:accountId/envelopes/:envelopeId/recipients`: Returns signers and carbon copies roster with routing order and signature timestamps.
- `GET /v2.1/accounts/:accountId/envelopes/:envelopeId/documents`: Lists documents (`combined`, `certificate`, and individual docs).
- `GET /v2.1/accounts/:accountId/envelopes/:envelopeId/documents/:documentId`: Serves raw binary PDF streams (`application/pdf`) for `combined`, `certificate`, or uploaded documents.
- `POST /v2.1/accounts/:accountId/envelopes/:envelopeId/views/recipient`: Generates DocuSign embedded ceremony URLs (`/?sign=<envelopeId>&signer=<recipientId>&returnUrl=...`) that directly launch SignFlow's Guided Signer UX.
- `GET /v2.1/accounts/:accountId/envelopes/:envelopeId/audit_events`: Emits DocuSign audit log format.
- `PUT /v2.1/accounts/:accountId/envelopes/:envelopeId/status`: Supports voiding agreements with `voidedReason`.
- `GET /oauth/userinfo` & `POST /oauth/token`: DocuSign OAuth2 discovery routes for client SDK initialization.

---

### C. Cloud Storage & Persistent Database Layer (`storage.ts` & `database.ts`)
- **Document Storage**: `LocalStorageProvider` persists raw uploaded PDFs, generated signed documents, and certificates to disk (`services/unified-backend/data/storage/`) with SHA-256 ETags and content-addressable storage keys. Ready for AWS S3 / Cloudflare R2 via `StorageProvider` interface.
- **Persistent Database**: Atomic write-ahead JSON database store (`services/unified-backend/data/db/signflow_db.json`) maintaining envelopes, document metadata, audit logs, and DocuSign ID mappings across server restarts.
- **Telemetry**: Exposed at `GET /api/v1/storage/metrics`.

---

### D. Interactive 7-Tab Document Studio (`DocumentPrepStudio.tsx`)
- **Tab 1 (`Document`)**: Spacious 680px paper canvas with thumbnail selector, zoom controls, field placement palette, and custom signature blocks.
- **Tab 2 (`Workflow`)**: Visual flowchart pipeline showing sequential steps, branch gates, and 1-click fullscreen canvas launcher.
- **Tab 3 (`Signers`)**: Signers & recipients hub with delivery/signature status pills, auth badges, `+ Add Signer` modal, custom signature design shortcuts, and live signing simulation triggers.
- **Tab 4 (`History`)**: Document revision timeline (v2.0 Active Live, v1.1 Counterparty Amendments, v1.0 Genesis Draft), legal justification logs, author attribution, and redline export.
- **Tab 5 (`Activity`)**: Chronological real-time security telemetry stream with actor IPs, geolocations, devices, user-agents, timestamps, category filters, and CSV download.
- **Tab 6 (`Attachments`)**: Supporting exhibits & addenda vault with SHA-256 checksum badges, drag-and-drop uploader, mandatory review toggles, preview, and download actions.
- **Tab 7 (`Audit Trail`)**: Tamper-evident SHA-256 Merkle ledger, root hash badge, anchored ledger blocks with previous/current hashes, live Merkle chain integrity validator, and 1-click Certificate of Completion trigger.

---

### E. Remote Online Notarization (RON) Studio (`NotarySessionView.tsx`)
- **Hardware Camera**: Directly captures real webcam video and microphone audio via `navigator.mediaDevices.getUserMedia`.
- **Biometric HUD Overlay**: Green corner tracking brackets with live liveness score (`✓ Biometric Face Tracked (99.8%)`) and signer identity tag (`Marcus Vance (IDV Verified)`).
- **Recording Telemetry**: Live encrypted recording timer (`REC 🔴`), stream resolution badge (`1080p Encrypted Feed`), audio waveform active meters, and IDV credential check.
- **Official Seal**: Affixes State of Texas digital notary seal and logs entry into the local database journal.

---

### F. Deep Linking Engine & URL State Synchronization (`SignFlowContext.tsx`)
- **Synchronous URL State Bootstrapping**: Initializes `activeView`, `activeEnvelopeId`, and `activeSigningRecipientId` synchronously from `window.location.search` on initial render to eliminate dashboard fallback race conditions.
- **Deep Link Routing Matrix**:
  - `/?sign=<envelopeId>&signer=<recipientId>` &rarr; Launches full-screen Guided Signer Experience.
  - `/?preview=<envelopeId>`, `/?envelope=<envelopeId>`, or `/?doc=<envelopeId>` &rarr; Opens Document Prep Studio.
  - `/?cert=<envelopeId>` &rarr; Opens the cryptographic Certificate of Completion modal.
  - `/?view=<viewName>` (`dashboard`, `envelopes`, `notary`, `compliance`, `ai-hub`, `clm-workbench`, etc.).

---

### G. Docker Containerization & Local Batch Runners
- **Production Docker Compose** (`docker compose up --build -d`):
  - `web-client`: Nginx Alpine container serving the React SPA on port `5173`, with internal reverse proxy routing `/api/`, `/v2.1/`, `/health`, and `/oauth/` to `unified-backend:8090` without CORS issues.
  - `unified-backend`: Node 20 Alpine container running on port `8090` with persistent volume `signflow-data`.
- **Development Docker Compose** (`docker compose -f docker-compose.dev.yml up`):
  - Bind mounts local source code with Vite HMR and TypeScript watch mode.
- **1-Click Local Runner** (`run_local.bat`):
  - Scans ports `5173` and `8090`, kills stale processes to prevent `EADDRINUSE`, installs dependencies if missing, compiles the latest backend, launches both services in dedicated windows, and opens the browser.

---

## 4. Development & Build Commands

```bash
# 1. 1-Click Launch (Recommended for Local Dev)
run_local.bat      # Automatically clears ports, compiles backend, starts Vite & Backend, opens browser

# 2. 1-Click Terminate
stop.bat           # Gracefully terminates all background services and frees ports

# 3. Docker Production Deployment
docker compose up --build -d
docker compose down

# 4. Docker Development (with Hot Reload)
docker compose -f docker-compose.dev.yml up

# 5. Build for Production
npm run build          # Compiles React/Vite (Must exit with code 0)
npm run backend:build  # Compiles Unified Backend TypeScript (Must exit with code 0)

# 6. Automated E2E Test Suite (14 Tests)
node tools/run_e2e_suite.js

# 7. CodyMaster Agent CLI & Diagnostics
npm run cm             # CodyMaster CLI assistant
npm run cm:status      # Check installed skills & active workspace state
npm run cm:doctor      # Verify environment & AI assistant connectivity (Antigravity/Gemini)
npm run cm:quality     # Project quality & standards check
```

---

## 5. Non-Negotiable Operational Rules for AI Agents

1. **Clean TypeScript Compilation**: Always verify `npm run build` (`tsc && vite build`) and `npm run backend:build` compile with **0 errors** before concluding any task.
2. **Document Canvas Proportion**: Never squish or shrink the document canvas in `DocumentPrepStudio.tsx`. It must maintain its standard spacious **680px** proportion with clean view toggles.
3. **Preserve Comments & Docstrings**: Never strip unrelated comments or architectural notes.
4. **Certificate Modal Dismissal**: The Certificate of Completion modal must always maintain its sticky top `✕ Close` button, sticky bottom `Done & Close` button, <kbd>Esc</kbd> shortcut, and backdrop click handler.
5. **Toast Progress Bar**: The bottom progress underline in toast notifications must always visually reduce over time with the real-time seconds countdown.
6. **Webcam in Notary**: The Remote Online Notary studio must always use `navigator.mediaDevices.getUserMedia` for real hardware video feeds.
7. **No Secrets in Git**: Never commit `.env` or hardcoded secret keys. Always use `.env.example`.
8. **Knowledge Graph Sync**: Always run `graphify update .` after making code changes.
