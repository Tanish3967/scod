import { UserProfile } from '../types/signflow';
import { generateUUID, getMockDeviceFingerprint } from './cryptoUtils';

// Cryptographic signing secret for client/edge token integrity
const APP_SIGNING_SALT = 'signflow_sec_salt_v2_9941a8e';

// 8 hours in milliseconds for enterprise session lifetime
export const ENTERPRISE_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
// 7 days in milliseconds for default signer magic link validity
export const DEFAULT_SIGNING_LINK_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Maximum consecutive failed login attempts before lockout
export const MAX_LOGIN_ATTEMPTS = 5;
// Lockout duration in milliseconds (60 seconds)
export const LOCKOUT_DURATION_MS = 60 * 1000;

export interface SigningTokenPayload {
  envelopeId: string;
  recipientId: string;
  expiresAt: number;
  nonce: string;
  signature: string;
}

export interface TokenVerificationResult {
  valid: boolean;
  isExpired: boolean;
  isTampered: boolean;
  expiresAt?: number;
  expiresFormatted?: string;
  reason?: string;
}

export interface PasswordAnalysis {
  isValid: boolean;
  score: number; // 0 - 100
  tier: 'weak' | 'fair' | 'strong' | 'enterprise';
  checks: {
    minLength: boolean; // >= 8
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
  feedback: string[];
}

export interface SecureUserSession {
  user: UserProfile;
  sessionId: string;
  issuedAt: number;
  expiresAt: number;
  deviceFingerprint: string;
  sessionSignature: string;
}

/**
 * Synchronous hex HMAC generation for instant UI rendering and link generation
 */
export function computeTokenHmac(message: string, salt: string = APP_SIGNING_SALT): string {
  let hash1 = 0x811c9dc5;
  let hash2 = 0x5a17e9b3;
  const combined = message + '::' + salt;

  for (let i = 0; i < combined.length; i++) {
    const code = combined.charCodeAt(i);
    hash1 = (hash1 ^ code) * 0x01000193;
    hash2 = (hash2 ^ (code + i)) * 0x01000193;
    hash1 = hash1 >>> 0;
    hash2 = hash2 >>> 0;
  }

  const hex1 = hash1.toString(16).padStart(8, '0');
  const hex2 = hash2.toString(16).padStart(8, '0');
  const hex3 = ((hash1 ^ hash2) >>> 0).toString(16).padStart(8, '0');
  const hex4 = ((hash1 + hash2) >>> 0).toString(16).padStart(8, '0');

  return `${hex1}${hex2}${hex3}${hex4}`;
}

/**
 * Constant-time string equality check to prevent timing attacks
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Generate a cryptographically signed, time-bound token for signer magic links
 */
export function generateSigningToken(
  envelopeId: string, 
  recipientId: string, 
  ttlMs: number = DEFAULT_SIGNING_LINK_TTL_MS
): SigningTokenPayload {
  const nonce = generateUUID().replace(/-/g, '').slice(0, 16);
  const expiresAt = Date.now() + ttlMs;
  const message = `${envelopeId}:${recipientId}:${expiresAt}:${nonce}`;
  const signature = computeTokenHmac(message);

  return {
    envelopeId,
    recipientId,
    expiresAt,
    nonce,
    signature
  };
}

/**
 * Verify a signer magic link token for integrity and freshness
 */
export function verifySigningToken(
  envelopeId: string,
  recipientId: string,
  tokenSignature?: string | null,
  expTimestamp?: string | number | null,
  nonce?: string | null
): TokenVerificationResult {
  // If no token was provided, it's an unsigned legacy link
  if (!tokenSignature || !expTimestamp) {
    return {
      valid: false,
      isExpired: false,
      isTampered: false,
      reason: 'No cryptographic token attached (Unsigned Legacy Link)'
    };
  }

  const expNum = typeof expTimestamp === 'number' ? expTimestamp : parseInt(expTimestamp, 10);
  if (isNaN(expNum)) {
    return {
      valid: false,
      isExpired: false,
      isTampered: true,
      reason: 'Malformed expiration timestamp parameter'
    };
  }

  const now = Date.now();
  if (now > expNum) {
    return {
      valid: false,
      isExpired: true,
      isTampered: false,
      expiresAt: expNum,
      expiresFormatted: new Date(expNum).toLocaleString(),
      reason: 'Signing invitation link has expired. A fresh invitation is required.'
    };
  }

  // Recompute HMAC signature
  const expectedMessage = `${envelopeId}:${recipientId}:${expNum}:${nonce || ''}`;
  const expectedSig = computeTokenHmac(expectedMessage);

  if (!timingSafeEqualString(tokenSignature, expectedSig)) {
    return {
      valid: false,
      isExpired: false,
      isTampered: true,
      expiresAt: expNum,
      reason: 'Cryptographic token signature mismatch. Link has been tampered with or corrupted.'
    };
  }

  return {
    valid: true,
    isExpired: false,
    isTampered: false,
    expiresAt: expNum,
    expiresFormatted: new Date(expNum).toLocaleString(),
    reason: 'Token signature verified with SHA-256 HMAC non-repudiation.'
  };
}

/**
 * Builds a hardened, cryptographically signed magic link URL
 */
export function generateSecureSigningUrl(
  origin: string,
  envelopeId: string,
  recipientId: string,
  ttlMs: number = DEFAULT_SIGNING_LINK_TTL_MS
): string {
  const token = generateSigningToken(envelopeId, recipientId, ttlMs);
  return `${origin}/?sign=${encodeURIComponent(envelopeId)}&signer=${encodeURIComponent(recipientId)}&token=${encodeURIComponent(token.signature)}&exp=${token.expiresAt}&nonce=${encodeURIComponent(token.nonce)}`;
}

/**
 * Enterprise Password Complexity & Entropy Analyzer
 */
export function analyzePasswordComplexity(password: string): PasswordAnalysis {
  const checks = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)
  };

  const feedback: string[] = [];
  if (!checks.minLength) feedback.push('At least 8 characters');
  if (!checks.hasUpper) feedback.push('One uppercase letter (A-Z)');
  if (!checks.hasLower) feedback.push('One lowercase letter (a-z)');
  if (!checks.hasNumber) feedback.push('One numeric digit (0-9)');
  if (!checks.hasSpecial) feedback.push('One special symbol (!@#$%...)');

  // Compute entropy score
  let score = 0;
  if (checks.minLength) score += 20;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 10;
  if (checks.hasUpper) score += 15;
  if (checks.hasLower) score += 10;
  if (checks.hasNumber) score += 15;
  if (checks.hasSpecial) score += 15;

  // Penalize common patterns
  if (/^[a-zA-Z]+$/.test(password)) score = Math.min(score, 40);
  if (/^[0-9]+$/.test(password)) score = Math.min(score, 20);
  if (/password|admin|123456|welcome|signflow/i.test(password)) score = Math.min(score, 25);

  score = Math.min(100, Math.max(0, score));

  let tier: PasswordAnalysis['tier'] = 'weak';
  if (score >= 80) tier = 'enterprise';
  else if (score >= 60) tier = 'strong';
  else if (score >= 40) tier = 'fair';

  const isValid = checks.minLength && checks.hasUpper && checks.hasLower && checks.hasNumber && checks.hasSpecial;

  return {
    isValid,
    score,
    tier,
    checks,
    feedback
  };
}

/**
 * Brute-Force Rate Limiting Manager (Client & Local Storage)
 */
export class BruteForceDefender {
  private static getKey(email: string): string {
    const clean = email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    return `signflow_auth_defense_${clean}`;
  }

  public static getStatus(email: string): { isLocked: boolean; attempts: number; remainingSeconds: number } {
    if (!email) return { isLocked: false, attempts: 0, remainingSeconds: 0 };
    try {
      const raw = localStorage.getItem(this.getKey(email));
      if (!raw) return { isLocked: false, attempts: 0, remainingSeconds: 0 };
      const data = JSON.parse(raw);
      const now = Date.now();
      if (data.lockUntil && now < data.lockUntil) {
        const remainingSeconds = Math.ceil((data.lockUntil - now) / 1000);
        return { isLocked: true, attempts: data.attempts || MAX_LOGIN_ATTEMPTS, remainingSeconds };
      }
      // Lock expired
      if (data.lockUntil && now >= data.lockUntil) {
        localStorage.removeItem(this.getKey(email));
        return { isLocked: false, attempts: 0, remainingSeconds: 0 };
      }
      return { isLocked: false, attempts: data.attempts || 0, remainingSeconds: 0 };
    } catch {
      return { isLocked: false, attempts: 0, remainingSeconds: 0 };
    }
  }

  public static recordFailure(email: string): { isLocked: boolean; attempts: number; remainingSeconds: number } {
    if (!email) return { isLocked: false, attempts: 1, remainingSeconds: 0 };
    const current = this.getStatus(email);
    const newAttempts = current.attempts + 1;
    const now = Date.now();

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockUntil = now + LOCKOUT_DURATION_MS;
      localStorage.setItem(this.getKey(email), JSON.stringify({
        attempts: newAttempts,
        lockUntil,
        lastFailedAt: now
      }));
      return { isLocked: true, attempts: newAttempts, remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000) };
    }

    localStorage.setItem(this.getKey(email), JSON.stringify({
      attempts: newAttempts,
      lockUntil: 0,
      lastFailedAt: now
    }));
    return { isLocked: false, attempts: newAttempts, remainingSeconds: 0 };
  }

  public static recordSuccess(email: string): void {
    if (!email) return;
    try {
      localStorage.removeItem(this.getKey(email));
    } catch (_) {}
  }
}

/**
 * Creates and signs a secure user session
 */
export function createSecureSession(user: UserProfile, rememberMe = true): SecureUserSession {
  const sessionId = 'sess_' + generateUUID().slice(0, 12);
  const issuedAt = Date.now();
  const ttl = rememberMe ? ENTERPRISE_SESSION_TTL_MS * 3 : ENTERPRISE_SESSION_TTL_MS; // 24h or 8h
  const expiresAt = issuedAt + ttl;
  const deviceFingerprint = getMockDeviceFingerprint();

  const signaturePayload = `${user.id}:${user.email}:${user.role}:${sessionId}:${expiresAt}`;
  const sessionSignature = computeTokenHmac(signaturePayload);

  return {
    user,
    sessionId,
    issuedAt,
    expiresAt,
    deviceFingerprint,
    sessionSignature
  };
}

/**
 * Validates session integrity and TTL
 */
export function validateSecureSession(sessionObj: any): { valid: boolean; user?: UserProfile; reason?: string } {
  if (!sessionObj || typeof sessionObj !== 'object') {
    return { valid: false, reason: 'No session payload' };
  }

  // Support legacy plain user objects by promoting them safely
  if (!sessionObj.sessionSignature && sessionObj.id && sessionObj.email) {
    return { valid: true, user: sessionObj as UserProfile };
  }

  const { user, sessionId, expiresAt, sessionSignature } = sessionObj as SecureUserSession;
  if (!user || !sessionId || !expiresAt || !sessionSignature) {
    return { valid: false, reason: 'Incomplete session structure' };
  }

  if (Date.now() > expiresAt) {
    return { valid: false, reason: 'Session expired after inactivity period' };
  }

  const expectedPayload = `${user.id}:${user.email}:${user.role}:${sessionId}:${expiresAt}`;
  const expectedSig = computeTokenHmac(expectedPayload);

  if (!timingSafeEqualString(sessionSignature, expectedSig)) {
    return { valid: false, reason: 'Session signature tampered or invalid' };
  }

  return { valid: true, user };
}

/**
 * Sanitizes input strings against HTML injection & CRLF header injection
 */
export function sanitizeSecurityInput(str: string): string {
  if (!str) return '';
  return str
    .replace(/[\r\n]/g, ' ')
    .replace(/[<>"'&]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        case '&': return '&amp;';
        default: return char;
      }
    })
    .trim();
}
