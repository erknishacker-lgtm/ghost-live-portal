import { NextResponse } from 'next/server';
import { z } from 'zod';
import { currentPortalUser } from '@/lib/auth/require-user';
import { setLicenseStatus, extendLicense } from '@/lib/licensing/admin-actions';

export const runtime = 'nodejs';

const bodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('suspend') }),
  z.object({ action: z.literal('reactivate') }),
  z.object({ action: z.literal('revoke') }),
  z.object({ action: z.literal('extend'), days: z.number().int().min(1).max(3650) })
]);

export async function PATCH(request: Request, { params }: { params: { licenseId: string } }) {
  const user = await currentPortalUser();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
  }

  try {
    if (parsed.data.action === 'suspend') {
      await setLicenseStatus(params.licenseId, 'suspended', user.id);
    } else if (parsed.data.action === 'reactivate') {
      await setLicenseStatus(params.licenseId, 'active', user.id);
    } else if (parsed.data.action === 'revoke') {
      await setLicenseStatus(params.licenseId, 'revoked', user.id);
    } else {
      await extendLicense(params.licenseId, parsed.data.days, user.id);
    }
  } catch {
    return NextResponse.json({ error: 'Não foi possível atualizar a licença.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
