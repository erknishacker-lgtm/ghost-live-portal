'use client';

import { usePathname, useRouter } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Início' },
  { href: '/licencas', label: 'Minhas licenças' },
  { href: '/vendas', label: 'Vendas' },
  { href: '/notificacoes', label: 'Notificações' },
  { href: '/suporte', label: 'Suporte' },
  { href: '/perfil', label: 'Perfil' }
];

export function PortalNav({
  user
}: {
  user: { email: string; name: string | null; isAdmin: boolean };
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const links = user.isAdmin ? [...LINKS, { href: '/admin', label: 'Admin' }] : LINKS;

  return (
    <nav
      style={{
        width: 240,
        flexShrink: 0,
        borderRight: '1px solid #2a2a2a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100vh',
        padding: '24px 16px'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 32 }}>
          <img src="/ghost-logo.png" alt="Ghost Live" style={{ width: 28, height: 28 }} />
          <span style={{ fontSize: 16, fontWeight: 800 }}>Ghost Live</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {links.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <a
                key={link.href}
                href={link.href}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: active ? '#fff' : '#9a9a9a',
                  background: active ? '#171717' : 'transparent',
                  borderLeft: active ? '2px solid #fff' : '2px solid transparent'
                }}
              >
                {link.label}
              </a>
            );
          })}
        </div>
      </div>
      <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: 16 }}>
        <div style={{ padding: '0 8px', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name || user.email}
          </div>
          <div style={{ fontSize: 11, color: '#9a9a9a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email}
          </div>
        </div>
        <button className="btn-secondary" onClick={logout} style={{ width: '100%' }}>
          Sair
        </button>
      </div>
    </nav>
  );
}
