import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { currentPortalUser } from '@/lib/auth/require-user';
import { PortalNav } from './portal-nav';

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const user = await currentPortalUser();
  if (!user) redirect('/login');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <PortalNav user={{ email: user.email, name: user.name, isAdmin: user.isAdmin }} />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}
