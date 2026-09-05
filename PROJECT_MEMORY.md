# SignFlow — Permanent Project Memory & Knowledge Bank

This repository contains **SignFlow**, a complete enterprise-grade AI-native electronic signature, contract lifecycle management (CLM), and remote online notarization platform.

---

## 1. Quick Technical Reference

| Domain | File / Module Path | Capabilities |
|---|---|---|
| **State Machine & Persistence** | `src/context/SignFlowContext.tsx` | Master envelope state machine, IndexedDB storage engine, envelope locking, tampering detection, and revision management. |
| **Custom Signatures Engine** | `src/components/signatures/CustomSignatureModal.tsx` | 5-tab signature designer: Draw Pad (ink colors & stroke presets), Type Calligraphy (5 cursive fonts), Scanned Upload, Corporate Seals, and Saved Vault. |
| **Document Studio** | `src/components/prepare/DocumentPrepStudio.tsx` | 680px paper canvas, view toggles (*Document Focus*, *Workflow Focus*, *Side-by-Side*), field placement, custom signatures, and cryptographic lock & revision banners. |
| **Guided Signer Experience** | `src/components/signing/SigningExperience.tsx` | Next-field stepper, QR mobile transfer, Stripe retainer checkout, and plain-English AI copilot drawer. |
| **Remote Notary (RON)** | `src/components/notary/NotarySessionView.tsx` | Live hardware camera (`getUserMedia`), biometric face tracking HUD (99.8%), live recording timer (`REC 🔴`), IDV check, and official state seal. |
| **Certificate of Completion** | `src/components/certificate/CertificateOfCompletionModal.tsx` | Cryptographic audit ledger, SHA-256 seal, CSV/JSON export, sticky top `✕ Close`, sticky bottom `Done & Close`, <kbd>Esc</kbd> shortcut. |
| **Email Gateway & Inbox** | `src/components/admin/EmailDispatcherConsole.tsx` | Resend API, SendGrid, SMTP, Virtual Sandbox with sequential progress indicators for secondary signees and tokenized magic links. |
| **Enterprise Notifications** | `src/components/layout/NotificationCenterDrawer.tsx` & `NotificationToast.tsx` | 60-second auto-dismiss toasts with live shrinking progress underline and countdown, plus permanent dedicated drawer. |
| **Local Database Engine** | `src/utils/localDatabase.ts` & `src/components/admin/LocalDatabaseManagerView.tsx` | 5 IndexedDB object stores, live record counts, JSON backup export/import, and factory reset. |
| **AI Legal Engine** | `src/utils/aiEngine.ts` & `src/components/ai/` | 1-Click Smart Field Placement, AI Contract Drafter, Risk Review (A/B/C/F), Obligation Tracker, and Contract Vault Q&A. |
| **Stitch Design System** | `src/index.css` & `src/components/dashboard/DashboardOverview.tsx` | Obsidian & Lumina precision styling: `Geist`, `Outfit`, `Inter`, `JetBrains Mono`, glassmorphism, KPI sparklines, and Production/Sandbox switcher. |
| **Backend Microservices** | `services/` | Go Envelope Service (:8081), Go Audit Service (:8082), Go Doc Processor (:8083), API Gateway (:8080), AI Orchestrator (:8084), Notification Service (:8085). |

---

## 2. Key Architecture Decisions & Established Patterns

1. **Deterministic State Lifecycle**:
   - `draft` → `sent` → `delivered` → `viewed` → `signed` → `completed` → `in_revision (v2.0)`.
2. **Cryptographic Locking & Revision**:
   - On completion: appends Certificate of Completion page to the PDF, sets `isLocked: true`, and generates SHA-256 seal.
   - Any modification attempt is recorded as a security alert in the audit trail.
   - Unlocking requires a reason, invalidates prior signatures/seal, increments version to `v2.0`, and allows re-dispatching.
3. **Real Hardware Streaming in Notary**:
   - Uses `navigator.mediaDevices.getUserMedia` for genuine webcam video & microphone audio streams with live biometric HUD overlays.
4. **Toast Countdown UX**:
   - Toast progress bar visually reduces from 100% to 0% over 60 seconds with real-time seconds countdown and hover-to-pause protection.

---

## 3. Build & Test Commands

- **Frontend Development**: `npm run dev` (Runs on `http://localhost:5173/`)
- **Frontend Production Build**: `npm run build` (`tsc && vite build`) — Always keep at 0 errors!
- **Automated Integration Suite**: `node tools/run_e2e_suite.js` (9/9 tests pass)
