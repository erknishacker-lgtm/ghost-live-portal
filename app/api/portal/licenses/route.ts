import { NextResponse } from 'next/server';
import { currentPortalUser } from '@/lib/auth/require-user';
import { prisma } from '@/lib/db/prisma';
import { PLANS, type PlanId } from '@/lib/billing/plans';

export const runtime = 'nodejs';

export async function GET() {
  const user = await currentPortalUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const licenses = await prisma.license.findMany({
    where: { userId: user.id },
    include: { devices: true },
    orderBy: { createdAt: 'asc' }
  });

  return NextResponse.json({
    licenses: licenses.map((license) => ({
      id: license.id,
      license_key: license.licenseKey,
      plan: license.plan,
      plan_label: PLANS[license.plan as PlanId]?.label ?? license.plan,
      max_devices: license.maxDevices,
      status: license.status,
      expires_at: license.expiresAt,
      activated_at: license.activatedAt,
      devices: license.devices.map((device) => ({
        id: device.id,
        device_name: device.deviceName,
        platform: device.platform,
        app_version: device.lastAppVersion,
        activated_at: device.activatedAt,
        last_seen_at: device.lastSeenAt
      }))
    }))
  });
}
