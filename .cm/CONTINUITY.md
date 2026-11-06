# CONTINUITY.md — SignFlow Working Memory

## Active Goal
Security hardening for Login and Email Signing workflows across SignFlow (Authentication, Cryptographic Tokenization, Brute-Force Defense, Anti-Phishing, and Rate Limiting) + Client-Side Probabilistic Bloom Filter on Signup.

## Current Phase
Completed & Verified

## Key Decisions & Implementations
1. **Probabilistic Bloom Filter Engine**: Implemented `BloomFilter` in `src/utils/bloomFilter.ts` with 16k bits and $k=4$ hashes (Kirsch-Mitzenmacher optimization using FNV-1a and MurmurMix).
2. **Breached Credential Detection (Zero-Network)**: Client-side screening against common compromised passphrases (RockYou, HaveIBeenPwned, NIST SP 800-63B patterns) with 0 network transmission to preserve plaintext privacy.
3. **Disposable Inboxes & Protected Namespaces**: Bit-array screening blocking temporary inboxes (`mailinator.com`, `tempmail.com`, etc.) and system namespace collisions on user registration.
4. **Interactive Bloom HUD**: Added live Bloom Filter Security HUD badge with bit-array specs on `AuthView.tsx` signup tab.
5. **Brute Force Lockout**: Integrated `BruteForceDefender` tracking failed attempts per email; locks account for 60s with active countdown timer after 5 consecutive failures.
6. **MFA / 2FA & Passkey**: 6-digit TOTP challenge step with 60s expiration timer and FIDO2 WebAuthn biometric fast login.
7. **Time-Bound HMAC-SHA256 Magic Links**: Generated secure signing URLs with HMAC-SHA256 tokens (`${envelopeId}:${recipientId}:${expiresAt}:${nonce}`) having 7-day TTL and constant-time verification.
8. **Backend Email Dispatch Hardening**: Per-recipient in-memory rate limiting (max 5 emails/10 min), strict RFC-5322 regex validation, CRLF header injection rejection, HTML entity escaping, and anti-phishing verification badges.

## Verification
- Frontend build (`npm run build`): 0 errors, exited 0.
- Unified backend build (`npm run backend:build`): 0 errors, exited 0.
- Automated E2E test suite (`node tools/run_e2e_suite.js`): 14/14 tests passed (100%).
- Offline cryptographic proof verifier (`node tools/verify_proof.cjs`): 100% cryptographically valid.
- Knowledge graph (`graphify update .`): Synchronized (2,103 nodes, 2,894 edges).
