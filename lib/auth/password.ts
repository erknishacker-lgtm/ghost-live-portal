import * as argon2 from 'argon2';

// A fixed dummy hash to verify against when a user doesn't exist, so login
// takes the same amount of time either way (no email-enumeration via timing).
const DUMMY_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$ZHVtbXlzYWx0MTIzNDU2Nzg$dOX1Xc4z8b8p9m2q3r4s5t6u7v8w9x0y1z2A3B4C5D6';

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string | null, password: string): Promise<boolean> {
  if (!hash) {
    await argon2.verify(DUMMY_HASH, password).catch(() => false);
    return false;
  }
  return argon2.verify(hash, password).catch(() => false);
}
