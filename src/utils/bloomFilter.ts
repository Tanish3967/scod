/**
 * SignFlow — Client-Side Zero-Network Probabilistic Bloom Filter
 * 
 * Implements a space-efficient bit-array Bloom Filter using the Kirsch-Mitzenmacher 
 * optimization (generating k hash functions from FNV-1a and Murmur-style 32-bit mix).
 * 
 * Used on user registration / signup to:
 * 1. Check passwords against known compromised / breached credential datasets locally
 *    with zero network transmission (preserving 100% password privacy).
 * 2. Screen email addresses against disposable / throwaway inbox providers.
 * 3. Screen organization names and handles against reserved system namespaces.
 */

// Base FNV-1a 32-bit hash algorithm
function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash;
}

// Murmur-style secondary 32-bit mixer
function murmurMix(str: string): number {
  let hash = 0x5a17e9b3;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    hash = ((hash << 5) - hash + (code ^ (i * 31))) >>> 0;
    hash = (hash ^ (hash >>> 16)) >>> 0;
    hash = (hash * 0x85ebca6b) >>> 0;
    hash = (hash ^ (hash >>> 13)) >>> 0;
  }
  return hash;
}

export class BloomFilter {
  public readonly sizeBits: number;
  public readonly numHashes: number;
  private bitArray: Uint8Array;
  private elementCount: number = 0;

  constructor(sizeBits: number = 16384, numHashes: number = 4) {
    this.sizeBits = sizeBits;
    this.numHashes = numHashes;
    const numBytes = Math.ceil(sizeBits / 8);
    this.bitArray = new Uint8Array(numBytes);
  }

  /**
   * Generates k bit indices using Kirsch-Mitzenmacher optimization:
   * g_i(x) = (h1(x) + i * h2(x)) mod m
   */
  private getIndices(item: string): number[] {
    const normalized = item.trim().toLowerCase();
    const h1 = fnv1a(normalized);
    const h2 = murmurMix(normalized) || 1; // ensure non-zero step
    const indices: number[] = [];

    for (let i = 0; i < this.numHashes; i++) {
      const combined = (h1 + i * h2) >>> 0;
      indices.push(combined % this.sizeBits);
    }
    return indices;
  }

  /**
   * Adds an element to the Bloom Filter
   */
  public add(item: string): void {
    if (!item) return;
    const indices = this.getIndices(item);
    for (const idx of indices) {
      const byteIndex = idx >> 3;
      const bitOffset = idx & 7;
      this.bitArray[byteIndex] |= (1 << bitOffset);
    }
    this.elementCount++;
  }

  /**
   * Tests whether an item is likely in the set.
   * If false: item is 100% definitely NOT in the set (zero false negatives).
   * If true: item is probably in the set (with controlled false positive rate).
   */
  public has(item: string): boolean {
    if (!item) return false;
    const indices = this.getIndices(item);
    for (const idx of indices) {
      const byteIndex = idx >> 3;
      const bitOffset = idx & 7;
      if ((this.bitArray[byteIndex] & (1 << bitOffset)) === 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Calculates current set bits and load factor
   */
  public getStats(): { totalBits: number; setBits: number; loadFactor: number; estimatedItems: number } {
    let setBits = 0;
    for (let i = 0; i < this.bitArray.length; i++) {
      let byte = this.bitArray[i];
      while (byte > 0) {
        setBits += byte & 1;
        byte >>= 1;
      }
    }

    const loadFactor = setBits / this.sizeBits;
    // Estimated items using standard Bloom formula: n* = - (m / k) * ln(1 - setBits / m)
    let estimatedItems = this.elementCount;
    if (loadFactor < 1 && loadFactor > 0) {
      estimatedItems = Math.round(-(this.sizeBits / this.numHashes) * Math.log(1 - loadFactor));
    }

    return {
      totalBits: this.sizeBits,
      setBits,
      loadFactor: Math.round(loadFactor * 1000) / 10, // percentage e.g. 14.5%
      estimatedItems: Math.max(this.elementCount, estimatedItems)
    };
  }

  /**
   * Calculates theoretical False Positive Rate (FPR):
   * p ≈ (1 - e^(-k*n/m))^k
   */
  public getFalsePositiveRate(): number {
    const { setBits } = this.getStats();
    const p = Math.pow(setBits / this.sizeBits, this.numHashes);
    return Math.min(1, Math.max(0, p));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pre-seeded Security Datasets for Client-Side Zero-Network Screening
// ─────────────────────────────────────────────────────────────────────────────

// 1. Common Breached Passwords Blacklist (HIBP / RockYou / NIST SP 800-63B Common Patterns)
export const COMMON_BREACHED_PASSWORDS = [
  'password',
  'password123',
  'password123!',
  'p@ssword',
  'p@ssword1',
  'p@ssword123',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty123',
  'qwerty123!',
  'admin123',
  'admin123!',
  'administrator',
  'welcome1',
  'welcome1!',
  'welcome123',
  'welcome123!',
  'signflow',
  'signflow123',
  'signflow123!',
  'company123',
  'company123!',
  'summer2024!',
  'winter2024!',
  'spring2025!',
  'fall2025!',
  'summer2025!',
  'summer2026!',
  'testing123!',
  'letmein1!',
  'trustno1!',
  'iloveyou1!',
  'monkey123!',
  'dragon123!',
  'sunshine1!',
  'master123!',
  'secret123!',
  'football1!',
  'baseball1!',
  'superuser1!',
  'changeme1!',
  'pass1234!',
  'abc12345!',
  'abc123456!',
  'charlie1!',
  'robert123!',
  'jordan123!',
  'hunter2',
  'hunter2!',
  'starwars1!',
  'superman1!',
  'batman123!',
  'mustang123!'
];

// 2. Disposable / Temporary Throwaway Email Domains
export const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  '10minutemail.com',
  'trashmail.com',
  'sharklasers.com',
  'dispostable.com',
  'yopmail.com',
  'fakeinbox.com',
  'throwawaymail.com',
  'getairmail.com',
  'mohmal.com',
  'mytemp.email',
  'tempinbox.com',
  'emailondeck.com',
  'burnermail.io'
];

// 3. Reserved System Namespaces & Organization Handles
export const RESERVED_SYSTEM_NAMESPACES = [
  'admin',
  'administrator',
  'root',
  'support',
  'billing',
  'api',
  'auth',
  'security',
  'abuse',
  'postmaster',
  'hostmaster',
  'signflow',
  'signflow-official',
  'enterprise',
  'system',
  'compliance',
  'notary',
  'docusign',
  'null',
  'undefined'
];

// ─────────────────────────────────────────────────────────────────────────────
// Singleton Instances Pre-Populated at Application Start
// ─────────────────────────────────────────────────────────────────────────────

// Dedicated Bloom Filter for Compromised Passwords
export const breachedPasswordFilter = new BloomFilter(16384, 4);
COMMON_BREACHED_PASSWORDS.forEach(pwd => breachedPasswordFilter.add(pwd));

// Dedicated Bloom Filter for Disposable Email Domains
export const disposableEmailFilter = new BloomFilter(4096, 4);
DISPOSABLE_EMAIL_DOMAINS.forEach(domain => disposableEmailFilter.add(domain));

// Dedicated Bloom Filter for Reserved Namespaces
export const reservedNamespaceFilter = new BloomFilter(4096, 4);
RESERVED_SYSTEM_NAMESPACES.forEach(ns => reservedNamespaceFilter.add(ns));

// ─────────────────────────────────────────────────────────────────────────────
// High-Level Screening Helper API
// ─────────────────────────────────────────────────────────────────────────────

export interface BloomSecurityCheckResult {
  isSafe: boolean;
  passwordBreached: boolean;
  disposableEmail: boolean;
  reservedNamespace: boolean;
  reasons: string[];
}

/**
 * Checks if a candidate password matches known breaches via Bloom Filter
 */
export function isPasswordInBloomBreachFilter(password: string): { isBreached: boolean; reason?: string } {
  if (!password || password.length < 3) return { isBreached: false };

  // Check exact string and common lowercased variant
  const clean = password.trim();
  const lower = clean.toLowerCase();

  if (breachedPasswordFilter.has(clean) || breachedPasswordFilter.has(lower)) {
    return {
      isBreached: true,
      reason: 'This password appears in known security breach datasets. Please choose a different, unique password.'
    };
  }

  return { isBreached: false };
}

/**
 * Checks if an email uses a disposable / throwaway inbox domain via Bloom Filter
 */
export function isEmailDomainDisposable(email: string): { isDisposable: boolean; domain?: string; reason?: string } {
  if (!email || !email.includes('@')) return { isDisposable: false };

  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return { isDisposable: false };

  if (disposableEmailFilter.has(domain)) {
    return {
      isDisposable: true,
      domain,
      reason: `Temporary or disposable email domains ("${domain}") cannot be used. Please use a work or permanent email.`
    };
  }

  return { isDisposable: false, domain };
}

/**
 * Checks if an organization or username conflicts with reserved namespaces
 */
export function isNamespaceReserved(name: string): { isReserved: boolean; reason?: string } {
  if (!name) return { isReserved: false };

  const clean = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (reservedNamespaceFilter.has(clean)) {
    return {
      isReserved: true,
      reason: `"${name}" is a reserved system name. Please enter your organization's legal name.`
    };
  }

  return { isReserved: false };
}

/**
 * Comprehensive pre-registration security evaluation using Bloom Filters
 */
export function evaluateSignupSecurityBloom(params: {
  email: string;
  password: string;
  organization?: string;
}): BloomSecurityCheckResult {
  const reasons: string[] = [];

  const pwdCheck = isPasswordInBloomBreachFilter(params.password);
  const emailCheck = isEmailDomainDisposable(params.email);
  const nsCheck = params.organization ? isNamespaceReserved(params.organization) : { isReserved: false };

  if (pwdCheck.isBreached && pwdCheck.reason) {
    reasons.push(pwdCheck.reason);
  }
  if (emailCheck.isDisposable && emailCheck.reason) {
    reasons.push(emailCheck.reason);
  }
  if (nsCheck.isReserved && nsCheck.reason) {
    reasons.push(nsCheck.reason);
  }

  return {
    isSafe: reasons.length === 0,
    passwordBreached: pwdCheck.isBreached,
    disposableEmail: emailCheck.isDisposable,
    reservedNamespace: nsCheck.isReserved,
    reasons
  };
}
