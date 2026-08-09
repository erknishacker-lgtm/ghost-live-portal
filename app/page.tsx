import { redirect } from 'next/navigation';
import { currentPortalUser } from '@/lib/auth/require-user';

export default async function HomePage() {
  const user = await currentPortalUser();
  redirect(user ? '/licencas' : '/login');
}
