import { NextResponse } from 'next/server';
import { z } from 'zod';
import { currentPortalUser } from '@/lib/auth/require-user';
import { createTestLicense } from '@/lib/licensing/trial';

export const runtime = 'nodejs';

const bodySchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().optional(),
  days: z.number().int().min(1).max(365),
  maxDevices: z.number().int().min(1).max(999)
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

  const { license, emailed } = await createTestLicense({
    email: parsed.data.email,
    name: parsed.data.name || null,
    days: parsed.data.days,
    maxDevices: parsed.data.maxDevices,
    createdByUserId: user.id
  });

  return NextResponse.json({
    ok: true,
    licenseKey: license.licenseKey,
    email: parsed.data.email.trim().toLowerCase(),
    expiresAt: license.expiresAt,
    maxDevices: license.maxDevices,
    emailed
  });
}
