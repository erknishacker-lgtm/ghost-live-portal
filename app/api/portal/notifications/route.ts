import { NextResponse } from 'next/server';
import { z } from 'zod';
import { currentPortalUser } from '@/lib/auth/require-user';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';

const DEFAULTS = {
  receiveNotifications: true,
  showValue: true,
  showProduct: true,
  showQuantity: true,
  soundEnabled: true,
  vibrationEnabled: true,
  notifyRefund: true,
  notifyChargeback: true,
  updateBadge: true,
  volume: 100,
  timezone: 'America/Sao_Paulo'
};

export async function GET() {
  const user = await currentPortalUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const prefs = await prisma.notificationPreference.findUnique({ where: { userId: user.id } });
  const deviceCount = await prisma.licenseDevice.count({ where: { license: { userId: user.id } } });

  return NextResponse.json({ preferences: prefs ?? { userId: user.id, ...DEFAULTS }, activeDevices: deviceCount });
}

const bodySchema = z.object({
  receiveNotifications: z.boolean(),
  showValue: z.boolean(),
  showProduct: z.boolean(),
  showQuantity: z.boolean(),
  soundEnabled: z.boolean(),
  vibrationEnabled: z.boolean(),
  notifyRefund: z.boolean(),
  notifyChargeback: z.boolean(),
  updateBadge: z.boolean(),
  volume: z.number().min(0).max(100),
  timezone: z.string().min(1)
});

export async function PUT(request: Request) {
  const user = await currentPortalUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });

  const prefs = await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...parsed.data },
    update: parsed.data
  });

  return NextResponse.json({ ok: true, preferences: prefs });
}
