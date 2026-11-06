# SignFlow — Enterprise AI Agent Memory & System Blueprint

> **CRITICAL FOR ALL AI AGENTS**: Read this file first upon entering the repository. This document serves as the persistent memory, architectural guide, workflow blueprint, and operational rulebook for the **SignFlow** codebase.

---

## 1. Project Overview & Identity
- **Project Name**: **SignFlow** (AI-Native Electronic Signature, Contract Lifecycle Management & Remote Notarization Platform).
- **Core Value Proposition**: Enterprise-grade DocuSign/Adobe Sign parity combined with autonomous AI contract intelligence, EU eIDAS Qualified Electronic Signatures (QES), Remote Online Notarization (RON) with live webcam biometrics, and cryptographic SHA-256 tamper-evident sealing.
- **Frontend Stack**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Canvas API, IndexedDB.
- **Backend Architecture**: Unified Backend Service Engine (`services/unified-backend/` on `:8090` / `:8080`) with in-process zero-network-hop modules:
  - `Envelopes & Sharding Module` (`/api/v1/envelopes`)
  - `Cryptographic Merkle Audit Ledger Module` (`/api/v1/audit`)
  - `Document Processing & Layout Engine` (`/api/v1/documents`)
  - `AI Orchestrator & Swarm Drafter Module` (`/api/v1/ai`)
  - `Transactional Emails & HMAC Webhooks Module` (`/api/v1/emails`, `/api/v1/webhooks`)
  - `Edge Telemetry & Prometheus Metrics` (`/health`, `/metrics`, `/api/v1/edge/telemetry`)

---

## 2. Key Codebase Layout & Critical Files

```
c:/Users/KIIT/Desktop/scod/
├── src/
│   ├── components/
│   │   ├── dashboard/       # DashboardOverview.tsx (Executive KPIs, sparklines, pipeline table)
│   │   ├── prepare/         # DocumentPrepStudio.tsx (7-Tab studio: Document, Workflow, Signers, History, Activity, Attachments, Audit Trail)
│   │   ├── signatures/      # CustomSignatureModal.tsx (5-tab designer: Draw, Fonts, Upload, Seal, Vault)
│   │   ├── signing/         # SigningExperience.tsx (Guided Signer Experience with QR mobile transfer & Passkey)
│   │   ├── notary/          # NotarySessionView.tsx (Live webcam getUserMedia, Biometric HUD, State Seal)
│   │   ├── envelopes/       # EnvelopeVaultList.tsx & CreateEnvelopeModal.tsx (Custom Upload, Stored Drafts, AI Drafter)
│   │   ├── certificate/     # CertificateOfCompletionModal.tsx (Cryptographic audit ledger & export)
│   │   ├── layout/          # Navbar.tsx, Sidebar.tsx, NotificationToast.tsx, NotificationCenterDrawer.tsx
│   │   ├── compliance/      # QESTSPVerificationView.tsx (EU eIDAS Tier 3 QES & TSP Hub)
│   │   ├── admin/           # LocalDatabaseManagerView.tsx, EmailDispatcherConsole.tsx, ComplianceTrustCenter.tsx
│   │   ├── ai/              # AILegalHub.tsx, ContractQABot.tsx (AI drafter, RAG, Playbook reviews)
│   │   ├── clm/             # AINegotiationWorkbench.tsx (Side-by-side redlining & negotiation)
│   │   ├── collaborate/     # LiveCoBrowsingRoom.tsx (Multi-party WebRTC cursor collaboration)
│   │   ├── integrations/    # CRMSyncHub.tsx (Salesforce & HubSpot CRM bidirectional sync)
│   │   ├── offline/         # OfflineSigningQueue.tsx (Service Worker & IndexedDB mobile PWA queue)
│   │   ├── migration/       # LegacyMigrationImporterView.tsx (Batch XML/PDF DocuSign converter)
│   │   └── workflows/       # WorkflowCanvasBuilder.tsx (Visual drag-and-drop routing canvas with Save/Exit modal)
│   ├── context/
│   │   └── SignFlowContext.tsx  # Master state machine, IndexedDB persistence, sealing, unlock actions
│   ├── types/
│   │   └── signflow.ts      # TypeScript interfaces (Envelope, DocumentField, CustomSignature, AuditEvent, Recipient)
│   ├── utils/
│   │   ├── cryptoUtils.ts   # SHA-256 hashing, HMAC signatures, UUID generator, formatTimestamp
│   │   ├── pdfRasterizer.ts # Client-side PDF.js high-DPI page rasterizer & text extractor
│   │   ├── documentParser.ts # Multi-format document parser (.pdf, .docx, .md, .txt) with vector canvas rendering
│   │   ├── aiMultiAgentDrafter.ts # Multi-agent collaborative long-form drafting engine (5-50+ pages, Shared Knowledge Store)
│   │   ├── aiEngine.ts      # Smart field detection, risk scanning, obligation extraction
│   │   ├── localDatabase.ts # Browser IndexedDB storage manager (5 stores, backup export/import)
│   │   └── downloadUtils.ts # RFC-4180 CSV and JSON file download handlers
│   ├── index.css            # Stitch Obsidian & Lumina precision design tokens, typography, keyframes
│   └── App.tsx              # Router, global modal mounts, and active view switcher
├── services/                # Backend microservices in Go and Node.js TypeScript
├── feature_checklist.md     # Master feature inventory and compliance checklist
└── tools/
    └── run_e2e_suite.js     # Automated 9/9 integration test runner
```

---

## 3. Core Implemented Workflows & Business Logic

### A. New Envelope Creation Wizard ([CreateEnvelopeModal.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/envelopes/CreateEnvelopeModal.tsx))
- **Tab 1: Upload Custom Document (Default)**:
  - Drag-and-drop dropzone supporting `.pdf`, `.docx`, `.doc`, `.txt`, `.md`, `.png`, and `.jpg` files.
  - Client-side **PDF.js high-DPI rasterization** (`pdfjs-dist`): Renders authentic visual pages as crisp vector data URLs (`imageUrl`) alongside full extracted text streams for AI RAG.
  - Real-time client-side Web Crypto **SHA-256 hash** calculation for tamper-evident Merkle anchoring.
  - Multi-signer routing configuration with authentication factor setup (`email`, `passkey_webauthn`, `sms_otp`, `idv_biometric`).
- **Tab 2: Stored Drafts & Templates**: Searchable library of master enterprise templates (*Mutual Non-Disclosure Agreement*, *Executive Offer Letter*, *Master Services Agreement*, *Commercial Lease Agreement*) with 1-click execution.
- **Tab 3: Blank Slate / AI Multi-Agent Drafter**: Multi-Agent Swarm drafting engine scaling from 5 to 50+ pages via `executeMultiAgentDraft`, centralized `DraftingSharedMemory`, compact context envelopes, verified TOC, and instant conversion to live envelopes.

---

### B. Interactive 7-Tab Document Studio ([DocumentPrepStudio.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/prepare/DocumentPrepStudio.tsx))
- **Tab 1 (`Document`)**: 680px paper canvas with thumbnail selector, zoom controls, field placement palette, and side-by-side custom signature blocks (*Disclosing Party John Smith & Receiving Party Alice Morgan*).
- **Tab 2 (`Workflow`)**: Interactive visual flowchart pipeline showing sequential steps, branch gates, and 1-click fullscreen canvas launcher.
- **Tab 3 (`Signers`)**: Signers & recipients hub with delivery/signature status pills, auth badges, `+ Add Signer` modal, custom signature design shortcuts, and live signing simulation triggers.
- **Tab 4 (`History`)**: Document revision timeline (*v2.0 Active Live, v1.1 Counterparty Amendments, v1.0 Genesis Draft*), legal justification logs, author attribution, and redline export.
- **Tab 5 (`Activity`)**: Chronological real-time security telemetry stream with actor IPs, geolocations, devices, user-agents, timestamps, category filters (*Signatures, Security & 2FA, Cryptographic Seals, System*), and CSV download.
- **Tab 6 (`Attachments`)**: Supporting exhibits & addenda vault (*Exhibit A SOW, Exhibit B DPA, Certificate of Good Standing*) with SHA-256 checksum badges, drag-and-drop uploader, mandatory review toggles, preview, and download actions.
- **Tab 7 (`Audit Trail`)**: Tamper-evident SHA-256 Merkle ledger, root hash badge, 5 anchored ledger blocks with previous/current hashes, live Merkle chain integrity validator, and 1-click Certificate of Completion modal trigger.

---

### C. Workflow Canvas Builder Exit & Save Controls ([WorkflowCanvasBuilder.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/workflows/WorkflowCanvasBuilder.tsx))
- **Unsaved Modifications State Tracking**: Snapshot comparison between `initialNodesSnapshot` and current `nodes`.
- **Top Action Bar**: `Exit Editor` (back button), `Save` (in-place sync), `Save & Exit`, `Exit`, and dynamic `⚠️ Unsaved Changes` / `✓ Synced` badge.
- **Unsaved Workflow Changes Confirmation Modal**:
  - `Save & Exit`: Persists pipeline to active envelope and navigates to Studio (`prepare`) or Dashboard (`dashboard`).
  - `Exit Without Saving`: Reverts nodes to snapshot, shows toast notification (*"Workflow Changes Discarded"*), and navigates back.
  - `Keep Editing`: Dismisses modal and stays in the builder.
- **Sticky Floating Bottom Bar**: Real-time step counter, unsaved edits badge, `Discard & Exit`, `Save & Exit to Studio`, and `Dashboard` shortcuts.

---

### D. Custom Electronic Signatures Suite ([CustomSignatureModal.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/signatures/CustomSignatureModal.tsx))
- **5 Modes**:
  1. **Draw Pad**: High-DPI HTML5 canvas with 5 ink colors (*Deep Indigo*, *Midnight Slate*, *Royal Blue*, *Emerald*, *Burgundy*), stroke thickness presets (*Fine*, *Medium*, *Bold*), undo stroke history, and 1-click clear.
  2. **Type Calligraphy**: 5 legal Google fonts (*Dancing Script*, *Great Vibes*, *Caveat*, *Sacramento*, *Alex Brush*).
  3. **Upload Scans**: PNG/JPG uploader with transparent contrast cleaner.
  4. **Official Seals**: Corporate & Notary seal generator with date stamp.
  5. **Saved Vault**: Reusable account library.

---

### E. Post-Signature Sealing, PKI & Revision Management
- **Automated Certificate Appending**: When all required signers sign, the system generates and appends the **Certificate of Completion** as the final page of the PDF.
- **Tamper-Evident Lock**: Sets `isLocked: true`, locks fields as read-only, and renders the green `🔒 Document Cryptographically Sealed & Locked` banner.
- **Tamper Audit Logging**: Any post-seal modification triggers `recordTamperingAttempt` which logs an alert into the immutable SHA-256 Merkle chain.
- **Authorized Unlock & Revision (`unlockEnvelopeForRevision`)**:
  - Prompts legal reason confirmation modal.
  - Invalidates prior seal and signatures, creates **Version 2.0**, and logs the unlock event in the audit ledger.
  - Reopens Document Studio for clause editing.
  - Admin clicks **"Re-Send for Signatures (v2.0)"** (`resendEnvelopeForSigning`) to dispatch fresh tokenized magic links.

---

### F. Remote Online Notarization (RON) Studio & Live Webcam ([NotarySessionView.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/notary/NotarySessionView.tsx))
- **Hardware Camera**: Directly captures real webcam video and microphone audio via `navigator.mediaDevices.getUserMedia`.
- **Biometric HUD Overlay**: Green corner tracking brackets with live liveness score (`✓ Biometric Face Tracked (99.8%)`) and signer identity tag (`Marcus Vance (IDV Verified)`).
- **Recording Telemetry**: Live encrypted recording timer (`REC 🔴 04:28`), stream resolution badge (`1080p Encrypted Feed`), audio waveform active meters, and IDV credential check.
- **Official Seal**: Affixes State of Texas digital notary seal and logs entry into the local database journal.

---

### G. Transactional Email Gateway & Secondary Signer Flow ([EmailDispatcherConsole.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/admin/EmailDispatcherConsole.tsx))
- **Providers**: Resend API, Twilio SendGrid, Custom SMTP, Virtual Sandbox.
- **Sequential Flow**: Secondary signer receives notification (*"John Smith has signed, your signature is needed"*) with step tracker (`1. John Smith: Signed ✓` → `2. Alice Morgan: Awaiting Signature ⏳`).
- **Tokenized Magic Link**: 1-Click **"Simulate Review & Sign"** button leading to the Guided Signer Experience.

---

### H. Unilateral (Single Signer) vs Multi-Party Execution Engine
- **Unilateral Architecture (`agreementType: 'unilateral'` / 1 Recipient)**:
  - Designed for unilateral instruments (employee PIIA undertakings, liability waivers, one-way non-disclosure agreements, intake consents).
  - Clean single-column signatory placement with dedicated printed name, signature, and date fields.
  - **Instant Finalization**: When the sole signee executes the document, the state machine directly invokes cryptographic SHA-256 Merkle sealing, appends the Certificate of Completion, marks `status: 'completed'`, and presents the completion certificate without redundant intermediate dispatch steps.
- **Bilateral / Multilateral Architecture (`agreementType: 'bilateral'` | `'multilateral'` / 2+ Recipients)**:
  - Sequential signing order (`routingOrder: 1, 2, ...`). Party 1 signs &rarr; status remains in-progress &rarr; Party 2 is promoted from `'waiting'` &rarr; `'ready'` &rarr; transactional email reminder is automatically dispatched with tokenized magic link &rarr; document only locks when `allSigned` is true.

---

### I. Enterprise Notification System ([NotificationToast.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/layout/NotificationToast.tsx) & [NotificationCenterDrawer.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/layout/NotificationCenterDrawer.tsx))
- **Floating Toasts**: 60-second auto-dismiss timer, live shrinking progress underline with CSS transitions, real-time seconds countdown, and hover-to-pause protection.
- **Notification Drawer**: Slide-out drawer with search, 5 category tabs (*All*, *Unread*, *AI Risk*, *Agreements*, *Compliance*), and unread badge on navbar.

---

### J. Local Persistent Database ([localDatabase.ts](file:///c:/Users/KIIT/Desktop/scod/src/utils/localDatabase.ts) & [LocalDatabaseManagerView.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/admin/LocalDatabaseManagerView.tsx))
- **Engine**: 5 IndexedDB object stores (`envelopes`, `audit_trail`, `templates`, `notary_journal`, `webhooks`).
- **Telemetry UI**: Live record counts, JSON backup export/import, and factory reset.

---

### K. Deep Linking Engine & URL State Synchronization ([SignFlowContext.tsx](file:///c:/Users/KIIT/Desktop/scod/src/context/SignFlowContext.tsx))
- **Synchronous URL State Bootstrapping**: Initializes `activeView`, `activeEnvelopeId`, and `activeSigningRecipientId` synchronously from `window.location.search` on initial render to eliminate dashboard fallback race conditions.
- **Deep Link Routing Matrix**:
  - **Signer Magic Links**: `/?sign=<envelopeId>&signer=<recipientId>` &rarr; Launches full-screen **Guided Signer Experience** with the specific counterparty identity and signature fields pre-bound.
  - **Document Prep Studio**: `/?preview=<envelopeId>`, `/?envelope=<envelopeId>`, or `/?doc=<envelopeId>` &rarr; Opens **Document Prep Studio** with that specific agreement loaded.
  - **Certificate of Completion**: `/?cert=<envelopeId>` &rarr; Opens the cryptographic Certificate of Completion modal.
  - **Direct Workspace Views**: `/?view=<viewName>` (`dashboard`, `envelopes`, `notary`, `compliance`, `ai-hub`, `clm-workbench`, `templates`, etc.).
- **Live Address Bar Auto-Sync**: Uses `window.history.replaceState` with `isFirstSyncRef` guarding to keep the browser address bar up-to-date as users navigate documents and modes.

---

### L. Enterprise Share Agreement Suite ([ShareEnvelopeModal.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/prepare/ShareEnvelopeModal.tsx))
- **4 Operational Tabs**:
  1. **Signer Magic Links**: View individual tokenized recipient links (`/?sign=...&signer=...`), copy links to clipboard, toggle live dynamic QR codes, and trigger single or batch email reminder dispatches (`sendEnvelopeReminder`).
  2. **Invite Signer / Reviewer**: Dynamic form to add counterparties (*Signer, Approver, CC/Viewer*) with auth selection (*Email, Passkey, SMS OTP*) and instant notification dispatch.
  3. **QR & Web Embed**: High-DPI interactive QR code for mobile scanning and responsive iframe embed snippets.
  4. **Access Control & Security**: Electronic signature consent toggles, dynamic watermark protection, view notifications, and pre-signing download permissions.

---

### M. Advanced Enterprise Add-ons & P1 Tooling
- **FIDO2 / WebAuthn Passkeys**: Hardware enclave AAL3 authentication with biometric challenge signature.
- **CSV Data Table Modal**: In-browser previewer with delimiter parsing, search, and UTF-8 RFC-4180 export.
- **Live Co-Browsing Room**: Multi-party cursor sharing and document collaboration.
- **CRM Sync Hub**: Bidirectional synchronization with Salesforce and HubSpot.
- **Offline PWA Queue**: Background IndexedDB sync when offline.
- **Legacy Migration Hub**: Automated batch converter for DocuSign XML/PDF envelopes.

---

### N. The 5 DocuSign Killer Differentiator Pillars (CodyMaster Powered)
1. **Pillar 1: In-Ceremony Live Clause Negotiation** (`InCeremonyNegotiationModal.tsx`): Zero envelope voiding, in-place paragraph-level redlining, legal playbook compromises, counterparty approval, and Merkle audit tracking.
2. **Pillar 2: Living Smart Contracts & Dynamic Assembly** (`fieldFormulas.ts`): Reactive conditional schedule injection (e.g. Schedule A: GDPR DPA, Schedule B: Enterprise SLA Matrix) and dynamic multi-party formula cascading.
3. **Pillar 3: Post-Signature Contract Autopilot & Webhooks 2.0** (`contractAutopilot.ts`): Automatic structured term extraction, obligation radar generator, HMAC-SHA256 webhook dispatch, and rich Slack Block Kit celebration cards.
4. **Pillar 4: Signer "Guardian Angel" AI & Consumer Safety Shield** (`aiEngine.ts` & `SignerAIDrawer.tsx`): 0–100 contract fairness score gauge benchmarked against YC SAFE / Common Paper, gotcha clause scanner, and 1-click bridge to In-Ceremony Negotiation.
5. **Pillar 5: Zero-Trust Universal Verifier & Cryptographic Proof Export** (`UniversalProofVerifierView.tsx`, `proofExporter.ts`, `tools/verify_proof.cjs`): Standalone RFC-3161/Merkle `.proof.json` export, client-side offline browser verifier (`/?view=verifier`), and offline Node.js CLI verifier (`npm run verify`).

---

## 4. Development & Build Commands

```bash
# 1. 1-Click Launch All (Frontend + Unified Backend Engine)
start.bat          # Launches Vite (:5173) and Unified Backend Service Engine (:8090)

# 2. 1-Click Terminate All Services
stop.bat           # Gracefully terminates all background services and releases all ports

# 3. Run Vite Frontend Dev Server Only
npm run dev

# 4. Build for Production (Compile TypeScript & Bundles)
npm run build     # Must exit with code 0 and 0 errors

# 5. Build and Run Unified Backend Engine
npm run backend:build
npm run backend:start

# 6. Run Automated E2E Test Suite
node tools/run_e2e_suite.js
```

---

## 5. Non-Negotiable Operational Rules for AI Agents

1. **Clean TypeScript Compilation**: Always verify `npm run build` (`tsc && vite build`) compiles with **0 errors** before concluding any task.
2. **Document Canvas Proportion**: Never squish or shrink the document canvas in `DocumentPrepStudio.tsx`. It must maintain its standard spacious **680px** proportion with clean view toggles.
3. **Preserve Comments & Docstrings**: Never strip unrelated comments or architectural notes.
4. **Certificate Modal Dismissal**: The Certificate of Completion modal must always maintain its sticky top `✕ Close` button, sticky bottom `Done & Close` button, <kbd>Esc</kbd> shortcut, and backdrop click handler.
5. **Toast Progress Bar**: The bottom progress underline in toast notifications must always visually reduce over time with the real-time seconds countdown.
6. **Webcam in Notary**: The Remote Online Notary studio must always use `navigator.mediaDevices.getUserMedia` for real hardware video feeds.
7. **Knowledge Graph Sync**: Always run `graphify update .` after making code changes.
