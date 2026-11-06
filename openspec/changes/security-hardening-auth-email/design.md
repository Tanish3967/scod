# Design: Security Hardening for Login and Email Signing

## Context & Technical Approach
SignFlow requires commercial-grade zero-trust security for user authentication and signer email delivery.
Current gaps:
- Login accepts arbitrary credentials without password complexity enforcement, brute-force rate-limiting, or session lifetime enforcement.
- Signer magic links are unauthenticated URL parameters (`?sign=...&signer=...`) without cryptographic signatures or expiration timestamps, vulnerable to enumeration and tampering.
- Backend email dispatch has no per-recipient rate limiting or anti-abuse controls, and email HTML lacks anti-phishing validation headers.

## Technical Architecture

### 1. Cryptographic Magic Links & Token Verification (`src/utils/securityTokens.ts`)
- HMAC-SHA256 signature generated over `${envelopeId}:${recipientId}:${expiresAt}:${nonce}` using application secret.
- Constant-time verification on entry in `SignFlowContext.tsx`.
- Expiration check against client/server time (7-day default TTL).
- Audit trail event logged for both successful and rejected token verifications.

### 2. Login Hardening (`src/components/auth/AuthView.tsx` & `src/context/SignFlowContext.tsx`)
- Password complexity validator: 8+ characters, uppercase, lowercase, numeric, special symbols.
- Dynamic entropy meter with color-coded strength ratings.
- Brute force defense: 5 failed attempts = 60-second cooldown with live countdown timer.
- Multi-factor authentication (MFA): 6-digit TOTP challenge with 60s expiration and quick verification.
- FIDO2 / WebAuthn biometric fast login.
- Cryptographic session token with 8-hour TTL and HMAC integrity signature.

### 3. Email Dispatch Security Hardening (`services/unified-backend/src/modules/notifications.ts`)
- In-memory rate limiting: max 5 emails per recipient per 10 minutes; max 20 per IP.
- RFC-5322 strict email format validation and CRLF injection prevention.
- HTML entity escaping of all user inputs (`recipientName`, `envelopeTitle`, `senderName`, `senderOrg`).
- Anti-phishing security box with document SHA-256 preview, expiration notice, and trust credentials.

## Verification
- Frontend TypeScript build: `npm run build` exits 0.
- Unified backend build: `npm run backend:build` exits 0.
- End-to-end integration tests: `node tools/run_e2e_suite.js` exits 0.
