import { redirect } from 'next/navigation';
import { currentPortalUser } from '@/lib/auth/require-user';
import { prisma } from '@/lib/db/prisma';
import { LicenseRowActions } from './license-row-actions';

const STATUS_LABEL: Record<string, string> = {
  active: 'Ativa',
  expired: 'Expirada',
  suspended: 'Suspensa',
  revoked: 'Revogada'
};

const STATUS_COLOR: Record<string, string> = {
  active: '#8be28b',
  expired: '#9a9a9a',
  suspended: '#f5c542',
  revoked: '#ff2d6e'
};

const FILTERS = ['all', 'active', 'expired', 'suspended', 'revoked'] as const;

function formatDateTime(date: Date | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

function displayStatus(status: string, expiresAt: Date | null): string {
  if (status === 'active' && expiresAt && expiresAt.getTime() < Date.now()) return 'expired';
  return status;
}

export default async function AdminLicensesPage({
  searchParams
}: {
  searchParams: { q?: string; status?: string };
}) {
  const user = await currentPortalUser();
  if (!user) return null;
  if (!user.isAdmin) redirect('/');

  const q = (searchParams.q ?? '').trim();
  const statusFilter = FILTERS.includes(searchParams.status as (typeof FILTERS)[number]) ? searchParams.status! : 'all';

  const licenses = await prisma.license.findMany({
    where: q
      ? {
          OR: [
            { licenseKey: { contains: q, mode: 'insensitive' } },
            { user: { email: { contains: q, mode: 'insensitive' } } },
            { user: { name: { contains: q, mode: 'insensitive' } } }
          ]
        }
      : undefined,
    include: { user: true, devices: true },
    orderBy: { createdAt: 'desc' },
    take: 500
  });

  const rows = licenses
    .map((license) => ({ license, status: displayStatus(license.status, license.expiresAt) }))
    .filter(({ status }) => statusFilter === 'all' || status === statusFilter);

  const counts = licenses.reduce<Record<string, number>>((acc, license) => {
    const status = displayStatus(license.status, license.expiresAt);
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ fontSize: 11, letterSpacing: 1, color: '#9a9a9a', textTransform: 'uppercase' }}>Admin</div>
      <h1 style={{ fontSize: 32, fontWeight: 800, margin: '4px 0 8px' }}>Contas &amp; chaves</h1>
      <p style={{ color: '#9a9a9a', margin: '0 0 24px' }}>
        Todas as licenças já emitidas — compradas via Stripe ou geradas manualmente pra teste.
      </p>

      <form method="get" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por e-mail, nome ou chave…"
          style={{ maxWidth: 340 }}
        />
        <input type="hidden" name="status" value={statusFilter} />
        <button className="btn-secondary" type="submit">
          Buscar
        </button>
      </form>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {FILTERS.map((filter) => {
          const label = filter === 'all' ? 'Todas' : STATUS_LABEL[filter];
          const count = filter === 'all' ? licenses.length : counts[filter] ?? 0;
          const active = statusFilter === filter;
          const params = new URLSearchParams();
          if (q) params.set('q', q);
          if (filter !== 'all') params.set('status', filter);
          const href = params.toString() ? `?${params.toString()}` : '?';
          return (
            <a
              key={filter}
              href={href}
              className={active ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '8px 14px', fontSize: 12, textDecoration: 'none' }}
            >
              {label} · {count}
            </a>
          );
        })}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a', textAlign: 'left' }}>
                {['Conta', 'Chave', 'Plano', 'Status', 'Dispositivos', 'Expira em', 'Criada em', 'Ações'].map((header) => (
                  <th key={header} style={{ padding: '12px 16px', color: '#9a9a9a', fontWeight: 600, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ license, status }) => (
                <tr key={license.id} style={{ borderBottom: '1px solid #1c1c1c' }}>
                  <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 700 }}>{license.user.name || '—'}</div>
                    <div style={{ color: '#9a9a9a', fontSize: 12 }}>{license.user.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'top', fontFamily: 'ui-monospace, monospace', whiteSpace: 'nowrap' }}>
                    {license.licenseKey}
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{license.plan}</td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                    <span style={{ color: STATUS_COLOR[status] ?? '#fff', fontWeight: 700 }}>{STATUS_LABEL[status] ?? status}</span>
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    {license.devices.length}/{license.maxDevices >= 999 ? '∞' : license.maxDevices}
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{formatDateTime(license.expiresAt)}</td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{formatDateTime(license.createdAt)}</td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                    <LicenseRowActions licenseId={license.id} status={status} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#9a9a9a' }}>
                    Nenhuma licença encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
