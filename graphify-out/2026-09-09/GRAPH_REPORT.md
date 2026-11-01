# Graph Report - scod  (2026-09-09)

## Corpus Check
- 147 files · ~144,660 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 934 nodes · 1526 edges · 72 communities (49 shown, 15 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5b43a362`
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
- stress_test_phase1.cjs
- stress_test_phase1.js
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
- Part 1: Core E-Signature Platform & DocuSign Parity (Phase 1)
- What You Must Do When Invoked
- SignFlow: Comprehensive Feature-by-Feature Checklist
- 3. Core Implemented Workflows & Business Logic
- graphify reference: extra exports and benchmark
- scripts
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
- documentParser.ts
- runLoadAndStressSuite
- localDatabase.ts
- package.json
- signflow.ts
- pdfjs-dist
- react-dom
- @types/react-dom
- compilerOptions
- SignFlowContext.tsx
- Recipient
- CreateEnvelopeModal.tsx

## God Nodes (most connected - your core abstractions)
1. `useSignFlow()` - 85 edges
2. `downloadJsonBundle()` - 20 edges
3. `SignFlowProvider()` - 17 edges
4. `compilerOptions` - 16 edges
5. `downloadCsvFile()` - 14 edges
6. `3. Core Implemented Workflows & Business Logic` - 14 edges
7. `generateUUID()` - 13 edges
8. `openDatabase()` - 13 edges
9. `WorkerPool` - 12 edges
10. `EventBus` - 12 edges

## Surprising Connections (you probably didn't know these)
- `EnvelopePipeline()` --calls--> `useSignFlow()`  [EXTRACTED]
  src/components/dashboard/EnvelopePipeline.tsx → src/context/SignFlowContext.tsx
- `RightInspectorPanel()` --calls--> `useSignFlow()`  [EXTRACTED]
  src/components/dashboard/RightInspectorPanel.tsx → src/context/SignFlowContext.tsx
- `DocHandler` --references--> `WorkerPool`  [EXTRACTED]
  services/document-processor/handlers/doc_handler.go → services/document-processor/processor/worker_pool.go
- `DocHandler` --references--> `EventBus`  [EXTRACTED]
  services/document-processor/handlers/doc_handler.go → services/document-processor/queue/event_bus.go
- `EnvelopeHandler` --references--> `MultiTierCache`  [EXTRACTED]
  services/envelope-service/handlers/envelope_handler.go → services/envelope-service/cache/tier_cache.go

## Import Cycles
- None detected.

## Communities (72 total, 15 thin omitted)

### Community 0 - "useSignFlow"
Cohesion: 0.05
Nodes (61): RFC-4180, App(), MainLayout(), AdminPortal(), ComplianceTrustCenter(), FrameworkDetail, CustomBrandingSettings(), EmailDispatcherConsole() (+53 more)

### Community 1 - "DocumentPrepStudio.tsx"
Cohesion: 0.14
Nodes (14): RightInspectorPanel(), RightInspectorPanelProps, EnvelopeVaultList(), AttachmentItem, ShareEnvelopeModal(), ShareEnvelopeModalProps, INITIAL_ENVELOPES, Envelope (+6 more)

### Community 2 - "net/http.ResponseWriter"
Cohesion: 0.07
Nodes (29): net/http.Handler, net/http.Request, net/http.ResponseWriter, sync.RWMutex, AuditHandler, DocHandler, EnvelopeHandler, EnvelopeStore (+21 more)

### Community 3 - "dependencies"
Cohesion: 0.11
Nodes (19): canvas-confetti, clsx, lucide-react, dependencies, canvas-confetti, clsx, cors, express (+11 more)

### Community 4 - "SigningExperience.tsx"
Cohesion: 0.11
Nodes (21): ContractQABot(), CustomSignatureModal(), CustomSignatureModalProps, DEFAULT_FONTS, INK_COLORS, MobileQRModal(), PaymentFieldModal(), SignatureModal() (+13 more)

### Community 5 - "notification-webhooks/src/server.ts"
Cohesion: 0.09
Nodes (18): DispatchedEmail, dispatchedEmailsLog, EmailDispatchOptions, EmailRecipient, generateSignerInviteHtml(), sendAgreementEmail(), CircuitState, DispatchResult (+10 more)

### Community 6 - "devDependencies"
Cohesion: 0.11
Nodes (19): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/react (+11 more)

### Community 8 - "aiEngine.ts"
Cohesion: 0.18
Nodes (13): AILegalHub(), AIRiskScanner(), ObligationCalendarTracker(), RecipientConfigPanel(), AIDraftClauseSuggestion, AIRiskAnalysis, AIRiskFinding, ObligationItem (+5 more)

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

### Community 18 - "stress_test_phase1.cjs"
Cohesion: 0.31
Nodes (9): http, makeRequest(), runPhase1StressSuite(), executeStressBurst(), worker(), SERVICES, sleep(), { spawn } (+1 more)

### Community 19 - "stress_test_phase1.js"
Cohesion: 0.31
Nodes (9): http, makeRequest(), runPhase1StressSuite(), executeStressBurst(), worker(), SERVICES, sleep(), { spawn } (+1 more)

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

### Community 41 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, backend:build, backend:start, build, dev, preview, test:e2e, test:load

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
Cohesion: 0.16
Nodes (12): JobStatus, PDFJob, EventTopic, NewDocHandler(), enableCORS(), main(), withDocTracing(), WorkerPool (+4 more)

### Community 57 - "unified-backend/src/server.ts"
Cohesion: 0.05
Nodes (27): createAiRouter(), VETTED_CLAUSES, AuditLedgerStore, AuditRecord, createAuditRouter(), createDocumentsRouter(), createEnvelopeRouter(), DocumentField (+19 more)

### Community 58 - "unified-backend/package.json"
Cohesion: 0.09
Nodes (22): dependencies, cors, express, description, devDependencies, @types/cors, @types/express, @types/node (+14 more)

### Community 59 - "documentParser.ts"
Cohesion: 0.25
Nodes (13): CreateEnvelopeModal(), UploadedFileInfo, DocumentPage, generateFullSha256(), calculateFileSha256(), extractPdfText(), extractZipEntry(), formatFileSize() (+5 more)

### Community 61 - "runLoadAndStressSuite"
Cohesion: 0.47
Nodes (3): calculatePercentiles(), runLoadAndStressSuite(), sleep()

### Community 62 - "localDatabase.ts"
Cohesion: 0.34
Nodes (14): SignFlowProvider(), deleteEnvelopeFromDB(), exportDatabaseJSON(), getAllAuditEventsFromDB(), getAllEnvelopesFromDB(), getDatabaseStats(), importDatabaseJSON(), initLocalDatabase() (+6 more)

### Community 63 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 64 - "signflow.ts"
Cohesion: 0.23
Nodes (13): AIDraftingStudio(), AgentExecutionStep, AgreementDocument, AIDraftState, AuditEvent, ContextEnvelope, DraftingSharedMemory, MultiAgentDraftResult (+5 more)

### Community 68 - "compilerOptions"
Cohesion: 0.14
Nodes (13): ES2022, compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, outDir, rootDir (+5 more)

### Community 70 - "SignFlowContext.tsx"
Cohesion: 0.17
Nodes (15): EnvelopePipeline(), ActiveToast, getInitialUrlRouteState(), SignFlowContext, SignFlowContextType, TenantSettings, ToastNotification, UserProfile (+7 more)

### Community 71 - "Recipient"
Cohesion: 0.22
Nodes (6): FIELD_TOOLS, FieldTool, SignSuccessModal(), SignSuccessModalProps, FieldType, Recipient

### Community 75 - "CreateEnvelopeModal.tsx"
Cohesion: 0.31
Nodes (7): CATEGORY_TAGS, CreateEnvelopeModalProps, TemplateRecipientConfig, BulkSendModal(), MOCK_TEMPLATES, AuthType, Template

## Knowledge Gaps
- **344 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+339 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 401 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useSignFlow()` connect `useSignFlow` to `signflow.ts`, `DocumentPrepStudio.tsx`, `SigningExperience.tsx`, `SignFlowContext.tsx`, `Recipient`, `aiEngine.ts`, `CreateEnvelopeModal.tsx`, `documentParser.ts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `Envelope` connect `MultiTierCache` to `net/http.ResponseWriter`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `pdfjs-dist`, `react-dom`, `package.json`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _344 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useSignFlow` be split into smaller, more focused modules?**
  _Cohesion score 0.05016797312430011 - nodes in this community are weakly interconnected._
- **Should `DocumentPrepStudio.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1380952380952381 - nodes in this community are weakly interconnected._
- **Should `net/http.ResponseWriter` be split into smaller, more focused modules?**
  _Cohesion score 0.06557377049180328 - nodes in this community are weakly interconnected._