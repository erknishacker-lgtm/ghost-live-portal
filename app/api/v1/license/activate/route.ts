import { NextResponse } from 'next/server';
import { z } from 'zod';
import { activateLicense } from '@/lib/licensing/core';
import { LicenseApiError } from '@/lib/licensing/errors';
import { rateLimiters, consumeOrThrow, clientIp } from '@/lib/http/rate-limit';

export const runtime = 'nodejs';

const bodySchema = z.object({
  email: z.string().trim().email(),
  license_key: z.string().trim().min(1),
  device_id: z.string().trim().min(1),
  device_name: z.string().trim().optional(),
  app_version: z.string().trim().optional(),
  extension_version: z.string().trim().optional(),
  platform: z.string().trim().optional(),
  code_hash: z.string().trim().optional()
});

export async function POST(request: Request) {
  const ip = clientIp(request);
  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ code: 'INVALID_LICENSE', message: 'Requisição inválida.' }, { status: 400 });
  }
  const body = parsed.data;

  try {
    await consumeOrThrow(rateLimiters.activateByIp, ip);
    await consumeOrThrow(rateLimiters.activateByPair, `${body.email.toLowerCase()}:${body.license_key.toUpperCase()}`);
  } catch {
    return NextResponse.json({ code: 'RATE_LIMITED', message: 'Muitas tentativas. Tente novamente em instantes.' }, { status: 429 });
  }

  try {
    const result = await activateLicense({
      email: body.email,
      licenseKey: body.license_key,
      deviceId: body.device_id,
      deviceName: body.device_name,
      appVersion: body.app_version,
      extensionVersion: body.extension_version,
      platform: body.platform,
      ip,
      codeHash: body.code_hash
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof LicenseApiError) {
      return NextResponse.json({ code: error.code, message: error.message }, { status: error.status });
    }
    console.error('[license/activate]', error);
    return NextResponse.json({ code: 'API_ERROR', message: 'Erro interno.' }, { status: 500 });
  }
}
