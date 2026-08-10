import { redirect } from 'next/navigation';
import { currentPortalUser } from '@/lib/auth/require-user';
import { getLatestExtensionRelease } from '@/lib/storage/extension';
import { UploadForm } from './upload-form';
import { TestLicenseForm } from './test-license-form';

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminPage() {
  const user = await currentPortalUser();
  if (!user) return null;
  if (!user.isAdmin) redirect('/');

  const release = await getLatestExtensionRelease();

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ fontSize: 11, letterSpacing: 1, color: '#9a9a9a', textTransform: 'uppercase' }}>Admin</div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: '4px 0 8px' }}>Publicar extensão</h1>
          <p style={{ color: '#9a9a9a', margin: '0 0 32px' }}>
            O arquivo enviado aqui fica disponível pro botão &quot;Baixar extensão&quot; de todos os clientes.
          </p>
        </div>
        <a href="/admin/licenses" className="btn-secondary" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Ver todas as contas e chaves →
        </a>
      </div>

      {release && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: '#9a9a9a', marginBottom: 4 }}>Versão publicada atualmente</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{release.version}</div>
          <div style={{ color: '#9a9a9a', fontSize: 12, marginTop: 4 }}>
            {formatBytes(release.sizeBytes)} · publicada em {new Date(release.createdAt).toLocaleString('pt-BR')}
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 32 }}>
        <UploadForm />
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>Gerar chave de teste</h2>
      <p style={{ color: '#9a9a9a', margin: '0 0 16px' }}>
        Cria uma licença sem passar pelo Stripe, com validade e nº de dispositivos que você escolher — pra mandar pra
        alguém testar.
      </p>
      <div className="card">
        <TestLicenseForm />
      </div>
    </main>
  );
}
