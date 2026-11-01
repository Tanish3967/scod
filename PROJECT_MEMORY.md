# SignFlow — Permanent Project Memory & Knowledge Bank

This repository contains **SignFlow**, a complete enterprise-grade AI-native electronic signature, contract lifecycle management (CLM), and remote online notarization platform.

---

## 1. Quick Technical Reference & Modules Map

| Domain | File / Module Path | Capabilities |
|---|---|---|
| **State Machine & Persistence** | `src/context/SignFlowContext.tsx` | Master envelope state machine, IndexedDB storage engine, envelope locking, tampering detection, and revision management. |
| **New Envelope Creation Wizard** | `src/components/envelopes/CreateEnvelopeModal.tsx` | 3-tab creation engine: **Upload Custom Document** (default with client-side PDF.js rasterizer, Web Crypto SHA-256 integrity hash & markdown page parsing), **Stored Drafts & Templates** (MNDA, Offer Letter, MSA, Commercial Lease), and **AI Drafter**. |
| **Client-Side PDF Rasterizer** | `src/utils/pdfRasterizer.ts` & `documentParser.ts` | PDF.js high-DPI (1.5x scale) canvas renderer outputting visual PNG data URLs (`imageUrl`) while extracting text for AI Legal Playbook analysis & Merkle hashing. |
| **7-Tab Document Studio** | `src/components/prepare/DocumentPrepStudio.tsx` | Interactive multi-view workspace:<br>• **Document**: 680px paper canvas with authentic visual page rendering, toolbars, custom signatures, page thumbnails.<br>• **Workflow**: Visual pipeline flowchart & conditional rules.<br>• **Signers**: Recipient routing, auth methods, `+ Add Signer` modal, signing simulation.<br>• **History**: Version revisions (v2.0, v1.1, v1.0), legal justification logs, redlines.<br>• **Activity**: Real-time security telemetry stream, actor IPs, devices, CSV export.<br>• **Attachments**: Exhibits vault with drag-and-drop uploader & SHA-256 hashes.<br>• **Audit Trail**: Tamper-evident Merkle ledger with live integrity validator. |
| **Workflow Canvas Builder** | `src/components/workflows/WorkflowCanvasBuilder.tsx` | Visual drag-and-drop routing canvas with live simulation, snapshot comparison, `Save & Exit`, `Discard & Exit`, and **"Unsaved Changes"** confirmation dialog. |
| **Custom Signatures Engine** | `src/components/signatures/CustomSignatureModal.tsx` | 5-tab signature designer: Draw Pad (ink colors & stroke presets), Type Calligraphy (5 cursive fonts), Scanned Upload, Corporate Seals, and Saved Vault. |
| **Guided Signer Experience** | `src/components/signing/SigningExperience.tsx` | Next-field stepper, QR mobile transfer, Passkey WebAuthn FIDO2 biometric authentication, Stripe retainer checkout, and plain-English AI copilot drawer. |
| **Remote Notary (RON)** | `src/components/notary/NotarySessionView.tsx` | Live hardware camera (`getUserMedia`), biometric face tracking HUD (99.8%), live recording timer (`REC 🔴`), IDV check, and official state seal. |
| **Certificate of Completion** | `src/components/certificate/CertificateOfCompletionModal.tsx` | Cryptographic audit ledger, SHA-256 seal, CSV/JSON export, sticky top `✕ Close`, sticky bottom `Done & Close`, <kbd>Esc</kbd> shortcut. |
| **Email Gateway & Inbox** | `src/components/admin/EmailDispatcherConsole.tsx` | Resend API, SendGrid, SMTP, Virtual Sandbox with sequential progress indicators for secondary signees and tokenized magic links. |
| **Enterprise Notifications** | `src/components/layout/NotificationCenterDrawer.tsx` & `NotificationToast.tsx` | 60-second auto-dismiss toasts with live shrinking progress underline and countdown, plus permanent dedicated drawer. |
| **Local Database Engine** | `src/utils/localDatabase.ts` & `src/components/admin/LocalDatabaseManagerView.tsx` | 5 IndexedDB object stores, live record counts, JSON backup export/import, and factory reset. |
| **Share Agreement Suite** | `src/components/prepare/ShareEnvelopeModal.tsx` | 4-tab sharing center: Signer Magic Links (individual tokens, QR codes, reminder triggers), Invite Signer/Reviewer, QR & Web Embed, and Access Control. |
| **Deep Linking & URL Routing** | `src/context/SignFlowContext.tsx` | Synchronous URL state parser on boot (`?sign=...&signer=...`, `?preview=...`, `?envelope=...`, `?cert=...`, `?view=...`), initial state protection, and address bar history synchronization. |
| **AI Multi-Agent Drafter** | `src/utils/aiMultiAgentDrafter.ts` & `src/components/ai/AIDraftingStudio.tsx` | 6-Agent Swarm (Orchestrator, Pattern Enforcer, Section Drafters, Layout Styler, Compiler, Verifier), centralized `DraftingSharedMemory`, compact context envelopes, dynamic page scaling (5 to 50+ pages), verified Table of Contents & Grade A+ certification. |
| **AI Legal Engine** | `src/utils/aiEngine.ts` & `src/components/ai/` | 1-Click Smart Field Placement, AI Contract Drafter, Risk Review (A/B/C/F), Obligation Tracker, and Contract Vault Q&A. |
| **Live Co-Browsing Room** | `src/components/collaborate/LiveCoBrowsingRoom.tsx` | Multi-party live cursor synchronization, shared highlighter, and WebRTC signaling simulation. |
| **Salesforce & CRM Sync** | `src/components/integrations/CRMSyncHub.tsx` | Bidirectional synchronization for Salesforce, HubSpot, and Microsoft Dynamics 365. |
| **Offline Mobile PWA Queue** | `src/components/offline/OfflineSigningQueue.tsx` | Background IndexedDB queue for offline field signing with auto-sync upon reconnection. |
| **Legacy DocuSign Importer** | `src/components/migration/LegacyMigrationImporterView.tsx` | Bulk XML/PDF envelope migration converter with Merkle audit trail preservation. |
| **Stitch Design System** | `src/index.css` & `src/components/dashboard/DashboardOverview.tsx` | Obsidian & Lumina precision styling: `Geist`, `Outfit`, `Inter`, `JetBrains Mono`, glassmorphism, KPI sparklines, and Production/Sandbox switcher. |
| **Unified Backend Engine** | `services/unified-backend/` | Single unified high-performance in-process backend (:8090/:8080) encapsulating Envelopes, Merkle Audit Ledger, Document Processing Worker, AI Swarm Drafter, Transactional Emails & Signed HMAC Webhooks with zero network hops. |

---

## 2. Key Architecture Decisions & Established Patterns

1. **Deterministic State Lifecycle**:
   - `draft` → `sent` → `delivered` → `viewed` → `signed` → `completed` → `in_revision (v2.0)`.
2. **Post-Signature Sealing & Revision**:
   - On completion: appends Certificate of Completion page to the PDF, sets `isLocked: true`, and generates SHA-256 seal.
   - Any modification attempt is recorded as a security alert in the audit trail.
   - Unlocking requires a reason, invalidates prior signatures/seal, increments version to `v2.0`, and allows re-dispatching.
3. **Deep Linking & Direct Navigation**:
   - Parses query parameters (`?sign=...&signer=...`, `?preview=...`, `?envelope=...`) synchronously during initial state hydration to avoid race conditions or default dashboard redirects.
4. **Real Hardware Streaming in Notary**:
   - Uses `navigator.mediaDevices.getUserMedia` for genuine webcam video & microphone audio streams with live biometric HUD overlays.
5. **Toast Countdown UX**:
   - Toast progress bar visually reduces from 100% to 0% over 60 seconds with real-time seconds countdown and hover-to-pause protection.
6. **Document Studio Tabs Integration**:
   - All 7 sub-navigation tabs (`document`, `workflow`, `signers`, `history`, `activity`, `attachments`, `audit`) are fully mounted and synchronized with active envelope state.
7. **Client-Side High-DPI Document Vector Rasterization**:
   - PDF uploads render authentic document pages as visual data URLs using `pdfjs-dist` (1.5x scale) with text layer extraction, providing true visual fidelity across preparation and signing.
8. **Multi-Agent Long-Form Contract Swarm Architecture (5 to 50+ Pages)**:
   - Scales arbitrary document lengths via dynamic section allocation, centralized in-memory knowledge store (`DraftingSharedMemory`), lightweight `ContextEnvelope` frame passing, layout pagination, and independent legal verification with Grade A+ certification.

---

## 3. Build & Test Commands

- **1-Click Launch All (Frontend + Unified Backend Engine)**: `start.bat` (Launches Vite :5173 + Unified Backend :8090 & opens browser)
- **1-Click Terminate All**: `stop.bat` (Terminates all services and releases ports)
- **Frontend Development Only**: `npm run dev` (Runs on `http://localhost:5173/`)
- **Frontend Production Build**: `npm run build` (`tsc && vite build`) — Always keep at 0 errors!
- **Unified Backend Build & Run**: `npm run backend:build` & `npm run backend:start`
- **Automated Integration Suite**: `node tools/run_e2e_suite.js` (9/9 tests pass)
- **Knowledge Graph Update**: `graphify update .`
