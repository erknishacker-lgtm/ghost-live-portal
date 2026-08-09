import { NextResponse } from 'next/server';
import { z } from 'zod';
import { recordSaleEvent } from '@/lib/licensing/core';
import { LicenseApiError } from '@/lib/licensing/errors';
import { extractBearerToken } from '@/lib/http/bearer';

export const runtime = 'nodejs';

const bodySchema = z.object({
  event_id: z.string().trim().min(1),
  event_type: z.string().trim().default('SALE_APPROVED'),
  amount: z.number().nonnegative().default(0),
  currency: z.string().trim().default('BRL'),
  product_id: z.string().trim().optional(),
  product_name: z.string().trim().optional(),
  quantity: z.number().int().positive().default(1),
  occurred_at: z.string().trim()
});

export async function POST(request: Request) {
  const token = extractBearerToken(request);
  if (!token) return NextResponse.json({ code: 'SESSION_EXPIRED' }, { status: 401 });

  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ code: 'API_ERROR', message: 'Requisição inválida.' }, { status: 400 });
  }
  const body = parsed.data;

  try {
    const result = await recordSaleEvent(token, {
      eventId: body.event_id,
      eventType: body.event_type,
      amount: body.amount,
      currency: body.currency,
      productId: body.product_id,
      productName: body.product_name,
      quantity: body.quantity,
      occurredAt: body.occurred_at
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof LicenseApiError) {
      return NextResponse.json({ code: error.code }, { status: error.status });
    }
    console.error('[sale-events]', error);
    return NextResponse.json({ code: 'API_ERROR' }, { status: 500 });
  }
}
