import { NextResponse } from 'next/server';
import { currentPortalUser } from '@/lib/auth/require-user';
import { getLatestExtensionRelease, readExtensionFile } from '@/lib/storage/extension';

export const runtime = 'nodejs';

export async function GET() {
  const user = await currentPortalUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const release = await getLatestExtensionRelease();
  if (!release) return NextResponse.json({ error: 'Nenhuma versão disponível ainda.' }, { status: 404 });

  const buffer = await readExtensionFile(release.id).catch(() => null);
  if (!buffer) return NextResponse.json({ error: 'Arquivo indisponível no momento.' }, { status: 500 });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'content-type': 'application/zip',
      'content-disposition': `attachment; filename="ghost-live-${release.version}.zip"`,
      'content-length': String(buffer.byteLength)
    }
  });
}
