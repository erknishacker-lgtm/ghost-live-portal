import { randomBytes, createHash } from 'node:crypto';

/**
 * Opaque bearer/session tokens: random bytes returned to the caller once,
 * only the sha256 hash is ever persisted. Used for both the extension's
 * session_token and the portal's cookie session token.
 */
export function generateOpaqueToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// Crockford Base32 — excludes 0/O/1/I/L to avoid ambiguity when a key is
// read aloud or hand-typed by a customer.
const CROCKFORD_ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';

function randomCrockfordChars(count: number): string {
  const bytes = randomBytes(count);
  let out = '';
  for (let i = 0; i < count; i += 1) {
    out += CROCKFORD_ALPHABET[bytes[i]! % CROCKFORD_ALPHABET.length];
  }
  return out;
}

/** GL-XXXX-XXXX-XXXX-XXXX, ~80 bits of entropy from crypto.randomBytes. */
export function generateLicenseKey(): string {
  const groups = [randomCrockfordChars(4), randomCrockfordChars(4), randomCrockfordChars(4), randomCrockfordChars(4)];
  return `GL-${groups.join('-')}`;
}

export function maskLicenseKey(key: string): string {
  const parts = key.split('-');
  if (parts.length !== 5) return key;
  const last = parts[4];
  return `${parts[0]}-****-****-****-${last}`;
}
