import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { destroyPortalSession, PORTAL_COOKIE_NAME } from '@/lib/auth/session';

export const runtime = 'nodejs';

export async function POST() {
  const token = cookies().get(PORTAL_COOKIE_NAME)?.value;
  await destroyPortalSession(token);

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(PORTAL_COOKIE_NAME);
  return response;
}
