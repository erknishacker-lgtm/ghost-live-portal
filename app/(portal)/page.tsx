import { currentPortalUser } from '@/lib/auth/require-user';
import { prisma } from '@/lib/db/prisma';
import { PLANS, type PlanId } from '@/lib/billing/plans';
import { getLatestExtensionRelease } from '@/lib/storage/extension';
import { CopyButton } from './copy-button';
import { RevealKey } from './licencas/reveal-key';

export default async function HomePage() {
  const user = await currentPortalUser();
  if (!user) return null; // layout already redirects

  const [licenses, release] = await Promise.all([
    prisma.license.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } }),
    getLatestExtensionRelease()
  ]);

  const mainLicense = licenses[0] ?? null;
  const planLabel = mainLicense ? PLANS[mainLicense.plan as PlanId]?.label ?? mainLicense.plan : null;

  const stepCard = (children: React.ReactNode) => (
    <div className="card" style={{ flex: 1, minWidth: 260 }}>
      {children}
    </div>
  );

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ fontSize: 11, letterSpacing: 1, color: '#9a9a9a', textTransform: 'uppercase' }}>Visão geral</div>
      <h1 style={{ fontSize: 32, fontWeight: 800, margin: '4px 0 8px' }}>Olá, {user.name?.split(' ')[0] || user.email}.</h1>
      <p style={{ color: '#9a9a9a', margin: '0 0 32px' }}>
        Sua área de membros é permanente. Somente a licença possui validade.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Comece a usar a Ghost Live</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        {stepCard(
          <>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#6b6b6b,#fff)',
                color: '#0a0a0a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 13,
                marginBottom: 14
              }}
            >
              1
            </div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Baixe a extensão</div>
            <p style={{ color: '#9a9a9a', fontSize: 13, margin: '0 0 16px' }}>
              Faça o download da versão mais recente da extensão Ghost Live.
            </p>
            {release ? (
              <a href="/api/extension/download" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                BAIXAR EXTENSÃO
              </a>
            ) : (
              <span style={{ color: '#9a9a9a', fontSize: 12 }}>Nenhuma versão publicada ainda.</span>
            )}
            {release && (
              <div style={{ color: '#9a9a9a', fontSize: 12, marginTop: 10 }}>Versão atual: {release.version}</div>
            )}
          </>
        )}

        {stepCard(
          <>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#6b6b6b,#fff)',
                color: '#0a0a0a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 13,
                marginBottom: 14
              }}
            >
              2
            </div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Instale no Google Chrome</div>
            <p style={{ color: '#9a9a9a', fontSize: 13, margin: '0 0 10px' }}>
              Descompacte o arquivo ZIP. Abra <strong>chrome://extensions</strong>, ative o Modo do desenvolvedor e carregue a pasta.
            </p>
            <ol style={{ color: '#9a9a9a', fontSize: 13, margin: '0 0 12px', paddingLeft: 18 }}>
              <li>Descompacte o arquivo.</li>
              <li>Abra chrome://extensions</li>
              <li>Ative o Modo do desenvolvedor.</li>
              <li>Clique em &quot;Carregar sem compactação&quot;.</li>
              <li>Selecione a pasta e fixe a extensão.</li>
            </ol>
          </>
        )}

        {stepCard(
          <>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#6b6b6b,#fff)',
                color: '#0a0a0a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 13,
                marginBottom: 14
              }}
            >
              3
            </div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Ative sua licença</div>
            <p style={{ color: '#9a9a9a', fontSize: 13, margin: '0 0 16px' }}>
              Abra a extensão e informe o mesmo e-mail da sua compra.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1, fontSize: 12, background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
              <CopyButton value={user.email} label="Copiar e-mail" />
            </div>
            {mainLicense && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, fontFamily: 'ui-monospace, monospace', fontSize: 12, background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 10px' }}>
                  {mainLicense.licenseKey.replace(/^(.{2})-.*-(.{4})$/, '$1-****-****-****-$2')}
                </div>
                <CopyButton value={mainLicense.licenseKey} label="Copiar licença" />
              </div>
            )}
          </>
        )}
      </div>

      {mainLicense && (
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
          <div>
            Plano da licença: <strong>{planLabel}</strong>
          </div>
          <div style={{ color: '#9a9a9a', fontSize: 13 }}>O acesso à área de membros não expira.</div>
        </div>
      )}

      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Minhas licenças</h2>
      {licenses.length === 0 ? (
        <div className="card">
          <p style={{ margin: 0, color: '#9a9a9a' }}>Nenhuma licença encontrada.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {licenses.map((license) => (
            <div key={license.id} className="card">
              <RevealKey licenseKey={license.licenseKey} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
