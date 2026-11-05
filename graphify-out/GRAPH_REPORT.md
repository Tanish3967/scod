# Graph Report - scod  (2026-11-05)

## Corpus Check
- 151 files · ~167,265 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1027 nodes · 1757 edges · 72 communities (55 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `107a7829`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useSignFlow
- downloadJsonBundle
- net/http.ResponseWriter
- dependencies
- SigningExperience.tsx
- notification-webhooks/src/server.ts
- devDependencies
- signflow.ts
- aiEngine.ts
- envelope.go
- compilerOptions
- rate_limiter.ts
- ai-orchestrator/package.json
- api-gateway/package.json
- notification-webhooks/package.json
- compilerOptions
- compilerOptions
- compilerOptions
- aiMultiAgentDrafter.ts
- documentParser.ts
- localDatabase.ts
- test_phase2_sharding_cache.cjs
- test_phase3_worker_pool.cjs
- test_phase4_edge_fanout_mesh.cjs
- runEnterpriseSuite
- ai-orchestrator/src/server.ts
- github.com/signflow/audit-trail-service
- github.com/signflow/document-processor
- github.com/signflow/envelope-service
- github.com/signflow/send-email-resend
- 3. Core Implemented Workflows & Business Logic
- Connection and task recovery
- AdminPortal.tsx
- WorkflowCanvasBuilder.tsx
- SignFlow: Comprehensive Feature-by-Feature Checklist
- 3. Core Implemented Workflows & Business Logic
- SignFlow Enterprise — Codebase Knowledge Graph & Architecture Report
- Native, managed, and packaged artifacts
- MultiTierCache
- CreateEnvelopeModal.tsx
- Envelope
- DocumentViewerCanvas.tsx
- rules/graphify.md
- workflows/graphify.md
- WorkerPool
- unified-backend/src/server.ts
- unified-backend/package.json
- AuditStore
- runLoadAndStressSuite
- SignFlow — Enterprise AI-Native Electronic Signature & CLM Platform
- EnvelopeStore
- JsonFileDatabase
- rea_docusign_workflow.mjs
- SignFlowContext.tsx
- compilerOptions
- ShardRouter
- main
- .ProcessDocument
- docusign_v2_1.ts
- stress_test_phase1.cjs
- rea
- LocalStorageProvider
- DocumentPrepStudio.tsx
- unified-backend/src/rate_limiter.ts
- EnvelopeStore
- AuditLedgerStore

## God Nodes (most connected - your core abstractions)
1. `useSignFlow()` - 89 edges
2. `Native, managed, and packaged artifacts` - 30 edges
3. `generateUUID()` - 20 edges
4. `downloadJsonBundle()` - 20 edges
5. `SignFlowProvider()` - 18 edges
6. `JsonFileDatabase` - 16 edges
7. `compilerOptions` - 16 edges
8. `downloadCsvFile()` - 14 edges
9. `3. Core Implemented Workflows & Business Logic` - 14 edges
10. `Recipient` - 13 edges

## Surprising Connections (you probably didn't know these)
- `EnvelopePipeline()` --calls--> `useSignFlow()`  [EXTRACTED]
  src/components/dashboard/EnvelopePipeline.tsx → src/context/SignFlowContext.tsx
- `RightInspectorPanel()` --calls--> `useSignFlow()`  [EXTRACTED]
  src/components/dashboard/RightInspectorPanel.tsx → src/context/SignFlowContext.tsx
- `UploadedFileInfo` --references--> `DocumentPage`  [EXTRACTED]
  src/components/envelopes/CreateEnvelopeModal.tsx → src/types/signflow.ts
- `RecipientConfigPanel()` --calls--> `generateUUID()`  [EXTRACTED]
  src/components/prepare/RecipientConfigPanel.tsx → src/utils/cryptoUtils.ts
- `generateContractDraft()` --calls--> `generateUUID()`  [EXTRACTED]
  src/utils/aiEngine.ts → src/utils/cryptoUtils.ts

## Import Cycles
- None detected.

## Communities (72 total, 11 thin omitted)

### Community 0 - "useSignFlow"
Cohesion: 0.08
Nodes (28): App(), MainLayout(), EmailDispatcherConsole(), VirtualEmail, AuthView(), AuthViewProps, ObligationTrackerHub(), QESTSPVerificationView() (+20 more)

### Community 1 - "downloadJsonBundle"
Cohesion: 0.16
Nodes (19): RFC-4180, AnalyticsFunnelExplorer(), CertificateOfCompletionModal(), AuditEvent, ClauseAnnotation, CoBrowsingRoomView(), Participant, DashboardOverview() (+11 more)

### Community 2 - "net/http.ResponseWriter"
Cohesion: 0.26
Nodes (3): net/http.Request, net/http.ResponseWriter, EnvelopeHandler

### Community 3 - "dependencies"
Cohesion: 0.08
Nodes (25): canvas-confetti, clsx, lucide-react, dependencies, canvas-confetti, clsx, cors, express (+17 more)

### Community 4 - "SigningExperience.tsx"
Cohesion: 0.08
Nodes (35): FieldPropertiesModal(), FieldPropertiesModalProps, CustomSignatureModal(), CustomSignatureModalProps, DEFAULT_FONTS, INK_COLORS, MobileQRModal(), PaymentFieldModal() (+27 more)

### Community 5 - "notification-webhooks/src/server.ts"
Cohesion: 0.09
Nodes (18): DispatchedEmail, dispatchedEmailsLog, EmailDispatchOptions, EmailRecipient, generateSignerInviteHtml(), sendAgreementEmail(), CircuitState, DispatchResult (+10 more)

### Community 6 - "devDependencies"
Cohesion: 0.05
Nodes (38): autoprefixer, devDependencies, autoprefixer, postcss, rea-agents, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti (+30 more)

### Community 7 - "signflow.ts"
Cohesion: 0.15
Nodes (17): RecipientConfigPanel(), SignFlowContextType, AIDraftClauseSuggestion, AIDraftState, AIRiskFinding, ContractObligation, NotaryJournalEntry, NotarySession (+9 more)

### Community 8 - "aiEngine.ts"
Cohesion: 0.16
Nodes (11): AILegalHub(), AIRiskScanner(), ContractQABot(), ObligationCalendarTracker(), AINegotiationWorkbench(), RedlineClause, CLAUSE_LIBRARY, ClauseItem (+3 more)

### Community 9 - "envelope.go"
Cohesion: 0.24
Nodes (14): time.Time, AgreementDocument, AuthType, DocumentField, DocumentPage, EnvelopeSender, FieldType, Recipient (+6 more)

### Community 10 - "compilerOptions"
Cohesion: 0.09
Nodes (21): DOM, DOM.Iterable, ES2020, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib (+13 more)

### Community 11 - "rate_limiter.ts"
Cohesion: 0.15
Nodes (7): EdgeRateLimiter, globalEdgeRateLimiter, RateLimitConfig, TenantTier, TIER_CONFIGS, WindowBucket, app

### Community 12 - "ai-orchestrator/package.json"
Cohesion: 0.09
Nodes (22): dependencies, cors, express, description, devDependencies, @types/cors, @types/express, @types/node (+14 more)

### Community 13 - "api-gateway/package.json"
Cohesion: 0.09
Nodes (22): dependencies, cors, express, description, devDependencies, @types/cors, @types/express, @types/node (+14 more)

### Community 14 - "notification-webhooks/package.json"
Cohesion: 0.09
Nodes (22): dependencies, cors, express, description, devDependencies, @types/cors, @types/express, @types/node (+14 more)

### Community 15 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 16 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 17 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 18 - "aiMultiAgentDrafter.ts"
Cohesion: 0.26
Nodes (10): AIDraftingStudio(), AgentExecutionStep, ContextEnvelope, DraftingSharedMemory, MultiAgentDraftResult, VerificationQualityCertificate, CONTRACT_SECTION_BLUEPRINTS, executeMultiAgentDraft() (+2 more)

### Community 19 - "documentParser.ts"
Cohesion: 0.32
Nodes (10): DocumentPage, calculateFileSha256(), extractPdfText(), extractZipEntry(), formatFileSize(), ParsedDocumentResult, parseDocxXml(), parseUploadedDocument() (+2 more)

### Community 20 - "localDatabase.ts"
Cohesion: 0.30
Nodes (14): AuditEvent, deleteEnvelopeFromDB(), exportDatabaseJSON(), getAllAuditEventsFromDB(), getAllEnvelopesFromDB(), getDatabaseStats(), importDatabaseJSON(), initLocalDatabase() (+6 more)

### Community 21 - "test_phase2_sharding_cache.cjs"
Cohesion: 0.33
Nodes (8): crypto, getHashKey(), http, jumpConsistentHash(), makeRequest(), runPhase2ShardingCacheSuite(), sleep(), { spawn }

### Community 22 - "test_phase3_worker_pool.cjs"
Cohesion: 0.38
Nodes (6): crypto, http, makeRequest(), runPhase3WorkerPoolSuite(), sleep(), { spawn }

### Community 23 - "test_phase4_edge_fanout_mesh.cjs"
Cohesion: 0.38
Nodes (6): crypto, http, makeRequest(), runPhase4EdgeMeshSuite(), sleep(), { spawn }

### Community 24 - "runEnterpriseSuite"
Cohesion: 0.53
Nodes (4): getJson(), postJson(), runEnterpriseSuite(), sleep()

### Community 32 - "3. Core Implemented Workflows & Business Logic"
Cohesion: 0.14
Nodes (13): 1. Project Overview & Identity, 2. Directory Layout & Critical File Reference, 3. Core Implemented Workflows & Business Logic, 4. Development & Build Commands, 5. Non-Negotiable Operational Rules for AI Agents, A. Binary PDF Flattening Engine (`pdfFlattener.ts` & `server_pdf.ts`), B. DocuSign eSignature REST API v2.1 Wire-Compatible Adapter (`docusign_v2_1.ts`), C. Cloud Storage & Persistent Database Layer (`storage.ts` & `database.ts`) (+5 more)

### Community 33 - "Connection and task recovery"
Cohesion: 0.05
Nodes (33): Android application artifacts, Choose the remedy from the observed failure, Codex tool approval is separate from REA readiness, Connection and task recovery, Continue through an installed CLI, Distinguish client and server deadlines, Recovery ladder, Repair an editable REA limit (+25 more)

### Community 36 - "AdminPortal.tsx"
Cohesion: 0.25
Nodes (6): AdminPortal(), ComplianceTrustCenter(), FrameworkDetail, CustomBrandingSettings(), SecurityAnomalyDashboard(), WebhookTester()

### Community 37 - "WorkflowCanvasBuilder.tsx"
Cohesion: 0.28
Nodes (7): NavGroup, Sidebar(), DEFAULT_INITIAL_NODES, getCleanTitle(), WorkflowCanvasBuilder(), WorkflowNode, AppView

### Community 38 - "SignFlow: Comprehensive Feature-by-Feature Checklist"
Cohesion: 0.08
Nodes (24): 1. AI Legal Engine (`src/utils/aiEngine.ts` & `src/components/ai/`), 1. Cryptographic Certificate of Completion & Tamper Locking, 1. Email Dispatcher & Signer Simulation (`src/components/admin/EmailDispatcherConsole.tsx`), 1. Enterprise Notifications (`src/components/layout/NotificationCenterDrawer.tsx` & `NotificationToast.tsx`), 1. Envelope Lifecycle State Machine, 1. Obsidian & Lumina Precision Design System, 1. Offline Database & Storage Manager (`src/components/admin/LocalDatabaseManagerView.tsx`), 1. Remote Notary Studio (`src/components/notary/NotarySessionView.tsx`) (+16 more)

### Community 39 - "3. Core Implemented Workflows & Business Logic"
Cohesion: 0.10
Nodes (19): 1. Project Overview & Identity, 2. Key Codebase Layout & Critical Files, 3. Core Implemented Workflows & Business Logic, 4. Development & Build Commands, 5. Non-Negotiable Operational Rules for AI Agents, A. New Envelope Creation Wizard ([CreateEnvelopeModal.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/envelopes/CreateEnvelopeModal.tsx)), B. Interactive 7-Tab Document Studio ([DocumentPrepStudio.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/prepare/DocumentPrepStudio.tsx)), C. Workflow Canvas Builder Exit & Save Controls ([WorkflowCanvasBuilder.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/workflows/WorkflowCanvasBuilder.tsx)) (+11 more)

### Community 40 - "SignFlow Enterprise — Codebase Knowledge Graph & Architecture Report"
Cohesion: 0.17
Nodes (11): 1. Document Signing & Flattening Pipeline, 1. Executive System Architecture, 2. Core God Nodes & Central Abstractions, 2. DocuSign REST API v2.1 Drop-In Adapter Flow, 3. Subsystem Community Map (71 Communities), 4. Architectural Flows & Critical Data Paths, 5. Knowledge Graph Navigation & Tooling, A. Frontend Application & Document Studio (+3 more)

### Community 41 - "Native, managed, and packaged artifacts"
Cohesion: 0.06
Nodes (32): Apple app resources, Apple IPS crash reports, Bridge request ceiling, CPython pyc files, Desktop installation directories, DOS MZ with Ghidra, ELF note tables, Erlang BEAM files (+24 more)

### Community 42 - "MultiTierCache"
Cohesion: 0.31
Nodes (5): CacheEntry, CacheStatus, time.Duration, MultiTierCache, NewMultiTierCache()

### Community 43 - "CreateEnvelopeModal.tsx"
Cohesion: 0.33
Nodes (7): CATEGORY_TAGS, CreateEnvelopeModalProps, TemplateRecipientConfig, UploadedFileInfo, MOCK_TEMPLATES, AuthType, Template

### Community 44 - "Envelope"
Cohesion: 0.38
Nodes (5): RightInspectorPanel(), RightInspectorPanelProps, ShareEnvelopeModal(), ShareEnvelopeModalProps, Envelope

### Community 45 - "DocumentViewerCanvas.tsx"
Cohesion: 0.33
Nodes (3): FIELD_TOOLS, FieldTool, FieldType

### Community 56 - "WorkerPool"
Cohesion: 0.19
Nodes (10): DocHandler, JobStatus, PDFJob, EventTopic, NewDocHandler(), WorkerPool, NewWorkerPool(), EventBus (+2 more)

### Community 57 - "unified-backend/src/server.ts"
Cohesion: 0.11
Nodes (16): createAiRouter(), VETTED_CLAUSES, createDocumentsRouter(), createDocusignOAuthRouter(), createNotificationsRouter(), WebhookLogItem, storageEngine, StorageObjectMetadata (+8 more)

### Community 58 - "unified-backend/package.json"
Cohesion: 0.08
Nodes (24): dependencies, cors, express, pdf-lib, description, devDependencies, @types/cors, @types/express (+16 more)

### Community 59 - "AuditStore"
Cohesion: 0.26
Nodes (6): AuditHandler, AuditEvent, ComputeNextHash(), NewAuditHandler(), AuditStore, NewAuditStore()

### Community 61 - "runLoadAndStressSuite"
Cohesion: 0.47
Nodes (3): calculatePercentiles(), runLoadAndStressSuite(), sleep()

### Community 62 - "SignFlow — Enterprise AI-Native Electronic Signature & CLM Platform"
Cohesion: 0.06
Nodes (30): 1. What is REA and Why Use It?, 2. Integrated Tooling & Commands, 3. Step-by-Step DocuSign Reverse-Engineering Workflow, 4. DocuSign Core Parity Matrix in SignFlow, 5. Verifying Parity, Recreating DocuSign with REA (Reverse Engineer Anything) in SignFlow, Step 1: Capture & Inspect DocuSign Web Bundles, Step 2: Inspect DocuSign API Traffic via HAR Network Captures (+22 more)

### Community 64 - "EnvelopeStore"
Cohesion: 0.29
Nodes (7): sync.RWMutex, EnvelopeStore, NewEnvelopeHandler(), NewEnvelopeStore(), enableCORS(), main(), withTracing()

### Community 66 - "rea_docusign_workflow.mjs"
Cohesion: 0.33
Nodes (6): __dirname, __filename, main(), REA_CLI, ROOT_DIR, runReaCommand()

### Community 67 - "SignFlowContext.tsx"
Cohesion: 0.17
Nodes (20): EnvelopePipeline(), CreateEnvelopeModal(), EnvelopeVaultList(), PowerFormPublicView(), PowerFormPublicViewProps, getInitialUrlRouteState(), SignFlowContext, SignFlowProvider() (+12 more)

### Community 68 - "compilerOptions"
Cohesion: 0.14
Nodes (13): ES2022, compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, outDir, rootDir (+5 more)

### Community 69 - "ShardRouter"
Cohesion: 0.36
Nodes (5): GetHashKey(), ShardRouter, JumpHash(), NewShardRouter(), ShardNode

### Community 70 - "main"
Cohesion: 0.33
Nodes (7): net/http.Handler, enableCORS(), main(), withAuditTracing(), enableCORS(), main(), withDocTracing()

### Community 71 - ".ProcessDocument"
Cohesion: 0.60
Nodes (3): DetectedField, AutoDetectFields(), ComputeSHA256()

### Community 72 - "docusign_v2_1.ts"
Cohesion: 0.27
Nodes (11): DatabaseSchema, persistentDb, StoredAuditEvent, StoredDocument, createDocusignRouter(), DocumentField, Envelope, EnvelopeRecipient (+3 more)

### Community 73 - "stress_test_phase1.cjs"
Cohesion: 0.31
Nodes (9): http, makeRequest(), runPhase1StressSuite(), executeStressBurst(), worker(), SERVICES, sleep(), { spawn } (+1 more)

### Community 77 - "DocumentPrepStudio.tsx"
Cohesion: 0.20
Nodes (15): AttachmentItem, SignSuccessModal(), SignSuccessModalProps, AgreementDocument, EnvelopeAttachment, Recipient, sha256(), appendCertificateOfCompletion() (+7 more)

### Community 78 - "unified-backend/src/rate_limiter.ts"
Cohesion: 0.18
Nodes (8): createRateLimiter(), edgeAuthMiddleware(), EdgeRateLimiter, globalEdgeRateLimiter, RateLimitConfig, TenantTier, TIER_CONFIGS, WindowBucket

### Community 82 - "AuditLedgerStore"
Cohesion: 0.36
Nodes (3): AuditLedgerStore, AuditRecord, createAuditRouter()

## Knowledge Gaps
- **369 isolated node(s):** `node`, `name`, `private`, `version`, `type` (+364 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 426 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useSignFlow()` connect `useSignFlow` to `downloadJsonBundle`, `SignFlowContext.tsx`, `AdminPortal.tsx`, `WorkflowCanvasBuilder.tsx`, `SigningExperience.tsx`, `signflow.ts`, `aiEngine.ts`, `CreateEnvelopeModal.tsx`, `Envelope`, `DocumentPrepStudio.tsx`, `aiMultiAgentDrafter.ts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `Native, managed, and packaged artifacts` connect `Native, managed, and packaged artifacts` to `Connection and task recovery`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `JsonFileDatabase` connect `JsonFileDatabase` to `docusign_v2_1.ts`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `node`, `name`, `private` to the rest of the system?**
  _369 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useSignFlow` be split into smaller, more focused modules?**
  _Cohesion score 0.08309178743961353 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `SigningExperience.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08484848484848485 - nodes in this community are weakly interconnected._