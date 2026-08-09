import { NextResponse } from 'next/server';
import { currentPortalUser } from '@/lib/auth/require-user';

export const runtime = 'nodejs';

export async function GET() {
  const user = await currentPortalUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin
  });
}
