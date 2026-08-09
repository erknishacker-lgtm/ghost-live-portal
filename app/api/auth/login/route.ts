import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { createPortalSession, PORTAL_COOKIE_NAME, portalCookieOptions } from '@/lib/auth/session';
import { rateLimiters, consumeOrThrow, clientIp } from '@/lib/http/rate-limit';

export const runtime = 'nodejs';

const bodySchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

const GENERIC_ERROR = { error: 'E-mail ou senha inválidos.' };

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json(GENERIC_ERROR, { status: 401 });

  const email = parsed.data.email.trim().toLowerCase();
  const ip = clientIp(request);

  try {
    await consumeOrThrow(rateLimiters.loginByIp, ip);
    await consumeOrThrow(rateLimiters.loginByEmail, email);
  } catch {
    return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em instantes.' }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = await verifyPassword(user?.passwordHash ?? null, parsed.data.password);

  if (!user || !valid) {
    return NextResponse.json(GENERIC_ERROR, { status: 401 });
  }

  const { token, expiresAt } = await createPortalSession(user.id, request.headers.get('user-agent'));

  const response = NextResponse.json({ ok: true, user: { email: user.email, name: user.name } });
  response.cookies.set(PORTAL_COOKIE_NAME, token, portalCookieOptions(expiresAt));
  return response;
}
