# Graph Report - scod  (2026-09-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 472 nodes · 880 edges · 29 communities (17 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1fe9bc96`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useSignFlow
- SignFlowContext.tsx
- dependencies
- net/http.ResponseWriter
- devDependencies
- envelope.go
- aiEngine.ts
- compilerOptions
- ai-orchestrator/package.json
- api-gateway/package.json
- notification-webhooks/package.json
- SigningExperience.tsx
- compilerOptions
- compilerOptions
- compilerOptions
- email_service.ts
- runPhase5Suite
- api-gateway/src/server.ts
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
7. `compilerOptions` - 10 edges
8. `compilerOptions` - 10 edges
9. `compilerOptions` - 10 edges
10. `SignFlowContextType` - 9 edges

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

## Communities (29 total, 6 thin omitted)

### Community 0 - "useSignFlow"
Cohesion: 0.06
Nodes (52): RFC-4180, App(), MainLayout(), AdminPortal(), ComplianceTrustCenter(), FrameworkDetail, CustomBrandingSettings(), EmailDispatcherConsole() (+44 more)

### Community 1 - "SignFlowContext.tsx"
Cohesion: 0.06
Nodes (59): EnvelopePipeline(), RightInspectorPanel(), RightInspectorPanelProps, EnvelopeVaultList(), FIELD_TOOLS, FieldTool, RecipientConfigPanel(), CustomSignatureModal() (+51 more)

### Community 2 - "dependencies"
Cohesion: 0.06
Nodes (39): canvas-confetti, clsx, lucide-react, dependencies, canvas-confetti, clsx, cors, express (+31 more)

### Community 3 - "net/http.ResponseWriter"
Cohesion: 0.10
Nodes (22): net/http.Handler, net/http.Request, net/http.ResponseWriter, AuditHandler, DocHandler, EnvelopeHandler, EnvelopeStore, DetectedField (+14 more)

### Community 4 - "devDependencies"
Cohesion: 0.07
Nodes (27): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/react (+19 more)

### Community 5 - "envelope.go"
Cohesion: 0.13
Nodes (19): sync.RWMutex, time.Time, AuditEvent, AgreementDocument, AuthType, DocumentField, DocumentPage, EnvelopeSender (+11 more)

### Community 6 - "aiEngine.ts"
Cohesion: 0.14
Nodes (16): AIDraftingStudio(), AILegalHub(), AIRiskScanner(), ContractQABot(), ObligationCalendarTracker(), RedlineClause, SignerAIDrawer(), CLAUSE_LIBRARY (+8 more)

### Community 7 - "compilerOptions"
Cohesion: 0.09
Nodes (21): DOM, DOM.Iterable, ES2020, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib (+13 more)

### Community 8 - "ai-orchestrator/package.json"
Cohesion: 0.14
Nodes (13): dependencies, cors, express, description, cors, express, main, name (+5 more)

### Community 9 - "api-gateway/package.json"
Cohesion: 0.14
Nodes (13): dependencies, cors, express, description, cors, express, main, name (+5 more)

### Community 10 - "notification-webhooks/package.json"
Cohesion: 0.14
Nodes (13): dependencies, cors, express, description, cors, express, main, name (+5 more)

### Community 11 - "SigningExperience.tsx"
Cohesion: 0.22
Nodes (8): MobileQRModal(), PaymentFieldModal(), SignatureModal(), SignatureOutput, SignSuccessModal(), LocalizationStrings, SIGNER_LOCALIZATION, SignerLanguage

### Community 12 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 13 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 14 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 15 - "email_service.ts"
Cohesion: 0.21
Nodes (9): DispatchedEmail, dispatchedEmailsLog, EmailDispatchOptions, EmailRecipient, generateSignerInviteHtml(), sendAgreementEmail(), app, deliveryLogs (+1 more)

### Community 16 - "runPhase5Suite"
Cohesion: 0.60
Nodes (3): getJson(), postJson(), runPhase5Suite()

## Knowledge Gaps
- **134 isolated node(s):** `FrameworkDetail`, `VirtualEmail`, `AuditEvent`, `ClauseAnnotation`, `Participant` (+129 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 151 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useSignFlow()` connect `useSignFlow` to `SignFlowContext.tsx`, `SigningExperience.tsx`, `aiEngine.ts`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `dependencies`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `FrameworkDetail`, `VirtualEmail`, `AuditEvent` to the rest of the system?**
  _134 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useSignFlow` be split into smaller, more focused modules?**
  _Cohesion score 0.05759623861298854 - nodes in this community are weakly interconnected._
- **Should `SignFlowContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06491398896462187 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06072874493927125 - nodes in this community are weakly interconnected._