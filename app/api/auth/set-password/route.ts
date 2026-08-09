import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/password';
import { consumePasswordSetToken } from '@/lib/auth/password-tokens';
import { createPortalSession, PORTAL_COOKIE_NAME, portalCookieOptions } from '@/lib/auth/session';

export const runtime = 'nodejs';

const bodySchema = z.object({
  token: z.string().trim().min(1),
  password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.')
});

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Dados inválidos.' }, { status: 400 });
  }

  const userId = await consumePasswordSetToken(parsed.data.token);
  if (!userId) {
    return NextResponse.json({ error: 'Link inválido ou expirado. Peça um novo.' }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  const { token, expiresAt } = await createPortalSession(user.id, request.headers.get('user-agent'));

  const response = NextResponse.json({ ok: true });
  response.cookies.set(PORTAL_COOKIE_NAME, token, portalCookieOptions(expiresAt));
  return response;
}
