# SignFlow Enterprise — Codebase Knowledge Graph & Architecture Report

> **Last Updated**: November 2026  
> **Source Corpus**: 149 files · ~164,000 words  
> **Graph Metrics**: 1,001 nodes · 1,733 edges · 71 communities · 0 import cycles  
> **Extraction Fidelity**: 100% Extracted via AST Analysis & Static Inference  

---

## 1. Executive System Architecture

SignFlow is an enterprise-grade, AI-native electronic signature, contract lifecycle management (CLM), and remote online notarization (RON) platform with 100% commercial-grade DocuSign parity.

```
+---------------------------------------------------------------------------------------------------+
|                                          CLIENT TIER                                              |
|  React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Canvas API + PDF.js + Web Crypto + IndexedDB  |
|                                                                                                   |
|  +---------------------------+  +--------------------------+  +--------------------------------+  |
|  |    Document Prep Studio   |  |     Guided Signer UX     |  |       Remote Online Notary     |  |
|  | (7 Tabs, 680px Canvas API)|  | (Passkey, QR Stepper)    |  |  (Live getUserMedia Webcam)    |  |
|  +---------------------------+  +--------------------------+  +--------------------------------+  |
|  +---------------------------+  +--------------------------+  +--------------------------------+  |
|  |     Binary PDF Flattener  |  |    Certificate Modal     |  |       Multi-Agent AI Swarm     |  |
|  | (pdf-lib Vector Burning)  |  | (Merkle SHA-256 Ledger)  |  |  (5-50+ Page Legal Drafter)   |  |
|  +---------------------------+  +--------------------------+  +--------------------------------+  |
+-------------------------------------------------+-------------------------------------------------+
                                                  |
                                HTTP / REST API   |  Port 8090 (or Docker Reverse Proxy :5173)
                                                  v
+---------------------------------------------------------------------------------------------------+
|                         SIGNFLOW UNIFIED BACKEND SERVICE ENGINE (:8090)                           |
|                      In-Process Monolithic Engine (Zero Network Hop Mesh)                         |
|                                                                                                   |
|  +-------------------------------------+      +------------------------------------------------+  |
|  |  DocuSign eSignature REST API v2.1  |      |         Envelopes & Sharding Module            |  |
|  |  • POST /v2.1/accounts/:id/envelopes|      |  • /api/v1/envelopes                           |  |
|  |  • GET  /v2.1/.../documents/:docId  |      |  • 16-Shard Jump Consistent Hash               |  |
|  |  • POST /v2.1/.../views/recipient   |      |  • Multi-party Sequential Routing Engine       |  |
|  |  • GET  /oauth/userinfo & /token    |      |  • Deterministic State Machine                 |  |
|  +-------------------------------------+      +------------------------------------------------+  |
|  +-------------------------------------+      +------------------------------------------------+  |
|  |     Cryptographic Merkle Ledger     |      |       Document Processing & Vector Seal        |  |
|  |  • /api/v1/audit                    |      |  • /api/v1/documents                           |  |
|  |  • SHA-256 Tamper-Evident Hashing   |      |  • Server-side pdf-lib Vector Renderer         |  |
|  |  • Certificate of Completion Gen    |      |  • High-DPI Page Geometry Analysis             |  |
|  +-------------------------------------+      +------------------------------------------------+  |
|  +-------------------------------------+      +------------------------------------------------+  |
|  |   Transactional Emails & Webhooks   |      |       AI Orchestrator & Legal Playbook         |  |
|  |  • /api/v1/emails & /api/v1/webhooks|      |  • /api/v1/ai                                  |  |
|  |  • HMAC-SHA256 Webhook Signatures   |      |  • Legal Risk Review Scanner                   |  |
|  |  • Resend / SMTP / Sandbox Gateway  |      |  • Conversational Vault RAG Q&A                |  |
|  +-------------------------------------+      +------------------------------------------------+  |
|  +-------------------------------------+      +------------------------------------------------+  |
|  |     Persistent Document Storage     |      |          Atomic JSON Database Store            |  |
|  |  • LocalStorageProvider & S3 Cloud  |      |  • services/unified-backend/data/db/           |  |
|  |  • SHA-256 ETag Object Store        |      |  • Envelope, Signer & Audit Persistence        |  |
|  +-------------------------------------+      +------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Core God Nodes & Central Abstractions

Graph analysis identified the primary architectural pivot points across the codebase:

| Rank | God Node Symbol | Edge Degree | Primary File Location | Role & Architectural Responsibility |
|:---:|---|:---:|---|---|
| **1** | `useSignFlow()` | **89 edges** | `src/context/SignFlowContext.tsx` | Master React hook providing unified state, envelope operations, sealing, notifications, IndexedDB persistence, and active navigation. |
| **2** | `Native, managed & packaged artifacts` | **30 edges** | `.agents/skills/reverse-engineer-anything/` | REA reverse-engineering knowledge base mapping observed binaries and network payloads. |
| **3** | `generateUUID()` | **20 edges** | `src/utils/cryptoUtils.ts` | RFC-4122 cryptographic identifier generator for envelopes, fields, recipients, and audit ledger blocks. |
| **4** | `downloadJsonBundle()` | **20 edges** | `src/utils/downloadUtils.ts` | Serialized export utility for audit ledgers, diagnostic packages, and IndexedDB backups. |
| **5** | `SignFlowProvider()` | **18 edges** | `src/context/SignFlowContext.tsx` | Root context provider orchestrating deep-link bootstrapping, state machines, and background synchronizations. |
| **6** | `JsonFileDatabase` | **16 edges** | `services/unified-backend/src/modules/database.ts` | Atomic disk-backed database store persisting envelopes, audit records, and DocuSign client mappings. |
| **7** | `downloadCsvFile()` | **14 edges** | `src/utils/downloadUtils.ts` | RFC-4180 CSV compliance generator for audit logs, telemetry, and tabular analytics. |
| **8** | `downloadFlattenedEnvelopePdf()` | **12 edges** | `src/utils/pdfFlattener.ts` | Client-side ISO 32000 PDF burning engine: converts web coordinates, affixes signatures, and appends the Certificate of Completion. |
| **9** | `createDocusignRouter()` | **11 edges** | `services/unified-backend/src/modules/docusign_v2_1.ts` | Complete DocuSign eSignature REST API v2.1 wire adapter matching official SDK contracts. |
| **10** | `Recipient` | **13 edges** | `src/types/signflow.ts` | Core domain type defining signatory identity, routing orders, authentication methods, and status states. |

---

## 3. Subsystem Community Map (71 Communities)

The 1,001 graph nodes naturally partition into domain-specific functional communities:

### A. Frontend Application & Document Studio
- **Community 0 (`useSignFlow`)**: High-level application orchestrator connecting `App.tsx`, `MainLayout`, `EmailDispatcherConsole`, `QESTSPVerificationView`, and `AuthView`.
- **Community 1 (`DocumentPrepStudio.tsx`)**: The flagship 7-tab document studio canvas (`Document`, `Workflow`, `Signers`, `History`, `Activity`, `Attachments`, `Audit Trail`).
- **Community 4 (`SigningExperience.tsx`)**: The Guided Signer UX with sequential step navigation, mobile QR sync, biometric WebAuthn signing, and AI copilot drawer.
- **Community 18 (`signflow.ts`)**: Type contracts covering `Envelope`, `DocumentField`, `CustomSignature`, `AuditEvent`, and `Template`.
- **Community 19 (`CreateEnvelopeModal.tsx`)**: 3-Tab document intake wizard (PDF.js high-DPI rasterization, master template library, and blank AI drafter).
- **Community 20 (`localDatabase.ts`)**: Browser IndexedDB persistence engine managing 5 object stores (`envelopes`, `audit_trail`, `templates`, `notary_journal`, `webhooks`).
- **Community 37 (`WorkflowCanvasBuilder.tsx`)**: Drag-and-drop visual routing builder with unsaved changes tracking, snapshot comparison, and confirmation modals.
- **Community 40 (`formatTimestamp` & `pdfFlattener.ts`)**: Client-side coordinate translation and cryptographic PDF generation.

### B. Unified Backend Service Engine (`:8090`)
- **Community 62 (`unified-backend/src/server.ts`)**: Central Express mesh mounting `/api/v1/envelopes`, `/api/v1/audit`, `/api/v1/documents`, `/api/v1/ai`, `/api/v1/emails`, `/api/v1/webhooks`, `/v2.1/accounts`, and `/oauth`.
- **Community 75 (`docusign_v2_1.ts`)**: DocuSign REST v2.1 adapter handling envelope definitions, embedded ceremony views, and document binary streams.
- **Community 67 (`EnvelopeStore`)**: In-memory consistent hash router with 16 virtual shards, lifecycle state machine, and funnel analytics.
- **Community 68 (`JsonFileDatabase`)**: Atomic write-ahead persistent database engine located at `services/unified-backend/data/db/signflow_db.json`.
- **Community 78 (`LocalStorageProvider`)**: Content-addressable binary object store with SHA-256 ETags for raw documents and vector PDF streams.
- **Community 64 (`AuditLedgerStore`)**: Immutable SHA-256 Merkle audit trail engine verifying ledger chains and parent-child block linkages.
- **Community 11 (`rate_limiter.ts`)**: Sliding-window token bucket rate limiter with multi-tier tenant throttling (`enterprise`, `business`, `starter`).

### C. Testing & Verification
- **Community 24 (`runEnterpriseSuite`)**: Automated 14-test end-to-end integration harness in `tools/run_e2e_suite.js`.
- **Communities 21, 22, 23 (`test_phase*.cjs`)**: Stress test harnesses verifying consistent sharding, worker pool concurrency, and edge fanout.

---

## 4. Architectural Flows & Critical Data Paths

### 1. Document Signing & Flattening Pipeline
```
[User signs in Guided Signer UX] 
       │
       ▼
[Records signature PNG & timestamp to DocumentField]
       │
       ▼
[All required signers complete signature]
       │
       ├────────────────────────────────────────────────────────────────────────┐
       ▼                                                                        ▼
[pdfFlattener.ts (Client)]                                   [server_pdf.ts (Backend)]
• Translates top-left 680px % to PDF bottom-left pt          • Generates vector Certificate of Completion
• Burns vector signature & cursive calligraphy onto canvas   • Appends Merkle root hash & audit block
• Appends official Certificate of Completion page            • Emits ISO 32000 application/pdf stream
• Generates final SHA-256 Merkle root hash                   • Streams via GET /v2.1/.../documents/combined
```

### 2. DocuSign REST API v2.1 Drop-In Adapter Flow
```
[External DocuSign SDK / Client Application]
       │
       │ POST /v2.1/accounts/:accountId/envelopes
       ▼
[docusign_v2_1.ts: Parse EnvelopeDefinition]
  ├── Decodes documentBase64 streams ────► Saves to LocalStorageProvider
  ├── Maps signHereTabs / textTabs ──────► Translates to DocumentField[]
  ├── Stores recipient identities ───────► Saves to persistentDb & envelopeStore
  └── Returns { envelopeId, uri, status: 'sent' }
       │
       │ POST /v2.1/accounts/:accountId/envelopes/:id/views/recipient
       ▼
[Returns Guided Signer Ceremony URL: http://localhost:5173/?sign=<id>&signer=<recId>]
```

---

## 5. Knowledge Graph Navigation & Tooling

To query or inspect this graph interactively:

```bash
# Query any codebase concept or architectural question
graphify query "How does binary PDF flattening work?"

# Trace shortest relationship path between two components
graphify path "useSignFlow" "docusign_v2_1.ts"

# Explain a specific node or module in detail
graphify explain "JsonFileDatabase"

# Update graph after modifying code files (0 API cost, AST-only)
graphify update .
```
