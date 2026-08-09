import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { createPasswordSetToken } from '@/lib/auth/password-tokens';
import { sendPasswordResetEmail } from '@/lib/email/resend';
import { rateLimiters, consumeOrThrow, clientIp } from '@/lib/http/rate-limit';

export const runtime = 'nodejs';

const bodySchema = z.object({ email: z.string().trim().email() });

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  // Always return the same generic response, whether or not the email
  // exists — this route intentionally never confirms account existence.
  const genericResponse = () => NextResponse.json({ ok: true, message: 'Se esse e-mail existir, enviamos um link de redefinição.' });

  if (!parsed.success) return genericResponse();

  const ip = clientIp(request);
  try {
    await consumeOrThrow(rateLimiters.loginByIp, ip);
  } catch {
    return genericResponse();
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = await createPasswordSetToken(user.id);
    await sendPasswordResetEmail(email, token).catch((error) => {
      console.error('[request-password-reset] falha ao enviar e-mail', error);
    });
  }

  return genericResponse();
}
