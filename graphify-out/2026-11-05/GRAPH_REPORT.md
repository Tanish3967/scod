# Graph Report - scod  (2026-11-05)

## Corpus Check
- 149 files · ~163,945 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1001 nodes · 1733 edges · 71 communities (52 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cf602bab`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useSignFlow
- DocumentPrepStudio.tsx
- net/http.ResponseWriter
- dependencies
- SigningExperience.tsx
- notification-webhooks/src/server.ts
- devDependencies
- cryptoUtils.ts
- aiEngine.ts
- MultiTierCache
- compilerOptions
- rate_limiter.ts
- ai-orchestrator/package.json
- api-gateway/package.json
- notification-webhooks/package.json
- compilerOptions
- compilerOptions
- compilerOptions
- signflow.ts
- CreateEnvelopeModal.tsx
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
- WorkerPool
- Connection and task recovery
- AdminPortal.tsx
- WorkflowCanvasBuilder.tsx
- SignFlow: Comprehensive Feature-by-Feature Checklist
- 3. Core Implemented Workflows & Business Logic
- formatTimestamp
- Native, managed, and packaged artifacts
- AINegotiationWorkbench.tsx
- TemplateLibraryView.tsx
- NotarySessionView.tsx
- rules/graphify.md
- workflows/graphify.md
- EventBus
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
- pdfFlattener.ts
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
- `generateContractDraft()` --calls--> `generateUUID()`  [EXTRACTED]
  src/utils/aiEngine.ts → src/utils/cryptoUtils.ts
- `main()` --calls--> `NewAuditHandler()`  [EXTRACTED]
  services/audit-trail-service/main.go → services/audit-trail-service/handlers/audit_handler.go
- `main()` --calls--> `NewAuditStore()`  [EXTRACTED]
  services/audit-trail-service/main.go → services/audit-trail-service/ledger/audit_store.go

## Import Cycles
- None detected.

## Communities (71 total, 13 thin omitted)

### Community 0 - "useSignFlow"
Cohesion: 0.10
Nodes (24): App(), MainLayout(), EmailDispatcherConsole(), VirtualEmail, AuthView(), AuthViewProps, QESTSPVerificationView(), MetricCards() (+16 more)

### Community 1 - "DocumentPrepStudio.tsx"
Cohesion: 0.18
Nodes (18): RFC-4180, AnalyticsFunnelExplorer(), AuditEvent, ClauseAnnotation, CoBrowsingRoomView(), Participant, DashboardOverview(), MetricGraphType (+10 more)

### Community 2 - "net/http.ResponseWriter"
Cohesion: 0.28
Nodes (3): net/http.Request, net/http.ResponseWriter, EnvelopeHandler

### Community 3 - "dependencies"
Cohesion: 0.08
Nodes (25): canvas-confetti, clsx, lucide-react, dependencies, canvas-confetti, clsx, cors, express (+17 more)

### Community 4 - "SigningExperience.tsx"
Cohesion: 0.08
Nodes (35): PowerFormPublicView(), PowerFormPublicViewProps, FIELD_TOOLS, FieldTool, FieldPropertiesModal(), FieldPropertiesModalProps, CustomSignatureModal(), CustomSignatureModalProps (+27 more)

### Community 5 - "notification-webhooks/src/server.ts"
Cohesion: 0.09
Nodes (18): DispatchedEmail, dispatchedEmailsLog, EmailDispatchOptions, EmailRecipient, generateSignerInviteHtml(), sendAgreementEmail(), CircuitState, DispatchResult (+10 more)

### Community 6 - "devDependencies"
Cohesion: 0.05
Nodes (38): autoprefixer, devDependencies, autoprefixer, postcss, rea-agents, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti (+30 more)

### Community 7 - "cryptoUtils.ts"
Cohesion: 0.22
Nodes (11): ObligationTrackerHub(), RecipientConfigPanel(), ContractObligation, ObligationStatus, ObligationType, generateHmacSignature(), generateUUID(), getMockDeviceFingerprint() (+3 more)

### Community 8 - "aiEngine.ts"
Cohesion: 0.17
Nodes (14): AILegalHub(), AIRiskScanner(), ContractQABot(), ObligationCalendarTracker(), SignerAIDrawer(), AIDraftClauseSuggestion, AIRiskAnalysis, AIRiskFinding (+6 more)

### Community 9 - "MultiTierCache"
Cohesion: 0.14
Nodes (19): CacheEntry, CacheStatus, time.Duration, time.Time, AgreementDocument, AuthType, DocumentField, DocumentPage (+11 more)

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

### Community 18 - "signflow.ts"
Cohesion: 0.14
Nodes (19): AIDraftingStudio(), EnvelopePipeline(), AgentExecutionStep, AIDraftState, AuditEvent, ConditionalAction, ConditionalOperator, ContextEnvelope (+11 more)

### Community 19 - "CreateEnvelopeModal.tsx"
Cohesion: 0.19
Nodes (17): CATEGORY_TAGS, CreateEnvelopeModal(), CreateEnvelopeModalProps, TemplateRecipientConfig, UploadedFileInfo, AuthType, DocumentPage, generateFullSha256() (+9 more)

### Community 20 - "localDatabase.ts"
Cohesion: 0.35
Nodes (14): SignFlowProvider(), deleteEnvelopeFromDB(), exportDatabaseJSON(), getAllAuditEventsFromDB(), getAllEnvelopesFromDB(), getDatabaseStats(), importDatabaseJSON(), initLocalDatabase() (+6 more)

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

### Community 32 - "WorkerPool"
Cohesion: 0.36
Nodes (4): JobStatus, PDFJob, WorkerPool, NewWorkerPool()

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

### Community 40 - "formatTimestamp"
Cohesion: 0.43
Nodes (5): CertificateOfCompletionModal(), EnvelopeVaultList(), SignSuccessModal(), formatTimestamp(), downloadFlattenedEnvelopePdf()

### Community 41 - "Native, managed, and packaged artifacts"
Cohesion: 0.06
Nodes (32): Apple app resources, Apple IPS crash reports, Bridge request ceiling, CPython pyc files, Desktop installation directories, DOS MZ with Ghidra, ELF note tables, Erlang BEAM files (+24 more)

### Community 42 - "AINegotiationWorkbench.tsx"
Cohesion: 0.40
Nodes (4): AINegotiationWorkbench(), RedlineClause, CLAUSE_LIBRARY, ClauseItem

### Community 56 - "EventBus"
Cohesion: 0.35
Nodes (6): DocHandler, EventTopic, NewDocHandler(), EventBus, EventMessage, NewEventBus()

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
Cohesion: 0.31
Nodes (6): EnvelopeStore, NewEnvelopeHandler(), NewEnvelopeStore(), enableCORS(), main(), withTracing()

### Community 66 - "rea_docusign_workflow.mjs"
Cohesion: 0.33
Nodes (6): __dirname, __filename, main(), REA_CLI, ROOT_DIR, runReaCommand()

### Community 67 - "SignFlowContext.tsx"
Cohesion: 0.14
Nodes (20): RightInspectorPanel(), RightInspectorPanelProps, ShareEnvelopeModalProps, SignSuccessModalProps, ActiveToast, getInitialUrlRouteState(), SignFlowContext, SignFlowContextType (+12 more)

### Community 68 - "compilerOptions"
Cohesion: 0.14
Nodes (13): ES2022, compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, outDir, rootDir (+5 more)

### Community 69 - "ShardRouter"
Cohesion: 0.31
Nodes (6): sync.RWMutex, GetHashKey(), ShardRouter, JumpHash(), NewShardRouter(), ShardNode

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

### Community 77 - "pdfFlattener.ts"
Cohesion: 0.33
Nodes (9): AgreementDocument, sha256(), appendCertificateOfCompletion(), createBasePdfFromDocument(), dataUrlToUint8Array(), flattenEnvelopeToPdf(), FlattenPdfOptions, FlattenResult (+1 more)

### Community 78 - "unified-backend/src/rate_limiter.ts"
Cohesion: 0.18
Nodes (8): createRateLimiter(), edgeAuthMiddleware(), EdgeRateLimiter, globalEdgeRateLimiter, RateLimitConfig, TenantTier, TIER_CONFIGS, WindowBucket

### Community 82 - "AuditLedgerStore"
Cohesion: 0.36
Nodes (3): AuditLedgerStore, AuditRecord, createAuditRouter()

## Knowledge Gaps
- **350 isolated node(s):** `node`, `name`, `private`, `version`, `type` (+345 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 405 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useSignFlow()` connect `useSignFlow` to `DocumentPrepStudio.tsx`, `SignFlowContext.tsx`, `AdminPortal.tsx`, `WorkflowCanvasBuilder.tsx`, `SigningExperience.tsx`, `cryptoUtils.ts`, `aiEngine.ts`, `formatTimestamp`, `AINegotiationWorkbench.tsx`, `TemplateLibraryView.tsx`, `NotarySessionView.tsx`, `signflow.ts`, `CreateEnvelopeModal.tsx`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `Native, managed, and packaged artifacts` connect `Native, managed, and packaged artifacts` to `Connection and task recovery`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `JsonFileDatabase` connect `JsonFileDatabase` to `docusign_v2_1.ts`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `node`, `name`, `private` to the rest of the system?**
  _350 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useSignFlow` be split into smaller, more focused modules?**
  _Cohesion score 0.09871794871794871 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `SigningExperience.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08163265306122448 - nodes in this community are weakly interconnected._