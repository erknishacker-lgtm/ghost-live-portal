import { NextResponse } from 'next/server';
import { currentPortalUser } from '@/lib/auth/require-user';
import { saveExtensionRelease } from '@/lib/storage/extension';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const user = await currentPortalUser();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  const version = String(form?.get('version') || '').trim();

  if (!(file instanceof File) || !version) {
    return NextResponse.json({ error: 'Envie o arquivo .zip e a versão.' }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith('.zip')) {
    return NextResponse.json({ error: 'O arquivo precisa ser um .zip.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const release = await saveExtensionRelease(buffer, version, user.id);

  return NextResponse.json({ ok: true, version: release.version, sizeBytes: release.sizeBytes });
}
