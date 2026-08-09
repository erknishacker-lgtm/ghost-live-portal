import { redirect } from 'next/navigation';
import { currentPortalUser } from '@/lib/auth/require-user';
import { prisma } from '@/lib/db/prisma';
import { PLANS, type PlanId } from '@/lib/billing/plans';
import { RevealKey } from './reveal-key';
import { ResetDeviceButton } from './reset-device-button';

const STATUS_LABEL: Record<string, string> = {
  active: 'Ativa',
  expired: 'Expirada',
  suspended: 'Suspensa',
  revoked: 'Revogada'
};

function formatDate(date: Date | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

export default async function LicensesPage() {
  const user = await currentPortalUser();
  if (!user) redirect('/login');

  const licenses = await prisma.license.findMany({
    where: { userId: user.id },
    include: { devices: true },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ fontSize: 11, letterSpacing: 1, color: '#9a9a9a', textTransform: 'uppercase' }}>Acesso</div>
      <h1 style={{ fontSize: 32, fontWeight: 800, margin: '4px 0 8px' }}>Minhas licenças</h1>
      <p style={{ color: '#9a9a9a', margin: '0 0 32px' }}>Cada licença permite um número limitado de contas TikTok simultâneas.</p>

      {licenses.length === 0 && (
        <div className="card">
          <p style={{ margin: 0, color: '#9a9a9a' }}>Nenhuma licença encontrada pra {user.email}.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {licenses.map((license, index) => {
          const planInfo = PLANS[license.plan as PlanId];
          return (
            <div key={license.id} className="card">
              <div style={{ fontSize: 12, color: '#9a9a9a', marginBottom: 8 }}>Licença {index + 1}</div>
              <RevealKey licenseKey={license.licenseKey} />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: 16,
                  marginTop: 20,
                  paddingTop: 20,
                  borderTop: '1px solid #2a2a2a'
                }}
              >
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 0.5, color: '#9a9a9a', textTransform: 'uppercase' }}>Plano</div>
                  <div style={{ fontWeight: 700 }}>{planInfo?.label ?? license.plan}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 0.5, color: '#9a9a9a', textTransform: 'uppercase' }}>Status</div>
                  <div style={{ fontWeight: 700, color: license.status === 'active' ? '#fff' : '#ff2d6e' }}>
                    {STATUS_LABEL[license.status] ?? license.status}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 0.5, color: '#9a9a9a', textTransform: 'uppercase' }}>Dispositivos</div>
                  <div style={{ fontWeight: 700 }}>
                    {license.devices.length}/{license.maxDevices >= 999 ? '∞' : license.maxDevices}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 0.5, color: '#9a9a9a', textTransform: 'uppercase' }}>Renova em</div>
                  <div style={{ fontWeight: 700 }}>{formatDate(license.expiresAt)}</div>
                </div>
              </div>

              {license.devices.length > 0 && (
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {license.devices.map((device) => (
                    <div
                      key={device.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '10px 14px',
                        background: '#0a0a0a',
                        border: '1px solid #2a2a2a',
                        borderRadius: 8,
                        flexWrap: 'wrap'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{device.deviceName || 'Dispositivo'}</div>
                        <div style={{ fontSize: 11, color: '#9a9a9a' }}>
                          Ativado em {formatDate(device.activatedAt)} · último uso {formatDate(device.lastSeenAt)}
                          {device.lastAppVersion ? ` · v${device.lastAppVersion}` : ''}
                        </div>
                      </div>
                      <ResetDeviceButton licenseId={license.id} deviceId={device.id} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
