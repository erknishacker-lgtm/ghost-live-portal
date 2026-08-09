import { NextResponse } from 'next/server';
import { currentPortalUser } from '@/lib/auth/require-user';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';

function periodStart(period: string): Date {
  const now = new Date();
  if (period === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === '7d') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
}

export async function GET(request: Request) {
  const user = await currentPortalUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '30d';
  const since = periodStart(period);

  const sales = await prisma.saleEvent.findMany({
    where: { license: { userId: user.id }, occurredAt: { gte: since } },
    orderBy: { occurredAt: 'desc' },
    take: 200
  });

  const total = sales.reduce((sum, sale) => sum + sale.amountCents, 0);
  const count = sales.length;
  const average = count > 0 ? Math.round(total / count) : 0;

  return NextResponse.json({
    stats: { count, totalCents: total, averageCents: average },
    sales: sales.map((sale) => ({
      id: sale.id,
      productName: sale.productName,
      amountCents: sale.amountCents,
      quantity: sale.quantity,
      occurredAt: sale.occurredAt
    }))
  });
}
