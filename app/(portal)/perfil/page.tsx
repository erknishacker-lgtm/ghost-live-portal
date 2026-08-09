import { currentPortalUser } from '@/lib/auth/require-user';

export default async function ProfilePage() {
  const user = await currentPortalUser();
  if (!user) return null;

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ fontSize: 11, letterSpacing: 1, color: '#9a9a9a', textTransform: 'uppercase' }}>Conta</div>
      <h1 style={{ fontSize: 32, fontWeight: 800, margin: '4px 0 8px' }}>Seu perfil</h1>
      <p style={{ color: '#9a9a9a', margin: '0 0 32px' }}>Dados associados à compra.</p>

      <div className="card" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#2a2a2a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 700,
            flexShrink: 0
          }}
        >
          {(user.name || user.email).charAt(0).toUpperCase()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: '#9a9a9a' }}>Nome</div>
            <div style={{ fontWeight: 700 }}>{user.name || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#9a9a9a' }}>E-mail</div>
            <div style={{ fontWeight: 700 }}>{user.email}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#9a9a9a', marginBottom: 4 }}>Status</div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 999,
                background: 'rgba(115,115,115,.15)',
                color: '#d0d0d0'
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8be28b' }} />
              Ativo
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
