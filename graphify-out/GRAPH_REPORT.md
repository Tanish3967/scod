# Graph Report - scod  (2026-09-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 588 nodes · 1075 edges · 35 communities (24 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1979b705`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useSignFlow
- SignFlowContext.tsx
- net/http.ResponseWriter
- dependencies
- notification-webhooks/src/server.ts
- devDependencies
- MultiTierCache
- aiEngine.ts
- WorkerPool
- compilerOptions
- rate_limiter.ts
- ai-orchestrator/package.json
- api-gateway/package.json
- notification-webhooks/package.json
- SigningExperience.tsx
- compilerOptions
- compilerOptions
- compilerOptions
- stress_test_phase1.cjs
- stress_test_phase1.js
- test_phase2_sharding_cache.cjs
- test_phase3_worker_pool.cjs
- test_phase4_edge_fanout_mesh.cjs
- runPhase5Suite
- ai-orchestrator/src/server.ts
- github.com/signflow/audit-trail-service
- github.com/signflow/document-processor
- github.com/signflow/envelope-service
- github.com/signflow/send-email-resend

## God Nodes (most connected - your core abstractions)
1. `useSignFlow()` - 79 edges
2. `downloadJsonBundle()` - 17 edges
3. `SignFlowProvider()` - 16 edges
4. `compilerOptions` - 16 edges
5. `openDatabase()` - 13 edges
6. `downloadCsvFile()` - 12 edges
7. `WorkerPool` - 12 edges
8. `EventBus` - 12 edges
9. `EnvelopeHandler` - 11 edges
10. `MultiTierCache` - 11 edges

## Surprising Connections (you probably didn't know these)
- `EnvelopePipeline()` --calls--> `useSignFlow()`  [EXTRACTED]
  src/components/dashboard/EnvelopePipeline.tsx → src/context/SignFlowContext.tsx
- `RightInspectorPanel()` --calls--> `useSignFlow()`  [EXTRACTED]
  src/components/dashboard/RightInspectorPanel.tsx → src/context/SignFlowContext.tsx
- `RightInspectorPanelProps` --references--> `Envelope`  [EXTRACTED]
  src/components/dashboard/RightInspectorPanel.tsx → src/types/signflow.ts
- `FieldTool` --references--> `FieldType`  [EXTRACTED]
  src/components/prepare/FieldPalette.tsx → src/types/signflow.ts
- `MainLayout()` --calls--> `useSignFlow()`  [EXTRACTED]
  src/App.tsx → src/context/SignFlowContext.tsx

## Import Cycles
- None detected.

## Communities (35 total, 5 thin omitted)

### Community 0 - "useSignFlow"
Cohesion: 0.06
Nodes (51): RFC-4180, App(), MainLayout(), AdminPortal(), ComplianceTrustCenter(), FrameworkDetail, CustomBrandingSettings(), EmailDispatcherConsole() (+43 more)

### Community 1 - "SignFlowContext.tsx"
Cohesion: 0.06
Nodes (60): EnvelopePipeline(), RightInspectorPanel(), RightInspectorPanelProps, EnvelopeVaultList(), FIELD_TOOLS, FieldTool, RecipientConfigPanel(), CustomSignatureModal() (+52 more)

### Community 2 - "net/http.ResponseWriter"
Cohesion: 0.07
Nodes (29): net/http.Handler, net/http.Request, net/http.ResponseWriter, sync.RWMutex, AuditHandler, DocHandler, EnvelopeHandler, EnvelopeStore (+21 more)

### Community 3 - "dependencies"
Cohesion: 0.06
Nodes (39): canvas-confetti, clsx, lucide-react, dependencies, canvas-confetti, clsx, cors, express (+31 more)

### Community 4 - "notification-webhooks/src/server.ts"
Cohesion: 0.09
Nodes (18): DispatchedEmail, dispatchedEmailsLog, EmailDispatchOptions, EmailRecipient, generateSignerInviteHtml(), sendAgreementEmail(), CircuitState, DispatchResult (+10 more)

### Community 5 - "devDependencies"
Cohesion: 0.07
Nodes (27): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/react (+19 more)

### Community 6 - "MultiTierCache"
Cohesion: 0.14
Nodes (19): CacheEntry, CacheStatus, time.Duration, time.Time, AgreementDocument, AuthType, DocumentField, DocumentPage (+11 more)

### Community 7 - "aiEngine.ts"
Cohesion: 0.14
Nodes (16): AIDraftingStudio(), AILegalHub(), AIRiskScanner(), ContractQABot(), ObligationCalendarTracker(), RedlineClause, SignerAIDrawer(), CLAUSE_LIBRARY (+8 more)

### Community 8 - "WorkerPool"
Cohesion: 0.16
Nodes (12): JobStatus, PDFJob, EventTopic, NewDocHandler(), enableCORS(), main(), withDocTracing(), WorkerPool (+4 more)

### Community 9 - "compilerOptions"
Cohesion: 0.09
Nodes (21): DOM, DOM.Iterable, ES2020, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib (+13 more)

### Community 10 - "rate_limiter.ts"
Cohesion: 0.15
Nodes (7): EdgeRateLimiter, globalEdgeRateLimiter, RateLimitConfig, TenantTier, TIER_CONFIGS, WindowBucket, app

### Community 11 - "ai-orchestrator/package.json"
Cohesion: 0.14
Nodes (13): dependencies, cors, express, description, cors, express, main, name (+5 more)

### Community 12 - "api-gateway/package.json"
Cohesion: 0.14
Nodes (13): dependencies, cors, express, description, cors, express, main, name (+5 more)

### Community 13 - "notification-webhooks/package.json"
Cohesion: 0.14
Nodes (13): dependencies, cors, express, description, cors, express, main, name (+5 more)

### Community 14 - "SigningExperience.tsx"
Cohesion: 0.22
Nodes (8): MobileQRModal(), PaymentFieldModal(), SignatureModal(), SignatureOutput, SignSuccessModal(), LocalizationStrings, SIGNER_LOCALIZATION, SignerLanguage

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

### Community 20 - "test_phase2_sharding_cache.cjs"
Cohesion: 0.33
Nodes (8): crypto, getHashKey(), http, jumpConsistentHash(), makeRequest(), runPhase2ShardingCacheSuite(), sleep(), { spawn }

### Community 21 - "test_phase3_worker_pool.cjs"
Cohesion: 0.38
Nodes (6): crypto, http, makeRequest(), runPhase3WorkerPoolSuite(), sleep(), { spawn }

### Community 22 - "test_phase4_edge_fanout_mesh.cjs"
Cohesion: 0.38
Nodes (6): crypto, http, makeRequest(), runPhase4EdgeMeshSuite(), sleep(), { spawn }

### Community 23 - "runPhase5Suite"
Cohesion: 0.60
Nodes (3): getJson(), postJson(), runPhase5Suite()

## Knowledge Gaps
- **157 isolated node(s):** `FrameworkDetail`, `VirtualEmail`, `AuditEvent`, `ClauseAnnotation`, `Participant` (+152 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 186 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useSignFlow()` connect `useSignFlow` to `SignFlowContext.tsx`, `SigningExperience.tsx`, `aiEngine.ts`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `dependencies`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `FrameworkDetail`, `VirtualEmail`, `AuditEvent` to the rest of the system?**
  _157 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useSignFlow` be split into smaller, more focused modules?**
  _Cohesion score 0.05871725383920506 - nodes in this community are weakly interconnected._
- **Should `SignFlowContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06360759493670887 - nodes in this community are weakly interconnected._
- **Should `net/http.ResponseWriter` be split into smaller, more focused modules?**
  _Cohesion score 0.06779661016949153 - nodes in this community are weakly interconnected._