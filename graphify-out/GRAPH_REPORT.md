# Graph Report - scod  (2026-11-06)

## Corpus Check
- 222 files · ~238,496 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2103 nodes · 2894 edges · 160 communities (121 shown, 33 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `83d0058c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useSignFlow
- downloadJsonBundle
- net/http.ResponseWriter
- dependencies
- securityTokens.ts
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
- Execution — Execute Plans at Scale
- DocumentPrepStudio.tsx
- SignFlowContext.tsx
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
- reverse-engineer-anything/SKILL.md
- AdminPortal.tsx
- WorkflowCanvasBuilder.tsx
- SignFlow: Comprehensive Feature-by-Feature Checklist
- 3. Core Implemented Workflows & Business Logic
- SignFlow Enterprise — Codebase Knowledge Graph & Architecture Report
- Native, managed, and packaged artifacts
- MultiTierCache
- Nielsen's 10 Usability Heuristics
- pdfFlattener.ts
- verify_proof.cjs
- Code Intelligence — Structural Understanding for AI Agents
- Identity Guard — Multi-Account Safety Protocol
- Cultural UX Considerations
- Brainstorm Idea — Strategic Analysis Gate
- Community Skills Registry 🌐
- rules/graphify.md
- workflows/graphify.md
- Categories of Dark Patterns
- Krug's Usability Principles
- Phase 2: Execution (The Gates)
- WorkerPool
- unified-backend/src/server.ts
- unified-backend/package.json
- AuditStore
- runLoadAndStressSuite
- SignFlow — Enterprise AI-Native Electronic Signature & CLM Platform
- Key Principles
- EnvelopeStore
- JsonFileDatabase
- rea_docusign_workflow.mjs
- Heuristic Checklist
- compilerOptions
- ShardRouter
- main
- .ProcessDocument
- docusign_v2_1.ts
- stress_test_phase1.cjs
- .mcp.json
- LocalStorageProvider
- cryptoUtils.ts
- unified-backend/src/rate_limiter.ts
- EnvelopeStore
- Continuity — Working Memory Protocol
- Safe Deploy Pipeline v2
- AuditLedgerStore
- Workflow
- WCAG 2.1 AA Checklist
- Deep Search — Semantic Memory Power-Up
- Test-Driven Development (TDD)
- Clean Code — Code Hygiene Gate
- Safe i18n Translation v2.0
- Terminal Process Monitoring
- Code Review — Request + Receive + Complete
- Procedure
- Systematic Debugging
- Skill Chain Engine
- SigningExperience.tsx
- Reactor — Strategic Codebase Re-direction
- scripts
- Continuity — Working Memory Protocol
- 🏗️ Cody Master Project Bootstrap v2.0
- CodyMaster Shared Helpers
- Planning — Brainstorm + Write Plans
- Gate Implementation
- cm-<name> — <short title>
- CustomSignatureModal.tsx
- Phase 1: Project Type Detection 🔍
- Adaptive Skills Discovery 🧠
- cm-skill-evolution
- bloomFilter.ts
- cm-design-system/SKILL.md
- Phase 3: Design System Foundation 🎨
- cm-sprint-bus — opinionated pipeline + artifacts
- Connection and task recovery
- Step 2: Git Safety Protocol
- Phase 9.5: Working Memory Init 🧠
- REA
- cm-browse — local Playwright daemon
- cm-guardian-runtime — destructive command & freeze checks
- Phase 0: Identity Lock 🔐
- Phase 2: Repository & Environments 🏠
- JavaScript and Electron application artifacts
- Runtime observation
- CM AutoPilot CLI — Conversational Task Supervisor
- Universal Skill Example
- Phase 0.5: Security Foundation 🛡️
- Phase 7: Test Infrastructure 🧪
- cm-retro-cli — operational learnings JSONL
- Agent environments from a live application
- CodyMaster Output Convention
- package.json
- Phase 4: i18n From Day 1 🌍
- safeCalculate
- cm-conductor-worktrees — Deprecated
- cm-dashboard — Deprecated
- cm-design-studio — Deprecated
- cm-engineering-meta — Deprecated
- cm-git-worktrees — Deprecated
- cm-mcp-engineering — MCP tools on context server
- cm-post-deploy-canary — Deprecated
- cm-qa-visual-cli — Deprecated
- cm-second-opinion-cli — Deprecated
- cm-secret-shield — Deprecated
- cm-security-gate — Deprecated
- cm-skill-health — Deprecated
- cm-skill-mastery — Deprecated
- cm-skill-search — Deprecated
- cm-skill-share — Deprecated
- Command: `/cm-start [your objective]`
- cm-test-gate — Deprecated
- cm-ui-preview — Deprecated
- cm-ecosystem-roadmap/SKILL.md
- cm-status/SKILL.md
- Packages and extraction
- Managed PE/CLI
- notifications.ts
- Design: Security Hardening for Login and Email Signing
- Recipient
- CONTINUITY.md — SignFlow Working Memory
- tasks.md
- Envelope
- AINegotiationWorkbench.tsx

## God Nodes (most connected - your core abstractions)
1. `useSignFlow()` - 93 edges
2. `Native, managed, and packaged artifacts` - 30 edges
3. `SignFlowProvider()` - 26 edges
4. `generateUUID()` - 25 edges
5. `downloadJsonBundle()` - 20 edges
6. `🏗️ Cody Master Project Bootstrap v2.0` - 18 edges
7. `scripts` - 16 edges
8. `JsonFileDatabase` - 16 edges
9. `Envelope` - 16 edges
10. `compilerOptions` - 16 edges

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

## Communities (160 total, 33 thin omitted)

### Community 0 - "useSignFlow"
Cohesion: 0.11
Nodes (21): App(), MainLayout(), ObligationTrackerHub(), QESTSPVerificationView(), MetricCards(), CRMMapperView(), FieldMapping, GlobalSearchModal() (+13 more)

### Community 1 - "downloadJsonBundle"
Cohesion: 0.17
Nodes (18): RFC-4180, AnalyticsFunnelExplorer(), AuditEvent, ClauseAnnotation, CoBrowsingRoomView(), Participant, DashboardOverview(), MetricGraphType (+10 more)

### Community 2 - "net/http.ResponseWriter"
Cohesion: 0.26
Nodes (3): net/http.Request, net/http.ResponseWriter, EnvelopeHandler

### Community 3 - "dependencies"
Cohesion: 0.08
Nodes (25): canvas-confetti, clsx, lucide-react, dependencies, canvas-confetti, clsx, cors, express (+17 more)

### Community 4 - "securityTokens.ts"
Cohesion: 0.17
Nodes (17): EmailDispatcherConsole(), VirtualEmail, getInitialUrlRouteState(), UserProfile, getMockDeviceFingerprint(), computeTokenHmac(), createSecureSession(), DEFAULT_SIGNING_LINK_TTL_MS (+9 more)

### Community 5 - "notification-webhooks/src/server.ts"
Cohesion: 0.09
Nodes (18): DispatchedEmail, dispatchedEmailsLog, EmailDispatchOptions, EmailRecipient, generateSignerInviteHtml(), sendAgreementEmail(), CircuitState, DispatchResult (+10 more)

### Community 6 - "devDependencies"
Cohesion: 0.08
Nodes (25): autoprefixer, codymaster, devDependencies, autoprefixer, codymaster, postcss, rea-agents, tailwindcss (+17 more)

### Community 7 - "signflow.ts"
Cohesion: 0.14
Nodes (19): AIDraftingStudio(), EnvelopePipeline(), AgentExecutionStep, AIDraftState, AuditEvent, ConditionalAction, ConditionalOperator, ContextEnvelope (+11 more)

### Community 8 - "aiEngine.ts"
Cohesion: 0.15
Nodes (17): AILegalHub(), AIRiskScanner(), ContractQABot(), ObligationCalendarTracker(), SignerAIDrawer(), AIDraftClauseSuggestion, AIRiskAnalysis, AIRiskFinding (+9 more)

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

### Community 18 - "Execution — Execute Plans at Scale"
Cohesion: 0.05
Nodes (43): Backend — Express/Node, Backend — Python, cm-tasks.json Update Protocol, Common Mistakes, Common Mistakes, Common Mistakes, Execution — Execute Plans at Scale, Frontend — DOM Safety (+35 more)

### Community 19 - "DocumentPrepStudio.tsx"
Cohesion: 0.15
Nodes (21): CATEGORY_TAGS, CreateEnvelopeModal(), CreateEnvelopeModalProps, TemplateRecipientConfig, UploadedFileInfo, AttachmentItem, BulkSendModal(), MOCK_TEMPLATES (+13 more)

### Community 20 - "SignFlowContext.tsx"
Cohesion: 0.14
Nodes (31): ActiveToast, SignFlowContext, SignFlowContextType, SignFlowProvider(), TenantSettings, ToastNotification, INITIAL_ENVELOPES, NegotiationAmendment (+23 more)

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
Cohesion: 0.13
Nodes (14): 1. Project Overview & Identity, 2. Directory Layout & Critical File Reference, 3. Core Implemented Workflows & Business Logic, 4. Development & Build Commands, 5. Non-Negotiable Operational Rules for AI Agents, A. Binary PDF Flattening Engine (`pdfFlattener.ts` & `server_pdf.ts`), B. DocuSign eSignature REST API v2.1 Wire-Compatible Adapter (`docusign_v2_1.ts`), C. Cloud Storage & Persistent Database Layer (`storage.ts` & `database.ts`) (+6 more)

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
Nodes (20): 1. Project Overview & Identity, 2. Key Codebase Layout & Critical Files, 3. Core Implemented Workflows & Business Logic, 4. Development & Build Commands, 5. Non-Negotiable Operational Rules for AI Agents, A. New Envelope Creation Wizard ([CreateEnvelopeModal.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/envelopes/CreateEnvelopeModal.tsx)), B. Interactive 7-Tab Document Studio ([DocumentPrepStudio.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/prepare/DocumentPrepStudio.tsx)), C. Workflow Canvas Builder Exit & Save Controls ([WorkflowCanvasBuilder.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/workflows/WorkflowCanvasBuilder.tsx)) (+12 more)

### Community 40 - "SignFlow Enterprise — Codebase Knowledge Graph & Architecture Report"
Cohesion: 0.17
Nodes (11): 1. Document Signing & Flattening Pipeline, 1. Executive System Architecture, 2. Core God Nodes & Central Abstractions, 2. DocuSign REST API v2.1 Drop-In Adapter Flow, 3. Subsystem Community Map (71 Communities), 4. Architectural Flows & Critical Data Paths, 5. Knowledge Graph Navigation & Tooling, A. Frontend Application & Document Studio (+3 more)

### Community 41 - "Native, managed, and packaged artifacts"
Cohesion: 0.07
Nodes (28): Apple app resources, Apple IPS crash reports, Bridge request ceiling, CPython pyc files, Desktop installation directories, DOS MZ with Ghidra, ELF note tables, Erlang BEAM files (+20 more)

### Community 42 - "MultiTierCache"
Cohesion: 0.31
Nodes (5): CacheEntry, CacheStatus, time.Duration, MultiTierCache, NewMultiTierCache()

### Community 43 - "Nielsen's 10 Usability Heuristics"
Cohesion: 0.05
Nodes (42): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+34 more)

### Community 44 - "pdfFlattener.ts"
Cohesion: 0.18
Nodes (18): RFC-3161, CertificateOfCompletionModal(), UniversalProofVerifierView(), SignSuccessModal(), AgreementDocument, ZeroTrustProofBundle, sha256(), appendCertificateOfCompletion() (+10 more)

### Community 45 - "verify_proof.cjs"
Cohesion: 0.43
Nodes (6): crypto, fs, main(), path, sha256(), verifyProof()

### Community 46 - "Code Intelligence — Structural Understanding for AI Agents"
Cohesion: 0.05
Nodes (41): Adaptive Intelligence Levels, Agent Protocol, Architecture: 4 Layers, cm-brainstorm-idea (Phase 1a — enhanced), cm-debugging (Trace Analysis — enhanced), cm-execution (Pre-flight — enhanced), cm-planning (Impact Analysis — new), cm-start (Step 0.5 — enhanced) (+33 more)

### Community 47 - "Identity Guard — Multi-Account Safety Protocol"
Cohesion: 0.06
Nodes (33): Account Registry (Your Known Accounts), After Rotation, Cloudflare Accounts, Database Accounts, GitHub Accounts, Global vs Local git config, "I deployed to the wrong Cloudflare account", "I pushed to the wrong GitHub repo" (+25 more)

### Community 48 - "Cultural UX Considerations"
Cohesion: 0.06
Nodes (32): Address Fields, Blue, Color Meanings Across Cultures, Content, CSS for RTL, Cultural UX Considerations, Currency, Dates (+24 more)

### Community 49 - "Brainstorm Idea — Strategic Analysis Gate"
Cohesion: 0.07
Nodes (29): 1a. Codebase Scan, 1b. User Context Interview, 1c. Multi-Dimensional Current State, 9 Windows Analysis (TRIZ), Brainstorm Idea — Strategic Analysis Gate, Context Passed to cm-ui-preview, Design Thinking Ideation Rules, Execution Flow (+21 more)

### Community 50 - "Community Skills Registry 🌐"
Cohesion: 0.07
Nodes (29): 🤖 AI & ML (5), 📡 APIs & Integrations (3), 🔐 Authentication (6), ☁️ Cloud & Deployment (7), Community Skills Registry 🌐, 🎨 CSS & UI Design (8), 🗄️ Databases & ORM (9), Engineering Swarm 🔧 (+21 more)

### Community 53 - "Categories of Dark Patterns"
Cohesion: 0.07
Nodes (29): 10. Urgency & Scarcity (False), 1. Forced Continuity, 2. Roach Motel, 3. Privacy Zuckering, 4. Bait and Switch, 5. Confirmshaming, 6. Hidden Costs, 7. Misdirection (+21 more)

### Community 54 - "Krug's Usability Principles"
Cohesion: 0.07
Nodes (29): Accessibility Basics, Breadcrumbs, Common Findings, Don't Make Users Think, Don't Make Words Seem Important If They're Not, Don't Waste Users' Goodwill, Fact 1: We Don't Read, We Scan, Fact 2: We Don't Make Optimal Choices, We Satisfice (+21 more)

### Community 55 - "Phase 2: Execution (The Gates)"
Cohesion: 0.07
Nodes (28): Anti-Patterns, Common Failures, Evidence Requirements for Production Deploy, Gate 1: Pre-Deploy Testing, Gate 2: Evidence Before Claims, Gate 3: Frontend Integrity, Gate 4: Update Working Memory, Integration (+20 more)

### Community 56 - "WorkerPool"
Cohesion: 0.19
Nodes (10): DocHandler, JobStatus, PDFJob, EventTopic, NewDocHandler(), WorkerPool, NewWorkerPool(), EventBus (+2 more)

### Community 57 - "unified-backend/src/server.ts"
Cohesion: 0.15
Nodes (12): createAiRouter(), VETTED_CLAUSES, createDocumentsRouter(), createDocusignOAuthRouter(), aiRouter, app, auditRouter, documentsRouter (+4 more)

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

### Community 63 - "Key Principles"
Cohesion: 0.07
Nodes (28): 1. Context Is King, 1. Simplicity vs. Flexibility, 2. Consistency vs. Context Optimization, 2. Know Your Users, 3. Design for Both When Possible, 3. Efficiency vs. Error Prevention, 4. Discoverability vs. Clean Interface, 4. Make Conscious Trade-offs (+20 more)

### Community 64 - "EnvelopeStore"
Cohesion: 0.29
Nodes (7): sync.RWMutex, EnvelopeStore, NewEnvelopeHandler(), NewEnvelopeStore(), enableCORS(), main(), withTracing()

### Community 66 - "rea_docusign_workflow.mjs"
Cohesion: 0.33
Nodes (6): __dirname, __filename, main(), REA_CLI, ROOT_DIR, runReaCommand()

### Community 67 - "Heuristic Checklist"
Cohesion: 0.07
Nodes (27): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency (+19 more)

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

### Community 75 - ".mcp.json"
Cohesion: 0.67
Nodes (3): node, cm-context, rea

### Community 76 - "LocalStorageProvider"
Cohesion: 0.14
Nodes (4): LocalStorageProvider, storageEngine, StorageObjectMetadata, StorageProvider

### Community 77 - "cryptoUtils.ts"
Cohesion: 0.20
Nodes (12): EnvelopeVaultList(), RecipientConfigPanel(), ContractObligation, ObligationStatus, ObligationType, RecipientRole, formatTimestamp(), generateHmacSignature() (+4 more)

### Community 78 - "unified-backend/src/rate_limiter.ts"
Cohesion: 0.18
Nodes (8): createRateLimiter(), edgeAuthMiddleware(), EdgeRateLimiter, globalEdgeRateLimiter, RateLimitConfig, TenantTier, TIER_CONFIGS, WindowBucket

### Community 80 - "Continuity — Working Memory Protocol"
Cohesion: 0.07
Nodes (26): AT THE END OF EVERY SESSION:, AT THE START OF EVERY SESSION:, `.cm/decisions.json` Format (v2), `.cm/learnings.json` Format (v2 — with Smart Fields), `.cm/meta-learnings.json` Format (Memory Self-Healing Log), cm:// URI Scheme, CONTINUITY.md Template, Continuity — Working Memory Protocol (+18 more)

### Community 81 - "Safe Deploy Pipeline v2"
Cohesion: 0.07
Nodes (26): Composing the Deploy Script, Gate 0.5: Security Scan (Snyk + Aikido — Parallel), Gate 0: Secret Hygiene (FASTEST FAIL — < 0.5 seconds), Gate 1: Syntax Validation (FAST FAIL), Gate 2: Test Suite, Gate 3: i18n Parity Check (for multi-language projects), Gate 4: Build Verification, Gate 5: Dist Asset Verification (NEW) (+18 more)

### Community 82 - "AuditLedgerStore"
Cohesion: 0.36
Nodes (3): AuditLedgerStore, AuditRecord, createAuditRouter()

### Community 83 - "Workflow"
Cohesion: 0.08
Nodes (25): 1. Build New Feature / New Project (Autonomous), 2. Fix Production Bug (Manual), 3. Setup New Project From Scratch, 4. Batch Multi-Language Translation, 9 Golden Rules, 💡 Activation Guide by Use Cases, 🚀 Autonomous Workflow System, CodyMaster Kit — 34 Skills Summary (+17 more)

### Community 84 - "WCAG 2.1 AA Checklist"
Cohesion: 0.08
Nodes (24): 1.1 Text Alternatives, 1.2 Time-based Media, 1.3 Adaptable, 1.4 Distinguishable, 2.1 Keyboard Accessible, 2.2 Enough Time, 2.3 Seizures, 2.4 Navigable (+16 more)

### Community 85 - "Deep Search — Semantic Memory Power-Up"
Cohesion: 0.08
Nodes (23): 1. The "Post-Execution" Sync, 2. The "Pre-Flight" Check, 3. Git Hook (Recommended for User), Deep Search — Semantic Memory Power-Up, Detection Thresholds, Integration, Position in CodyMaster Lifecycle, Requirements (+15 more)

### Community 86 - "Test-Driven Development (TDD)"
Cohesion: 0.08
Nodes (23): Common Rationalizations, Debugging Integration, Example: Bug Fix, Final Rule, Good Tests, GREEN - Minimal Code, Karpathy Discipline — Goal-Driven Execution, Overview (+15 more)

### Community 87 - "Clean Code — Code Hygiene Gate"
Cohesion: 0.09
Nodes (22): Clean Code — Code Hygiene Gate, Commit Convention, Fix 1: Dead Code & Unused Imports, Fix 2: Magic Numbers → Named Constants, Fix 3: Extract Method (TRIZ #2 Taking Out), Fix 4: Reduce Nesting (Guard Clauses), Fix 5: DRY — Extract Shared Logic, Fix 6: Improve Naming (+14 more)

### Community 88 - "Safe i18n Translation v2.0"
Cohesion: 0.09
Nodes (22): HTML Tag Protection (Bug #2), Integration with Other Skills, Overview, Phase 0: Pre-Flight Checks (NEW), Phase 1: Scan ALL Frontend Files (IMPROVED), Phase 2: Extract Batch (MAX 30 strings per batch), Phase 3: 8-Gate Audit (MANDATORY after every batch), Phase 4: Parallel Language Sync (+14 more)

### Community 89 - "Terminal Process Monitoring"
Cohesion: 0.09
Nodes (21): Anti-Patterns, Interactive Commands (dev servers, watch mode), Overview, Parallel Commands, Piped/Chained Commands (`&&`, `|`), Red Flags — STOP and Follow Protocol, Severity Levels, Special Cases (+13 more)

### Community 90 - "Code Review — Request + Receive + Complete"
Cohesion: 0.10
Nodes (19): Anti-Pattern: Performative Agreement, Code Review — Request + Receive + Complete, How to Request, Integration, Karpathy Discipline — Review Checklist, Part A: Requesting Code Review, Part B: Receiving Code Review, Part C: Finishing a Development Branch (+11 more)

### Community 91 - "Procedure"
Cohesion: 0.10
Nodes (19): CLI Quick Start, CM DocKit Development Rules, CM DocKit: Knowledge Systematization Engine, Constraints, Document Types, Output Formats, Procedure, Step 1: Gather Input (Single Consolidated Prompt) (+11 more)

### Community 92 - "Systematic Debugging"
Cohesion: 0.11
Nodes (17): Common Rationalizations, Integration, Overview, Phase 0.5: Memory Integrity Check (BEFORE blaming code), Phase 1: Root Cause Investigation, Phase 2: Pattern Analysis, Phase 3: Hypothesis and Testing, Phase 4: Implementation (+9 more)

### Community 93 - "Skill Chain Engine"
Cohesion: 0.12
Nodes (15): 🐛 bug-fix (3 steps), Built-in Chains, 🔍 cm-code-review (3 steps), 📝 content-launch (3 steps), Context Bus — Inter-Skill Coordination (v5), 🚀 feature-development (up to 3 active steps), For AI Agents, Integration with Other Skills (+7 more)

### Community 94 - "SigningExperience.tsx"
Cohesion: 0.14
Nodes (21): PowerFormPublicView(), PowerFormPublicViewProps, FieldPropertiesModal(), FieldPropertiesModalProps, InCeremonyNegotiationModal(), InCeremonyNegotiationModalProps, MobileQRModal(), PaymentFieldModal() (+13 more)

### Community 95 - "Reactor — Strategic Codebase Re-direction"
Cohesion: 0.13
Nodes (14): Integration, Lifecycle Position, Phase 1: ASSESS — Identify the Contradiction, Phase 2: MAP — Dependency Analysis, Phase 3: DESIGN — Strangler Fig Migration, Phase 4: EXECUTE — Incremental Migration, Phase 5: VERIFY & CLEAN, Reactor — Strategic Codebase Re-direction (+6 more)

### Community 96 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, backend:build, backend:start, build, cm, cm:doctor, cm:quality, cm:status (+8 more)

### Community 97 - "Continuity — Working Memory Protocol"
Cohesion: 0.14
Nodes (13): AT THE END OF EVERY SESSION:, AT THE START OF EVERY SESSION:, CONTINUITY.md Template, Continuity — Working Memory Protocol, DURING WORK:, Integration, Memory Hierarchy, ON ERROR (Self-Correction Loop): (+5 more)

### Community 98 - "🏗️ Cody Master Project Bootstrap v2.0"
Cohesion: 0.15
Nodes (12): 11-Phase Bootstrap Process, Anti-Patterns ❌, 🏗️ Cody Master Project Bootstrap v2.0, Core Principles, Daily Development Loop, Deploy Behavior Rules, Output Checklist ✅, Phase 5: SEO Foundation 🔍 (+4 more)

### Community 99 - "CodyMaster Shared Helpers"
Cohesion: 0.15
Nodes (12): CodyMaster Shared Helpers, #Identity-Check, #Load-Working-Memory, #Outputs-Convention, #Project-Level-Detection, #Save-Decision, Step 1 — Check context bus (free, ~50 tokens), Step 2 — Load L0 indexes first (~600 tokens total) (+4 more)

### Community 100 - "Planning — Brainstorm + Write Plans"
Cohesion: 0.17
Nodes (11): Anti-Patterns, Full Protocol, Integration, Karpathy Discipline — Think Before Coding, Phase A: Brainstorm, Phase B: Write Plan (OpenSpec format), Planning — Brainstorm + Write Plans, Step FINAL: Emit Handoff + Update Continuity (+3 more)

### Community 101 - "Gate Implementation"
Cohesion: 0.17
Nodes (12): Deploy Commands, Gate 1: Identity Check, Gate 2: Branch Check, Gate 3: Test Gate, Gate 4: Build Gate, Gate 5: i18n Gate, Gate 6: Lint Gate, Gate 7: Accessibility Gate (+4 more)

### Community 102 - "cm-<name> — <short title>"
Cohesion: 0.17
Nodes (11): Adaptive Depth, Anti-Patterns, cm-<name> — <short title>, Full Protocol, Integration, Persona Dispatch (optional), Step 1: <name>, Step 2: <name> (+3 more)

### Community 103 - "CustomSignatureModal.tsx"
Cohesion: 0.30
Nodes (10): CustomSignatureModal(), CustomSignatureModalProps, DEFAULT_FONTS, INK_COLORS, CustomSignature, authenticateWithPasskey(), generateChallengeBuffer(), generatePasskeySignatureSvg() (+2 more)

### Community 104 - "Phase 1: Project Type Detection 🔍"
Cohesion: 0.18
Nodes (11): Phase 1: Project Type Detection 🔍, Step 1: Ask Project Type, Step 2: Scaffold Based on Type, Step 3: Install Common Dependencies, Step 4: Mobile-First Setup, Type A: Static Website, Type B: SPA (Vite) — with shadcn/ui, Type C: Cloudflare Workers (+3 more)

### Community 105 - "Adaptive Skills Discovery 🧠"
Cohesion: 0.22
Nodes (9): Adaptive Skills Discovery 🧠, How It Works: The Discovery Loop, Philosophy, Safety Rules, Self-Improvement Loop, Step 1: Search for Skills, Step 2: Install Safely, Step 3: Log What Was Installed (+1 more)

### Community 106 - "cm-skill-evolution"
Cohesion: 0.22
Nodes (8): CAPTURED, cm-skill-evolution, Decision guide, DERIVED, Evolution Loop, FIX, Modes, Output

### Community 107 - "bloomFilter.ts"
Cohesion: 0.10
Nodes (21): AuthView(), AuthViewProps, BloomFilter, BloomSecurityCheckResult, breachedPasswordFilter, COMMON_BREACHED_PASSWORDS, DISPOSABLE_EMAIL_DOMAINS, disposableEmailFilter (+13 more)

### Community 108 - "cm-design-system/SKILL.md"
Cohesion: 0.25
Nodes (7): Constraints, Example 1: Extract design from a URL, Example 2: Scaffold a new robust design system, Example 3: Create a design system in Pencil.dev, Examples, Goal, Instructions

### Community 109 - "Phase 3: Design System Foundation 🎨"
Cohesion: 0.25
Nodes (8): Design System Rules, Phase 3: Design System Foundation 🎨, Step 0: Check for Existing Brand Profile, Step 1: Ask Brand Context (if no profile exists), Step 2: Create Design Tokens, Step 3: Install shadcn/ui Components (SPA/Fullstack projects), Step 4: Mobile-First Base Styles, Step 5: Save Design Profile

### Community 110 - "cm-sprint-bus — opinionated pipeline + artifacts"
Cohesion: 0.25
Nodes (7): Artifacts, CLI, cm-sprint-bus — opinionated pipeline + artifacts, Context bus, Pipeline, Skill mapping (hints), TL;DR

### Community 111 - "Connection and task recovery"
Cohesion: 0.25
Nodes (8): Choose the remedy from the observed failure, Codex tool approval is separate from REA readiness, Connection and task recovery, Continue through an installed CLI, Distinguish client and server deadlines, Recovery ladder, Repair an editable REA limit, Repair registration when needed

### Community 112 - "Step 2: Git Safety Protocol"
Cohesion: 0.29
Nodes (7): Branch Protection Rules, Conventional Commits, First Commit, Phase 6: AGENTS.md + Git Safety 🤖, PR Template (`.github/pull_request_template.md`), Step 1: Create AGENTS.md, Step 2: Git Safety Protocol

### Community 113 - "Phase 9.5: Working Memory Init 🧠"
Cohesion: 0.29
Nodes (7): Phase 9.5: Working Memory Init 🧠, Step 1: Create `.cm/` directory, Step 2: Create CONTINUITY.md, Step 3: Add to .gitignore, Step 4: Add to AGENTS.md, Step 5: Build Local Project Skills Index, Why This Saves Tokens

### Community 114 - "REA"
Cohesion: 0.29
Nodes (7): Connect only when needed, Finish the task, Plan broader investigations, REA, Read only the relevant guide, Route the target first, Work summary-first

### Community 115 - "cm-browse — local Playwright daemon"
Cohesion: 0.33
Nodes (5): CLI, cm-browse — local Playwright daemon, HTTP API (Bearer token), Integrations, When to use

### Community 116 - "cm-guardian-runtime — destructive command & freeze checks"
Cohesion: 0.33
Nodes (5): Behaviour, cm-guardian-runtime — destructive command & freeze checks, Commands, Config, Investigate / debug mode

### Community 117 - "Phase 0: Identity Lock 🔐"
Cohesion: 0.33
Nodes (6): Phase 0: Identity Lock 🔐, Step 1: Check Identity History, Step 2: Ask with Suggestions, Step 3: Verify Identity, Step 4: Create `.project-identity.json`, Step 5: Save to History

### Community 118 - "Phase 2: Repository & Environments 🏠"
Cohesion: 0.33
Nodes (6): Phase 2: Repository & Environments 🏠, Step 1: Initialize Git, Step 2: Create Staging + Production Branches, Step 3: Configure Cloudflare Pages, Step 4: Add Deploy Scripts to package.json, Step 5: Create `.gitignore` (Hardened)

### Community 119 - "JavaScript and Electron application artifacts"
Cohesion: 0.33
Nodes (6): Inventory route candidates without returning the application graph, JavaScript and Electron application artifacts, Read a module without repeating analysis, Recover an oversized display, Reusing application Evidence, Trace only the remaining question

### Community 120 - "Runtime observation"
Cohesion: 0.33
Nodes (5): Browser and Electron, Fiddler Everywhere traffic debugging, Native runtime questions, Runtime observation, Who performs the action

### Community 121 - "CM AutoPilot CLI — Conversational Task Supervisor"
Cohesion: 0.40
Nodes (4): CM AutoPilot CLI — Conversational Task Supervisor, How to run, Requirements, What it does

### Community 122 - "Universal Skill Example"
Cohesion: 0.40
Nodes (4): Context Injection, Sub-agent Instructions, The Instructions, Universal Skill Example

### Community 123 - "Phase 0.5: Security Foundation 🛡️"
Cohesion: 0.40
Nodes (5): Phase 0.5: Security Foundation 🛡️, Step 1: Create `.gitleaks.toml`, Step 2: Setup Pre-Commit Hook, Step 3: Add Security Script, Step 4: Create `.dev.vars.example`

### Community 124 - "Phase 7: Test Infrastructure 🧪"
Cohesion: 0.40
Nodes (5): Phase 7: Test Infrastructure 🧪, Step 1: Create Test Config, Step 2: Frontend Safety Tests, Step 3: i18n Sync Tests, Step 4: Package Scripts

### Community 125 - "cm-retro-cli — operational learnings JSONL"
Cohesion: 0.40
Nodes (4): Append, cm-retro-cli — operational learnings JSONL, Summary, Use with skill evolution

### Community 126 - "Agent environments from a live application"
Cohesion: 0.40
Nodes (5): Agent environments from a live application, Before recording, Check coverage, Export and hand off, Record a session an environment can learn writes from

### Community 127 - "CodyMaster Output Convention"
Cohesion: 0.40
Nodes (4): CodyMaster Output Convention, Naming, Rules, Structure

### Community 128 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 129 - "Phase 4: i18n From Day 1 🌍"
Cohesion: 0.50
Nodes (4): Phase 4: i18n From Day 1 🌍, Step 1: Create i18n Engine, Step 2: Create Language Files, Step 3: i18n Rules

### Community 130 - "safeCalculate"
Cohesion: 1.00
Nodes (4): safeCalculate(), parseExpression(), parseFactor(), parseTerm()

### Community 153 - "notifications.ts"
Cohesion: 0.27
Nodes (8): RFC-5322, checkEmailRateLimit(), createNotificationsRouter(), EmailRateBucket, emailRateLimits, escapeHtml(), validateEmail(), WebhookLogItem

### Community 154 - "Design: Security Hardening for Login and Email Signing"
Cohesion: 0.25
Nodes (7): 1. Cryptographic Magic Links & Token Verification (`src/utils/securityTokens.ts`), 2. Login Hardening (`src/components/auth/AuthView.tsx` & `src/context/SignFlowContext.tsx`), 3. Email Dispatch Security Hardening (`services/unified-backend/src/modules/notifications.ts`), Context & Technical Approach, Design: Security Hardening for Login and Email Signing, Technical Architecture, Verification

### Community 155 - "Recipient"
Cohesion: 0.24
Nodes (5): FIELD_TOOLS, FieldTool, SignSuccessModalProps, FieldType, Recipient

### Community 156 - "CONTINUITY.md — SignFlow Working Memory"
Cohesion: 0.33
Nodes (5): Active Goal, CONTINUITY.md — SignFlow Working Memory, Current Phase, Key Decisions & Implementations, Verification

### Community 158 - "Envelope"
Cohesion: 0.38
Nodes (5): RightInspectorPanel(), RightInspectorPanelProps, ShareEnvelopeModal(), ShareEnvelopeModalProps, Envelope

### Community 159 - "AINegotiationWorkbench.tsx"
Cohesion: 0.40
Nodes (4): AINegotiationWorkbench(), RedlineClause, CLAUSE_LIBRARY, ClauseItem

## Knowledge Gaps
- **1129 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+1124 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1248 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useSignFlow()` connect `useSignFlow` to `downloadJsonBundle`, `AdminPortal.tsx`, `securityTokens.ts`, `WorkflowCanvasBuilder.tsx`, `signflow.ts`, `aiEngine.ts`, `CustomSignatureModal.tsx`, `bloomFilter.ts`, `pdfFlattener.ts`, `cryptoUtils.ts`, `DocumentPrepStudio.tsx`, `SignFlowContext.tsx`, `SigningExperience.tsx`, `Recipient`, `Envelope`, `AINegotiationWorkbench.tsx`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `🏗️ Cody Master Project Bootstrap v2.0` connect `🏗️ Cody Master Project Bootstrap v2.0` to `Phase 4: i18n From Day 1 🌍`, `Gate Implementation`, `Phase 1: Project Type Detection 🔍`, `Adaptive Skills Discovery 🧠`, `Phase 3: Design System Foundation 🎨`, `Step 2: Git Safety Protocol`, `Phase 9.5: Working Memory Init 🧠`, `Phase 0: Identity Lock 🔐`, `Phase 2: Repository & Environments 🏠`, `Phase 0.5: Security Foundation 🛡️`, `Phase 7: Test Infrastructure 🧪`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `JsonFileDatabase` connect `JsonFileDatabase` to `docusign_v2_1.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _1129 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useSignFlow` be split into smaller, more focused modules?**
  _Cohesion score 0.10952380952380952 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `notification-webhooks/src/server.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08817204301075268 - nodes in this community are weakly interconnected._