import { prisma } from '@/lib/db/prisma';
import { generateOpaqueToken, hashToken } from '@/lib/licensing/tokens';

export const PORTAL_COOKIE_NAME = 'gl_session';
const PORTAL_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, rolling

export function portalCookieOptions(expiresAt: Date) {
  // Secure-by-default: only drop the flag for local dev (no HTTPS there).
  // Deriving this from APP_BASE_URL's "https://" prefix instead would
  // silently strip Secure from a real production session cookie if that
  // env var is ever misconfigured (missing/wrong protocol) — a
  // misconfiguration, not a deployment target, should never be able to
  // downgrade cookie security on a live site.
  const isLocalDev = process.env.NODE_ENV !== 'production';
  return {
    httpOnly: true,
    secure: !isLocalDev,
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt
  };
}

export async function createPortalSession(userId: string, userAgent?: string | null) {
  const token = generateOpaqueToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + PORTAL_SESSION_TTL_MS);

  await prisma.portalSession.create({
    data: { userId, tokenHash, userAgent: userAgent ?? undefined, expiresAt }
  });

  return { token, expiresAt };
}

export async function getPortalSessionUser(token: string | undefined) {
  if (!token) return null;
  const tokenHash = hashToken(token);
  const session = await prisma.portalSession.findUnique({
    where: { tokenHash },
    include: { user: true }
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.portalSession.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.user;
}

export async function destroyPortalSession(token: string | undefined) {
  if (!token) return;
  const tokenHash = hashToken(token);
  await prisma.portalSession.deleteMany({ where: { tokenHash } });
}
