# CONTINUITY.md — SignFlow Working Memory

## Active Goal
Security hardening for Login and Email Signing workflows across SignFlow (Authentication, Cryptographic Tokenization, Brute-Force Defense, Anti-Phishing, and Rate Limiting).

## Current Phase
Completed & Verified

## Key Decisions & Implementations
1. **Password Security**: Enforced 8+ characters (Upper, Lower, Number, Symbol) with real-time entropy calculation (0-100%) and interactive visual requirement checklist.
2. **Brute Force Lockout**: Integrated `BruteForceDefender` tracking failed attempts per email; locks account for 60s with active countdown timer after 5 consecutive failures.
3. **MFA / 2FA & Passkey**: Added 6-digit TOTP challenge step with 60s expiration timer and quick verify helper, plus FIDO2 WebAuthn biometric fast login.
4. **Time-Bound HMAC-SHA256 Magic Links**: Generated secure signing URLs with HMAC-SHA256 tokens (`${envelopeId}:${recipientId}:${expiresAt}:${nonce}`) having 7-day TTL and constant-time verification.
5. **Backend Email Dispatch Hardening**: Added per-recipient in-memory rate limiting (max 5 emails/10 min), strict RFC-5322 regex validation, CRLF header injection rejection, HTML entity escaping, and anti-phishing verification badges.
6. **Session Security**: Enforced 8-hour cryptographic session TTL with HMAC integrity signatures; expired sessions are invalidated on startup.

## Verification
- Frontend build (`npm run build`): 0 errors, exited 0.
- Unified backend build (`npm run backend:build`): 0 errors, exited 0.
- Automated E2E test suite (`node tools/run_e2e_suite.js`): 14/14 tests passed (100%).
- Offline cryptographic proof verifier (`node tools/verify_proof.cjs`): 100% cryptographically valid.
- Knowledge graph (`graphify update .`): Synchronized (2,082 nodes, 2,860 edges).
