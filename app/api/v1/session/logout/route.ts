import { NextResponse } from 'next/server';
import { endSession } from '@/lib/licensing/core';
import { extractBearerToken } from '@/lib/http/bearer';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const token = extractBearerToken(request);
  if (!token) return NextResponse.json({ ok: true });
  try {
    const result = await endSession(token);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[session/logout]', error);
    return NextResponse.json({ ok: true });
  }
}
