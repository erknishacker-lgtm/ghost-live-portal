import { NextResponse } from 'next/server';
import { z } from 'zod';
import { currentPortalUser } from '@/lib/auth/require-user';
import { setIntegrityHash } from '@/lib/licensing/core';

export const runtime = 'nodejs';

const bodySchema = z.object({
  version: z.string().trim().min(1),
  hash: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[0-9a-f]{64}$/, 'Hash deve ser um SHA-256 em hex (64 caracteres).')
});

export async function POST(request: Request) {
  const user = await currentPortalUser();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Dados inválidos.' }, { status: 400 });
  }

  await setIntegrityHash(parsed.data.version, parsed.data.hash);
  return NextResponse.json({ ok: true });
}
