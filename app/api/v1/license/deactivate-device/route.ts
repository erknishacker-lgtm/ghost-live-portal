import { NextResponse } from 'next/server';
import { z } from 'zod';
import { deactivateDeviceByToken } from '@/lib/licensing/core';
import { LicenseApiError } from '@/lib/licensing/errors';
import { extractBearerToken } from '@/lib/http/bearer';

export const runtime = 'nodejs';

const bodySchema = z.object({ device_id: z.string().trim().min(1) });

export async function POST(request: Request) {
  const token = extractBearerToken(request);
  if (!token) return NextResponse.json({ ok: false, code: 'SESSION_EXPIRED' }, { status: 401 });

  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: 'SESSION_EXPIRED' }, { status: 400 });
  }

  try {
    const result = await deactivateDeviceByToken(token, parsed.data.device_id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof LicenseApiError) {
      return NextResponse.json({ ok: false, code: error.code }, { status: error.status });
    }
    console.error('[license/deactivate-device]', error);
    return NextResponse.json({ ok: false, code: 'API_ERROR' }, { status: 500 });
  }
}
