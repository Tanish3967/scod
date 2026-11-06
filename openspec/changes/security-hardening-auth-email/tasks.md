# Implementation Checklist

- [x] 1.1 Create `src/utils/securityTokens.ts` (HMAC signing tokens, verification, password validator, session token manager).
- [x] 1.2 Update `src/context/SignFlowContext.tsx` with secure session management, tokenized deep link verification, brute force audit logging, and `generateSecureSigningUrl`.
- [x] 1.3 Harden `src/components/auth/AuthView.tsx` with password complexity meter, brute-force rate-limiting lockout timer, 2FA TOTP challenge, and WebAuthn biometric login.
- [x] 1.4 Harden backend `services/unified-backend/src/modules/notifications.ts` with rate-limiting, CRLF injection sanitization, HTML escaping, and anti-phishing templates.
- [x] 1.5 Update `src/components/prepare/ShareEnvelopeModal.tsx` and `src/components/admin/EmailDispatcherConsole.tsx` to generate and display cryptographically signed time-bound magic links.
- [x] 1.6 Update `src/components/signing/SigningExperience.tsx` to display verified cryptographic token badge and expiration notice.
- [x] 1.7 Run full verification suite (`npm run build`, `npm run backend:build`, `node tools/run_e2e_suite.js`, `node tools/verify_proof.cjs`, and `graphify update .`).
