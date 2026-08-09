import { NextResponse } from 'next/server';
import { currentPortalUser } from '@/lib/auth/require-user';
import { prisma } from '@/lib/db/prisma';
import { deactivateDeviceByRowId } from '@/lib/licensing/core';

export const runtime = 'nodejs';

export async function POST(_request: Request, { params }: { params: { licenseId: string; deviceId: string } }) {
  const user = await currentPortalUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  // Ownership check: the device row must belong to a license owned by the
  // authenticated user — never trust the URL params alone.
  const device = await prisma.licenseDevice.findFirst({
    where: { id: params.deviceId, licenseId: params.licenseId, license: { userId: user.id } }
  });
  if (!device) return NextResponse.json({ error: 'Dispositivo não encontrado.' }, { status: 404 });

  await deactivateDeviceByRowId(device.id);
  return NextResponse.json({ ok: true });
}
