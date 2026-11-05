# SignFlow — Enterprise AI-Native Electronic Signature & CLM Platform

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Compliance](https://img.shields.io/badge/Compliance-ESIGN_%7C_UETA_%7C_eIDAS_QES-emerald?style=for-the-badge)](#-compliance--legal-validity)

<p align="center">
  <strong>DocuSign & Adobe Sign Parity with Autonomous AI Legal Swarm Drafting, Remote Online Notarization (RON), and SHA-256 Merkle Ledger Sealing.</strong>
</p>

</div>

---

## 🌟 Overview

**SignFlow** is an enterprise-grade electronic signature, contract lifecycle management (CLM), and remote online notarization (RON) platform. It provides end-to-end agreement workflows—from collaborative multi-agent legal drafting and visual routing pipelines to live hardware biometric notarization, WebAuthn Passkey authentication, and cryptographic post-execution sealing.

---

## 🚀 Key Modules & Capabilities

### 1. 📄 7-Tab Document Preparation Studio
- **Document View**: High-fidelity 680px paper canvas with client-side PDF.js rasterizer (1.5x DPI), multi-format document parser (`.pdf`, `.docx`, `.txt`, `.md`, `.png`, `.jpg`), field placement palette, and visual page thumbnails.
- **Workflow Pipeline**: Interactive visual DAG flowchart with sequential/parallel routing, conditional branch gates, and fullscreen canvas launcher.
- **Signers & Recipients**: Multi-role participant hub (Signer, Approver, CC/Viewer) with authentication factor controls (`email`, `passkey_webauthn`, `sms_otp`, `idv_biometric`) and 1-click signer simulation.
- **Revision History**: Document version timeline (`v1.0 Genesis Draft`, `v1.1 Counterparty Amendments`, `v2.0 Active Revision`), legal justification logs, author attribution, and redline diffs.
- **Security Telemetry (Activity)**: Real-time chronological audit stream recording actor IPs, geolocations, device user-agents, timestamps, category filters, and RFC-4180 CSV export.
- **Attachments & Exhibits Vault**: Drag-and-drop vault for supporting exhibits (SOWs, DPAs, Good Standing Certificates) with client-side SHA-256 checksums and mandatory review toggles.
- **Audit Trail**: Tamper-evident SHA-256 Merkle ledger displaying root hashes, anchored block sequences with previous/current hash linkage, and live chain integrity verification.

### 2. ✍️ 5-Mode Custom Signature Designer
- **Draw Pad**: High-DPI HTML5 canvas with 5 ink shades (*Deep Indigo*, *Midnight Slate*, *Royal Blue*, *Emerald*, *Burgundy*), variable stroke thickness presets, stroke undo history, and vector output.
- **Type Calligraphy**: 5 Google fonts (*Dancing Script*, *Great Vibes*, *Caveat*, *Sacramento*, *Alex Brush*).
- **Upload Scans**: Drag-and-drop image uploader with automated transparent background contrast filtration.
- **Official Seals**: Corporate, Notary, and Stamp generator with dynamic date and registration stamps.
- **Saved Vault**: Local cryptographic signature and initials vault for 1-click reuse.

### 3. 📱 Guided Signer Experience
- **Step-by-Step Navigation**: Focused next-field stepper guiding signatories through required fields with real-time completion progress tracking.
- **FIDO2 / WebAuthn Passkeys**: Hardware-bound biometric authentication (Touch ID, Windows Hello, Face ID) ensuring Authenticator Assurance Level 3 (AAL3).
- **Mobile QR Handshake**: Dynamic high-DPI QR code for desktop-to-mobile execution handoff.
- **AI Clause Explainer**: Plain-English legal copilot translating dense legalese into concise summaries in real time.
- **Payment Retainers**: Integrated Stripe checkout gate for agreements requiring deposit or fee clearance prior to final signing.

### 4. 🎥 Remote Online Notarization (RON) Studio
- **Real Hardware Media Stream**: Direct capture of live video and audio streams via `navigator.mediaDevices.getUserMedia`.
- **Biometric HUD Overlay**: Real-time face tracking frame with live liveness verification scoring (99.8%) and IDV credential badge.
- **Encrypted Session Recording**: Live session timer (`REC 🔴`), audio waveform visualizer, and tamper-resistant recording telemetry.
- **State Notary Seals**: Affixes digital notary seals (e.g., State of Texas) with unique commission IDs and auto-logs entries into the notarization journal.

### 5. 🤖 Autonomous AI Legal Swarm Drafter
- **6-Agent Architecture**: Collaborative swarm (*Orchestrator*, *Pattern Enforcer*, *Section Drafters*, *Layout Styler*, *Compiler*, *Verifier*) drafting comprehensive contracts (5 to 50+ pages).
- **Shared Knowledge Store**: In-memory `DraftingSharedMemory` passing context envelopes across drafting passes to guarantee clause cross-referencing and eliminate hallucinations.
- **Automated Structure Validation**: Automatic generation and validation of Table of Contents, page allocation budgets, and Grade A+ legal compliance scoring.
- **AI Contract Intelligence**: 1-click smart field detection, risk matrix analysis (Grades A/B/C/F), plain-English clause analysis, and contractual obligation extractors.

### 6. 🔒 Post-Signature Sealing, PKI & Revision Management
- **Automated Certificate Appending**: Automatically compiles and appends a tamper-evident **Certificate of Completion** as the final page upon multi-party signature finalization.
- **Tamper-Evident Lock**: Sets `isLocked: true`, locks form fields into read-only states, and renders cryptographic security banners.
- **Tampering Alert Ledger**: Any attempt to manipulate signed values logs an alert directly into the immutable Merkle audit ledger.
- **Authorized Unlock & Revisions**: Admin unlock flow requiring legal justification, invalidating prior signatures/seal, version bumping to `v2.0`, and generating fresh tokenized magic links.

### 7. 🌐 Enterprise Ecosystem & Add-ons
- **Live Co-Browsing Room**: Multi-party WebRTC cursor sharing, synchronized viewports, and collaborative clause highlighting.
- **CRM Sync Hub**: Bidirectional synchronization with Salesforce, HubSpot, and Microsoft Dynamics 365.
- **Offline Signing PWA**: Background IndexedDB queue ensuring uninterrupted field signing with auto-sync upon network reconnection.
- **Legacy Migration Hub**: Automated batch importer converting DocuSign XML/PDF envelope packages into active SignFlow envelopes.
- **Deep Linking Engine**: Synchronous URL parameter routing (`?sign=...&signer=...`, `?preview=...`, `?cert=...`) with address bar state synchronization.

---

## 🛠️ Tech Stack & Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       SignFlow Frontend                         │
│   React 19 • TypeScript • Vite 8 • Tailwind CSS v4 • Lucide     │
│   Canvas API • IndexedDB (5 Stores) • Web Crypto (SHA-256)      │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ JSON REST / HMAC Webhooks
┌─────────────────────────────────▼───────────────────────────────┐
│               Unified Backend Service Engine (:8090)            │
│  • Envelopes & Sharding Module   • Merkle Audit Ledger Module   │
│  • Document Processing Engine    • AI Swarm Drafter Module      │
│  • Transactional Email Gateway   • Telemetry & Prometheus Edge  │
└─────────────────────────────────────────────────────────────────┘
```

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Canvas API, IndexedDB.
- **Backend**: Unified In-Process Service Engine (`services/unified-backend/`) with zero network-hop microservice modules, Express 5, TypeScript.
- **Cryptography**: Web Crypto SHA-256 hashing, HMAC-SHA256 signatures, Merkle DAG integrity chains.

---

## 🚦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20.x or v22.x recommended)
- [npm](https://www.npmjs.com/) (v10.x or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Tanish3967/scod.git
   cd scod
   ```

2. **Install frontend and backend dependencies**:
   ```bash
   npm install
   cd services/unified-backend && npm install && cd ../..
   ```

3. **Configure environment variables (optional)**:
   ```bash
   cp .env.example .env
   ```
   *(By default, SignFlow runs with a built-in virtual email sandbox without requiring third-party API keys).*

---

## ⚡ Development & Scripts

| Command | Description |
|---|---|
| `start.bat` | **1-Click Launch All**: Compiles backend, starts Vite (`:5173`) & Unified Backend (`:8090`), and opens browser |
| `stop.bat` | **1-Click Stop**: Gracefully terminates all background services and releases network ports |
| `npm run dev` | Runs Vite frontend development server only (`http://localhost:5173`) |
| `npm run build` | Builds frontend production bundles with TypeScript verification (`tsc && vite build`) |
| `npm run backend:build` | Compiles Unified Backend TypeScript (`services/unified-backend/tsconfig.json`) |
| `npm run backend:start` | Launches Unified Backend service engine on port `8090` |
| `npm run test:e2e` | Executes automated end-to-end test suite (`tools/run_e2e_suite.js`) |
| `npm run test:load` | Runs 100M-scale benchmark load stress harness (`tools/run_load_stress_suite.js`) |
| `npm run rea` | Runs Reverse Engineer Anything CLI (`morluto/rea`) |
| `npm run rea:doctor` | Validates REA environment, analysis providers, and MCP registrations |
| `npm run rea:mcp` | Launches REA Model Context Protocol (MCP) server |

---

## 🐳 Docker Deployment

SignFlow includes full Docker containerization for both the **Unified Backend Service Engine** and the **React Client Frontend**:

### Production Mode (Recommended)
Spins up the production Node.js unified backend and high-performance Nginx SPA reverse proxy with persistent data storage:

```bash
# Build and run all services in background
docker compose up --build -d

# View real-time logs
docker compose logs -f

# Stop all services
docker compose down
```

- **Frontend Client**: Accessible at [http://localhost:5173](http://localhost:5173) (served via Nginx with API reverse proxy)
- **Backend API & DocuSign v2.1 Engine**: Accessible at [http://localhost:8090](http://localhost:8090)
- **Health Check**: [http://localhost:8090/health](http://localhost:8090/health)
- **Persistent Storage**: Envelopes, database, and uploaded documents persist in the `signflow-data` Docker volume

### Development Mode (with Live Hot-Reloading)
For live code editing inside Docker with Vite HMR and TypeScript watch:

```bash
docker compose -f docker-compose.dev.yml up
```

---

## 🔬 DocuSign Reconstruction via REA (`morluto/rea`)

SignFlow integrates **REA (Reverse Engineer Anything)** to systematically inspect, analyze, and recreate DocuSign features with 100% parity:
- **Web Bundle Analysis**: Reverse-engineers client-side field placement algorithms, coordinate spaces, and event hooks (`npm run rea -- analyze-web-bundle`).
- **HAR Network Inspection**: Decodes DocuSign eSignature REST API v2.1 contracts and webhook signatures (`node tools/rea_docusign_workflow.mjs inspect-har`).
- **Reconstruction Obligation Ledger**: Generates evidence-backed requirements tracking implementation parity against observed targets (see [`docs/DOCUSIGN_RECREATION_GUIDE.md`](docs/DOCUSIGN_RECREATION_GUIDE.md)).

---

## ⚖️ Compliance & Legal Validity

SignFlow is engineered to meet strict international electronic signature standards:
- **United States**: Full compliance with the **Electronic Signatures in Global and National Commerce Act (ESIGN, 15 U.S.C. § 7001)** and the **Uniform Electronic Transactions Act (UETA)**.
- **European Union**: Compliant with **Regulation (EU) No 910/2014 (eIDAS)** for Simple Electronic Signatures (SES), Advanced Electronic Signatures (AES), and Qualified Electronic Signatures (QES) via Trust Service Provider (TSP) verification.
- **Cryptographic Evidence**: SHA-256 Merkle tree verification records sequential audit events (IP, timestamp, hash, user agent), guaranteeing tamper detection in legal proceedings.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
