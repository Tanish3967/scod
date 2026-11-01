# Graph Report - scod  (2026-09-07)

## Corpus Check
- 133 files · ~121,602 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 797 nodes · 1329 edges · 61 communities (37 shown, 16 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5b43a362`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useSignFlow
- SignFlowContext.tsx
- net/http.ResponseWriter
- dependencies
- SigningExperience.tsx
- notification-webhooks/src/server.ts
- devDependencies
- aiEngine.ts
- WorkerPool
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
- runPhase5Suite
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
- package.json
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
- lucide-react
- cors
- @types/canvas-confetti
- @vitejs/plugin-react

## God Nodes (most connected - your core abstractions)
1. `useSignFlow()` - 81 edges
2. `downloadJsonBundle()` - 20 edges
3. `SignFlowProvider()` - 16 edges
4. `compilerOptions` - 16 edges
5. `downloadCsvFile()` - 14 edges
6. `openDatabase()` - 13 edges
7. `WorkerPool` - 12 edges
8. `EventBus` - 12 edges
9. `EnvelopeHandler` - 12 edges
10. `What You Must Do When Invoked` - 12 edges

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

## Communities (61 total, 16 thin omitted)

### Community 0 - "useSignFlow"
Cohesion: 0.05
Nodes (59): RFC-4180, App(), MainLayout(), AdminPortal(), ComplianceTrustCenter(), FrameworkDetail, CustomBrandingSettings(), EmailDispatcherConsole() (+51 more)

### Community 1 - "SignFlowContext.tsx"
Cohesion: 0.06
Nodes (64): EnvelopePipeline(), RightInspectorPanel(), RightInspectorPanelProps, CATEGORY_TAGS, CreateEnvelopeModal(), CreateEnvelopeModalProps, UploadedFileInfo, FIELD_TOOLS (+56 more)

### Community 2 - "net/http.ResponseWriter"
Cohesion: 0.07
Nodes (29): net/http.Handler, net/http.Request, net/http.ResponseWriter, sync.RWMutex, AuditHandler, DocHandler, EnvelopeHandler, EnvelopeStore (+21 more)

### Community 3 - "dependencies"
Cohesion: 0.12
Nodes (17): canvas-confetti, clsx, dependencies, canvas-confetti, clsx, express, react, react-dom (+9 more)

### Community 4 - "SigningExperience.tsx"
Cohesion: 0.13
Nodes (18): CustomSignatureModal(), CustomSignatureModalProps, DEFAULT_FONTS, INK_COLORS, MobileQRModal(), PaymentFieldModal(), SignatureModal(), SignatureOutput (+10 more)

### Community 5 - "notification-webhooks/src/server.ts"
Cohesion: 0.09
Nodes (18): DispatchedEmail, dispatchedEmailsLog, EmailDispatchOptions, EmailRecipient, generateSignerInviteHtml(), sendAgreementEmail(), CircuitState, DispatchResult (+10 more)

### Community 6 - "devDependencies"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @tailwindcss/postcss, @types/react, @types/react-dom (+9 more)

### Community 8 - "aiEngine.ts"
Cohesion: 0.14
Nodes (17): AIDraftingStudio(), AILegalHub(), AIRiskScanner(), ContractQABot(), ObligationCalendarTracker(), RedlineClause, SignerAIDrawer(), CLAUSE_LIBRARY (+9 more)

### Community 9 - "WorkerPool"
Cohesion: 0.08
Nodes (31): CacheEntry, CacheStatus, time.Duration, time.Time, AgreementDocument, AuthType, DocumentField, DocumentPage (+23 more)

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

### Community 24 - "runPhase5Suite"
Cohesion: 0.53
Nodes (4): getJson(), postJson(), runPhase5Suite(), sleep()

### Community 36 - "Part 1: Core E-Signature Platform & DocuSign Parity (Phase 1)"
Cohesion: 0.06
Nodes (33): 1.1 Envelope Lifecycle State Machine, 1.2 Multi-Page Document Studio Canvas, 1.3 13 Standard & Specialized Field Types, 1.4 Advanced Recipient Routing Engine, 1.5 Tiered Signer Authentication Gates, 1.6 High-Fidelity Guided Signing Experience, 1.7 Master Templates, PowerForms & CSV Bulk Send, 2.1 Multi-Provider Email Gateway (+25 more)

### Community 37 - "What You Must Do When Invoked"
Cohesion: 0.07
Nodes (26): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+18 more)

### Community 38 - "SignFlow: Comprehensive Feature-by-Feature Checklist"
Cohesion: 0.10
Nodes (20): 1. AI Legal Engine (`src/utils/aiEngine.ts` & `src/components/ai/`), 1. Cryptographic Certificate of Completion & Tamper Locking, 1. Email Dispatcher & Signer Simulation (`src/components/admin/EmailDispatcherConsole.tsx`), 1. Enterprise Notifications (`src/components/layout/NotificationCenterDrawer.tsx` & `NotificationToast.tsx`), 1. Envelope Lifecycle State Machine, 1. Microservices Mesh, 1. Obsidian & Lumina Precision Design System, 1. Offline Database & Storage Manager (`src/components/admin/LocalDatabaseManagerView.tsx`) (+12 more)

### Community 39 - "3. Core Implemented Workflows & Business Logic"
Cohesion: 0.12
Nodes (16): 1. Project Overview & Identity, 2. Key Codebase Layout & Critical Files, 3. Core Implemented Workflows & Business Logic, 4. Development & Build Commands, 5. Non-Negotiable Operational Rules for AI Agents, A. New Envelope Creation Wizard ([CreateEnvelopeModal.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/envelopes/CreateEnvelopeModal.tsx)), B. Interactive 7-Tab Document Studio ([DocumentPrepStudio.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/prepare/DocumentPrepStudio.tsx)), C. Workflow Canvas Builder Exit & Save Controls ([WorkflowCanvasBuilder.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/workflows/WorkflowCanvasBuilder.tsx)) (+8 more)

### Community 40 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 41 - "package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, preview, type, version

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

## Knowledge Gaps
- **288 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+283 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 339 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useSignFlow()` connect `useSignFlow` to `aiEngine.ts`, `SignFlowContext.tsx`, `SigningExperience.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `Envelope` connect `WorkerPool` to `net/http.ResponseWriter`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _288 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useSignFlow` be split into smaller, more focused modules?**
  _Cohesion score 0.054945054945054944 - nodes in this community are weakly interconnected._
- **Should `SignFlowContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06376726417866588 - nodes in this community are weakly interconnected._
- **Should `net/http.ResponseWriter` be split into smaller, more focused modules?**
  _Cohesion score 0.06557377049180328 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._