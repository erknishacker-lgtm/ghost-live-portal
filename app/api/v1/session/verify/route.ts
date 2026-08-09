import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifySession } from '@/lib/licensing/core';
import { LicenseApiError } from '@/lib/licensing/errors';
import { extractBearerToken } from '@/lib/http/bearer';

export const runtime = 'nodejs';

const bodySchema = z.object({
  device_id: z.string().trim().min(1),
  app_version: z.string().trim().optional(),
  extension_version: z.string().trim().optional()
});

export async function POST(request: Request) {
  const token = extractBearerToken(request);
  if (!token) {
    return NextResponse.json({ valid: false, code: 'SESSION_EXPIRED' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ valid: false, code: 'SESSION_EXPIRED', message: 'Requisição inválida.' }, { status: 400 });
  }

  try {
    const result = await verifySession(token, parsed.data.device_id, parsed.data.app_version, parsed.data.extension_version);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof LicenseApiError) {
      return NextResponse.json({ valid: false, code: error.code }, { status: error.status });
    }
    console.error('[session/verify]', error);
    return NextResponse.json({ valid: false, code: 'API_ERROR' }, { status: 500 });
  }
}
