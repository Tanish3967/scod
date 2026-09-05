# SignFlow — Enterprise AI Agent Memory & System Blueprint

> **CRITICAL FOR ALL AI AGENTS**: Read this file first upon entering the repository. This document serves as the persistent memory, architectural guide, workflow blueprint, and operational rulebook for the **SignFlow** codebase.

---

## 1. Project Overview & Identity
- **Project Name**: **SignFlow** (AI-Native Electronic Signature, Contract Lifecycle Management & Remote Notarization Platform).
- **Core Value Proposition**: Enterprise-grade DocuSign/Adobe Sign parity combined with autonomous AI contract intelligence, EU eIDAS Qualified Electronic Signatures (QES), Remote Online Notarization (RON) with live webcam biometrics, and cryptographic SHA-256 tamper-evident sealing.
- **Frontend Stack**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Canvas API, IndexedDB.
- **Backend Architecture**: Microservices Mesh (Go 1.22 + TypeScript Express):
  - `:8080` — API Gateway & BFF (`services/api-gateway/`)
  - `:8081` — Go Envelope & Recipient Routing Service (`services/envelope-service/`)
  - `:8082` — Go Audit Trail & Cryptographic Merkle Chain (`services/audit-trail-service/`)
  - `:8083` — Go Document Processing & PDF Worker (`services/document-processor/`)
  - `:8084` — TypeScript AI Orchestrator (`services/ai-orchestrator/`)
  - `:8085` — TypeScript Notification & Webhooks Service (`services/notification-webhooks/`)

---

## 2. Key Codebase Layout & Critical Files

```
c:/Users/KIIT/Desktop/scod/
├── src/
│   ├── components/
│   │   ├── dashboard/       # DashboardOverview.tsx (Executive KPIs, sparklines, pipeline table)
│   │   ├── prepare/         # DocumentPrepStudio.tsx (680px canvas, toolbar, lock banners, view switcher)
│   │   ├── signatures/      # CustomSignatureModal.tsx (5-tab designer: Draw, Fonts, Upload, Seal, Vault)
│   │   ├── signing/         # SigningExperience.tsx (Guided Signer Experience with QR mobile transfer)
│   │   ├── notary/          # NotarySessionView.tsx (Live webcam getUserMedia, Biometric HUD, State Seal)
│   │   ├── envelopes/       # EnvelopeVaultList.tsx (Enterprise data grid with filter tabs & actions)
│   │   ├── certificate/     # CertificateOfCompletionModal.tsx (Cryptographic audit ledger & export)
│   │   ├── layout/          # Navbar.tsx, Sidebar.tsx, NotificationToast.tsx, NotificationCenterDrawer.tsx
│   │   ├── compliance/      # QESTSPVerificationView.tsx (EU eIDAS Tier 3 QES & TSP Hub)
│   │   ├── admin/           # LocalDatabaseManagerView.tsx, EmailDispatcherConsole.tsx, ComplianceTrustCenter.tsx
│   │   ├── ai/              # AILegalHub.tsx, ContractQABot.tsx (AI drafter, RAG, Playbook reviews)
│   │   ├── clm/             # AINegotiationWorkbench.tsx (Side-by-side redlining & negotiation)
│   │   └── workflows/       # WorkflowCanvasBuilder.tsx (Visual drag-and-drop routing canvas)
│   ├── context/
│   │   └── SignFlowContext.tsx  # Master state machine, IndexedDB persistence, sealing, unlock actions
│   ├── types/
│   │   └── signflow.ts      # TypeScript interfaces (Envelope, DocumentField, CustomSignature, AuditEvent)
│   ├── utils/
│   │   ├── cryptoUtils.ts   # SHA-256 hashing, HMAC signatures, UUID generator, formatTimestamp
│   │   ├── aiEngine.ts      # Smart field detection, risk scanning, obligation extraction
│   │   ├── localDatabase.ts # Browser IndexedDB storage manager (5 stores, backup export/import)
│   │   └── downloadUtils.ts # CSV and JSON file download handlers
│   ├── index.css            # Stitch Obsidian & Lumina precision design tokens, typography, keyframes
│   └── App.tsx              # Router, global modal mounts, and active view switcher
├── services/                # Backend microservices in Go and Node.js TypeScript
├── feature_checklist.md     # Master feature inventory and compliance checklist
└── tools/
    └── run_e2e_suite.js     # Automated 9/9 integration test runner
```

---

## 3. Core Implemented Workflows & Business Logic

### A. Custom Electronic Signatures Suite
- **Modal Component**: [CustomSignatureModal.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/signatures/CustomSignatureModal.tsx).
- **5 Modes**:
  1. **Draw Pad**: High-DPI HTML5 canvas with 5 ink colors (*Deep Indigo*, *Midnight Slate*, *Royal Blue*, *Emerald*, *Burgundy*), stroke thickness presets (*Fine*, *Medium*, *Bold*), undo stroke history, and 1-click clear.
  2. **Type Calligraphy**: 5 legal Google fonts (*Dancing Script*, *Great Vibes*, *Caveat*, *Sacramento*, *Alex Brush*).
  3. **Upload Scans**: PNG/JPG uploader with transparent contrast cleaner.
  4. **Official Seals**: Corporate & Notary seal generator with date stamp.
  5. **Saved Vault**: Reusable account library.
- **Placement**: 1-click addition onto agreement signature blocks with dynamic initials badge (`JS`, `AM`).

---

### B. Post-Signature Sealing, PKI & Revision Management
- **Automated Certificate Appending**: When all required signers sign, the system generates and appends the **Certificate of Completion** as the final page of the PDF.
- **Tamper-Evident Lock**: Sets `isLocked: true`, locks fields as read-only, and renders the green `🔒 Document Cryptographically Sealed & Locked` banner.
- **Tamper Audit Logging**: Any post-seal modification triggers `recordTamperingAttempt` which logs an alert into the immutable SHA-256 Merkle chain.
- **Authorized Unlock & Revision (`unlockEnvelopeForRevision`)**:
  - Prompts legal reason confirmation modal.
  - Invalidates prior seal and signatures, creates **Version 2.0**, and logs the unlock event in the audit ledger.
  - Reopens Document Studio for clause editing.
  - Admin clicks **"Re-Send for Signatures (v2.0)"** (`resendEnvelopeForSigning`) to dispatch fresh tokenized magic links.

---

### C. Remote Online Notarization (RON) Studio & Live Webcam
- **Component**: [NotarySessionView.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/notary/NotarySessionView.tsx).
- **Hardware Camera**: Directly captures real webcam video and microphone audio via `navigator.mediaDevices.getUserMedia`.
- **Biometric HUD Overlay**: Green corner tracking brackets with live liveness score (`✓ Biometric Face Tracked (99.8%)`) and signer identity tag (`Marcus Vance (IDV Verified)`).
- **Recording Telemetry**: Live encrypted recording timer (`REC 🔴 04:28`), stream resolution badge (`1080p Encrypted Feed`), audio waveform active meters, and IDV credential check.
- **Official Seal**: Affixes State of Texas digital notary seal and logs entry into the local database journal.

---

### D. Transactional Email Gateway & Secondary Signer Flow
- **Component**: [EmailDispatcherConsole.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/admin/EmailDispatcherConsole.tsx).
- **Providers**: Resend API, Twilio SendGrid, Custom SMTP, Virtual Sandbox.
- **Sequential Flow**: Secondary signer receives notification (*"John Smith has signed, your signature is needed"*) with step tracker (`1. John Smith: Signed ✓` → `2. Alice Morgan: Awaiting Signature ⏳`).
- **Tokenized Magic Link**: 1-Click **"Simulate Review & Sign"** button leading to the Guided Signer Experience.

---

### E. Enterprise Notification System
- **Floating Toasts ([NotificationToast.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/layout/NotificationToast.tsx))**:
  - **1-Minute Auto-Dismiss Timer**: Automatically dismisses after **60 seconds** and saves into the permanent Notification Center.
  - **Live Shrinking Progress Underline**: Smoothly reduces in width from 100% to 0% with CSS transitions.
  - **Real-Time Seconds Countdown**: `Auto-moves to Center in 59s`, `58s`, ... `1s`.
  - **Hover-to-Pause**: Pauses countdown on hover.
- **Notification Drawer ([NotificationCenterDrawer.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/layout/NotificationCenterDrawer.tsx))**:
  - Slide-out drawer with search, 5 category tabs (*All*, *Unread*, *AI Risk*, *Agreements*, *Compliance*), and unread badge on navbar.

---

### F. Local Persistent Database (IndexedDB Storage Engine)
- **Engine ([localDatabase.ts](file:///c:/Users/KIIT/Desktop/scod/src/utils/localDatabase.ts))**: 5 object stores (`envelopes`, `audit_trail`, `templates`, `notary_journal`, `webhooks`).
- **Telemetry UI ([LocalDatabaseManagerView.tsx](file:///c:/Users/KIIT/Desktop/scod/src/components/admin/LocalDatabaseManagerView.tsx))**: Live record counts, JSON backup export/import, and factory reset.

---

### G. Stitch Ultra-Professional Design System
- **Typography Tokens**: `Outfit` & `Geist` for headings, `Inter` for body copy, `JetBrains Mono` for telemetry and hashes.
- **Obsidian Glassmorphism**: Translucent `.stitch-glass` and `.stitch-card` surfaces with 20px backdrop blurs and glowing status pills.
- **Environment Switcher**: **🟢 Production** (Legally binding) vs **🟡 Sandbox** (Developer simulation) in the top navbar.

---

## 4. Development & Build Commands

```bash
# 1. Run Vite Frontend Dev Server
npm run dev

# 2. Build for Production (Compile TypeScript & Bundles)
npm run build     # Must exit with code 0 and 0 errors

# 3. Compile Go Microservices
go build -o envelope_service.exe ./services/envelope-service
go build -o audit_service.exe ./services/audit-trail-service
go build -o doc_processor.exe ./services/document-processor

# 4. Run Automated E2E Test Suite
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
