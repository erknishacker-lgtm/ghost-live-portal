import { NextResponse } from 'next/server';
import { currentPortalUser } from '@/lib/auth/require-user';
import { prisma } from '@/lib/db/prisma';
import { deactivateDeviceByRowId } from '@/lib/licensing/core';

export const runtime = 'nodejs';

// Admin override — no 8h cooldown (that's the customer self-service limit,
// see deactivateDeviceByCustomer). Admin can act on any license, not just
// their own, so this only checks isAdmin, not ownership.
export async function POST(_request: Request, { params }: { params: { licenseId: string; deviceId: string } }) {
  const user = await currentPortalUser();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  }

  const device = await prisma.licenseDevice.findFirst({
    where: { id: params.deviceId, licenseId: params.licenseId }
  });
  if (!device) return NextResponse.json({ error: 'Dispositivo não encontrado.' }, { status: 404 });

  await deactivateDeviceByRowId(device.id);
  return NextResponse.json({ ok: true });
}
