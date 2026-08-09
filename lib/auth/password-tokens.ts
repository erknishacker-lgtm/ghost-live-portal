import { prisma } from '@/lib/db/prisma';
import { generateOpaqueToken, hashToken } from '@/lib/licensing/tokens';

const SET_PASSWORD_TOKEN_TTL_MS = 48 * 60 * 60 * 1000; // 48h

export async function createPasswordSetToken(userId: string) {
  const token = generateOpaqueToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SET_PASSWORD_TOKEN_TTL_MS);

  await prisma.passwordSetToken.create({ data: { userId, tokenHash, expiresAt } });

  return token;
}

export async function consumePasswordSetToken(token: string) {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordSetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return null;
  }

  await prisma.passwordSetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });

  return record.userId;
}
