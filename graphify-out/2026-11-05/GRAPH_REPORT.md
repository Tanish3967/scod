# Graph Report - scod  (2026-11-05)

## Corpus Check
- 168 files · ~180,083 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1128 nodes · 1848 edges · 84 communities (61 shown, 16 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `97823ff9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useSignFlow
- aiEngine.ts
- net/http.ResponseWriter
- dependencies
- SigningExperience.tsx
- notification-webhooks/src/server.ts
- devDependencies
- SignFlowContext.tsx
- envelope.go
- compilerOptions
- rate_limiter.ts
- ai-orchestrator/package.json
- api-gateway/package.json
- notification-webhooks/package.json
- compilerOptions
- compilerOptions
- compilerOptions
- signflow.ts
- DocumentPrepStudio.tsx
- test_p1_features.cjs
- test_phase2_sharding_cache.cjs
- test_phase3_worker_pool.cjs
- test_phase4_edge_fanout_mesh.cjs
- runEnterpriseSuite
- ai-orchestrator/src/server.ts
- github.com/signflow/audit-trail-service
- github.com/signflow/document-processor
- github.com/signflow/envelope-service
- github.com/signflow/send-email-resend
- cryptoUtils.ts
- Connection and task recovery
- Part 1: Core E-Signature Platform & DocuSign Parity (Phase 1)
- What You Must Do When Invoked
- SignFlow: Comprehensive Feature-by-Feature Checklist
- 3. Core Implemented Workflows & Business Logic
- graphify reference: extra exports and benchmark
- Native, managed, and packaged artifacts
- SignFlow Architecture & Codebase Graph Report (GRAPH_REPORT.md)
- graphify reference: query, path, explain
- SignFlow — Permanent Project Memory & Knowledge Bank
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- SignFlow DOM QA Agent: Platform Bug Resolution & Verification Report
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- rules/graphify.md
- workflows/graphify.md
- CLAUDE.md
- .claude/CLAUDE.md
- extraction-spec.md
- WorkerPool
- unified-backend/src/server.ts
- unified-backend/package.json
- AuditStore
- runLoadAndStressSuite
- SignFlow — Enterprise AI-Native Electronic Signature & CLM Platform
- DocumentViewerCanvas.tsx
- EnvelopeStore
- JsonFileDatabase
- rea_docusign_workflow.mjs
- Envelope
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
- CustomSignatureModal.tsx
- MultiTierCache
- AuditLedgerStore
- safeCalculate

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

## Communities (84 total, 16 thin omitted)

### Community 0 - "useSignFlow"
Cohesion: 0.05
Nodes (61): RFC-4180, App(), MainLayout(), AdminPortal(), ComplianceTrustCenter(), FrameworkDetail, CustomBrandingSettings(), EmailDispatcherConsole() (+53 more)

### Community 1 - "aiEngine.ts"
Cohesion: 0.16
Nodes (15): AILegalHub(), AIRiskScanner(), ContractQABot(), ObligationCalendarTracker(), SignerAIDrawer(), CLAUSE_LIBRARY, ClauseItem, AIDraftClauseSuggestion (+7 more)

### Community 2 - "net/http.ResponseWriter"
Cohesion: 0.26
Nodes (3): net/http.Request, net/http.ResponseWriter, EnvelopeHandler

### Community 3 - "dependencies"
Cohesion: 0.08
Nodes (25): canvas-confetti, clsx, lucide-react, dependencies, canvas-confetti, clsx, cors, express (+17 more)

### Community 4 - "SigningExperience.tsx"
Cohesion: 0.15
Nodes (20): PowerFormPublicView(), PowerFormPublicViewProps, FieldPropertiesModal(), FieldPropertiesModalProps, MobileQRModal(), PaymentFieldModal(), SignatureModal(), SignatureOutput (+12 more)

### Community 5 - "notification-webhooks/src/server.ts"
Cohesion: 0.09
Nodes (18): DispatchedEmail, dispatchedEmailsLog, EmailDispatchOptions, EmailRecipient, generateSignerInviteHtml(), sendAgreementEmail(), CircuitState, DispatchResult (+10 more)

### Community 6 - "devDependencies"
Cohesion: 0.05
Nodes (38): autoprefixer, devDependencies, autoprefixer, postcss, rea-agents, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti (+30 more)

### Community 8 - "SignFlowContext.tsx"
Cohesion: 0.12
Nodes (35): BulkSendModal(), ActiveToast, getInitialUrlRouteState(), SignFlowContext, SignFlowContextType, SignFlowProvider(), TenantSettings, ToastNotification (+27 more)

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

### Community 18 - "signflow.ts"
Cohesion: 0.20
Nodes (14): AIDraftingStudio(), EnvelopePipeline(), AgentExecutionStep, AIDraftState, ContextEnvelope, DraftingSharedMemory, EnvelopeStatus, MultiAgentDraftResult (+6 more)

### Community 19 - "DocumentPrepStudio.tsx"
Cohesion: 0.18
Nodes (18): CATEGORY_TAGS, CreateEnvelopeModalProps, TemplateRecipientConfig, UploadedFileInfo, AttachmentItem, AuthType, DocumentPage, EnvelopeAttachment (+10 more)

### Community 20 - "test_p1_features.cjs"
Cohesion: 0.36
Nodes (8): crypto, generatePasskeySignatureSvg(), http, makeRequest(), makeRequestWithRetry(), runP1FeatureSuite(), sleep(), { spawn }

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

### Community 32 - "cryptoUtils.ts"
Cohesion: 0.26
Nodes (9): ObligationTrackerHub(), RecipientConfigPanel(), ContractObligation, ObligationStatus, ObligationType, RecipientRole, generateUUID(), extractObligationsFromEnvelope() (+1 more)

### Community 33 - "Connection and task recovery"
Cohesion: 0.05
Nodes (33): Android application artifacts, Choose the remedy from the observed failure, Codex tool approval is separate from REA readiness, Connection and task recovery, Continue through an installed CLI, Distinguish client and server deadlines, Recovery ladder, Repair an editable REA limit (+25 more)

### Community 36 - "Part 1: Core E-Signature Platform & DocuSign Parity (Phase 1)"
Cohesion: 0.05
Nodes (36): 1.1 Envelope Lifecycle State Machine, 1.2 Multi-Page Document Studio Canvas, 1.3 13 Standard & Specialized Field Types, 1.4 Advanced Recipient Routing Engine, 1.5 Tiered Signer Authentication Gates, 1.6 High-Fidelity Guided Signing Experience, 1.7 Master Templates, PowerForms & CSV Bulk Send, 2.1 Multi-Provider Email Gateway (+28 more)

### Community 37 - "What You Must Do When Invoked"
Cohesion: 0.07
Nodes (26): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+18 more)

### Community 38 - "SignFlow: Comprehensive Feature-by-Feature Checklist"
Cohesion: 0.08
Nodes (24): 1. AI Legal Engine (`src/utils/aiEngine.ts` & `src/components/ai/`), 1. Cryptographic Certificate of Completion & Tamper Locking, 1. Email Dispatcher & Signer Simulation (`src/components/admin/EmailDispatcherConsole.tsx`), 1. Enterprise Notifications (`src/components/layout/NotificationCenterDrawer.tsx` & `NotificationToast.tsx`), 1. Envelope Lifecycle State Machine, 1. Obsidian & Lumina Precision Design System, 1. Offline Database & Storage Manager (`src/components/admin/LocalDatabaseManagerView.tsx`), 1. Remote Notary Studio (`src/components/notary/NotarySessionView.tsx`) (+16 more)

### Community 39 - "3. Core Implemented Workflows & Business Logic"
Cohesion: 0.10
Nodes (19): 1. Project Overview & Identity, 2. Key Codebase Layout & Critical Files, 3. Core Implemented Workflows & Business Logic, 4. Development & Build Commands, 5. Non-Negotiable Operational Rules for AI Agents, A. New Envelope Creation Wizard ([CreateEnvelopeModal.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/envelopes/CreateEnvelopeModal.tsx)), B. Interactive 7-Tab Document Studio ([DocumentPrepStudio.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/prepare/DocumentPrepStudio.tsx)), C. Workflow Canvas Builder Exit & Save Controls ([WorkflowCanvasBuilder.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/workflows/WorkflowCanvasBuilder.tsx)) (+11 more)

### Community 40 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 41 - "Native, managed, and packaged artifacts"
Cohesion: 0.06
Nodes (32): Apple app resources, Apple IPS crash reports, Bridge request ceiling, CPython pyc files, Desktop installation directories, DOS MZ with Ghidra, ELF note tables, Erlang BEAM files (+24 more)

### Community 42 - "SignFlow Architecture & Codebase Graph Report (GRAPH_REPORT.md)"
Cohesion: 0.29
Nodes (6): 1. Executive Summary & Graph Metrics, 2. God Nodes (Core Architectural Pillars), 3. Key Cross-Community Connections & Bridges, 4. Architectural Communities & Subsystems, 5. Summary of Upgrades to Additional Features, SignFlow Architecture & Codebase Graph Report (GRAPH_REPORT.md)

### Community 43 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 44 - "SignFlow — Permanent Project Memory & Knowledge Bank"
Cohesion: 0.40
Nodes (4): 1. Quick Technical Reference & Modules Map, 2. Key Architecture Decisions & Established Patterns, 3. Build & Test Commands, SignFlow — Permanent Project Memory & Knowledge Bank

### Community 45 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 46 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 47 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 48 - "SignFlow DOM QA Agent: Platform Bug Resolution & Verification Report"
Cohesion: 0.50
Nodes (3): 1. Resolution Summary Table, 2. Test Verification, SignFlow DOM QA Agent: Platform Bug Resolution & Verification Report

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
Cohesion: 0.07
Nodes (27): 1. What is REA and Why Use It?, 2. Integrated Tooling & Commands, 3. Step-by-Step DocuSign Reverse-Engineering Workflow, 4. DocuSign Core Parity Matrix in SignFlow, 5. Verifying Parity, Recreating DocuSign with REA (Reverse Engineer Anything) in SignFlow, Step 1: Capture & Inspect DocuSign Web Bundles, Step 2: Inspect DocuSign API Traffic via HAR Network Captures (+19 more)

### Community 63 - "DocumentViewerCanvas.tsx"
Cohesion: 0.33
Nodes (3): FIELD_TOOLS, FieldTool, FieldType

### Community 64 - "EnvelopeStore"
Cohesion: 0.29
Nodes (7): sync.RWMutex, EnvelopeStore, NewEnvelopeHandler(), NewEnvelopeStore(), enableCORS(), main(), withTracing()

### Community 66 - "rea_docusign_workflow.mjs"
Cohesion: 0.33
Nodes (6): __dirname, __filename, main(), REA_CLI, ROOT_DIR, runReaCommand()

### Community 67 - "Envelope"
Cohesion: 0.38
Nodes (5): RightInspectorPanel(), RightInspectorPanelProps, ShareEnvelopeModal(), ShareEnvelopeModalProps, Envelope

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

### Community 77 - "pdfFlattener.ts"
Cohesion: 0.24
Nodes (13): SignSuccessModal(), SignSuccessModalProps, AgreementDocument, Recipient, sha256(), appendCertificateOfCompletion(), createBasePdfFromDocument(), dataUrlToUint8Array() (+5 more)

### Community 78 - "unified-backend/src/rate_limiter.ts"
Cohesion: 0.18
Nodes (8): createRateLimiter(), edgeAuthMiddleware(), EdgeRateLimiter, globalEdgeRateLimiter, RateLimitConfig, TenantTier, TIER_CONFIGS, WindowBucket

### Community 80 - "CustomSignatureModal.tsx"
Cohesion: 0.30
Nodes (10): CustomSignatureModal(), CustomSignatureModalProps, DEFAULT_FONTS, INK_COLORS, CustomSignature, authenticateWithPasskey(), generateChallengeBuffer(), generatePasskeySignatureSvg() (+2 more)

### Community 81 - "MultiTierCache"
Cohesion: 0.31
Nodes (5): CacheEntry, CacheStatus, time.Duration, MultiTierCache, NewMultiTierCache()

### Community 82 - "AuditLedgerStore"
Cohesion: 0.36
Nodes (3): AuditLedgerStore, AuditRecord, createAuditRouter()

### Community 83 - "safeCalculate"
Cohesion: 1.00
Nodes (4): safeCalculate(), parseExpression(), parseFactor(), parseTerm()

## Knowledge Gaps
- **435 isolated node(s):** `node`, `name`, `private`, `version`, `type` (+430 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 507 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useSignFlow()` connect `useSignFlow` to `cryptoUtils.ts`, `aiEngine.ts`, `Envelope`, `SigningExperience.tsx`, `SignFlowContext.tsx`, `pdfFlattener.ts`, `CustomSignatureModal.tsx`, `signflow.ts`, `DocumentPrepStudio.tsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `authenticateWithPasskey()` connect `CustomSignatureModal.tsx` to `SigningExperience.tsx`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **What connects `node`, `name`, `private` to the rest of the system?**
  _435 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useSignFlow` be split into smaller, more focused modules?**
  _Cohesion score 0.051511758118701005 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `SigningExperience.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14814814814814814 - nodes in this community are weakly interconnected._