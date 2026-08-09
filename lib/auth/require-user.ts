import { cookies } from 'next/headers';
import { getPortalSessionUser, PORTAL_COOKIE_NAME } from '@/lib/auth/session';

export async function currentPortalUser() {
  const token = cookies().get(PORTAL_COOKIE_NAME)?.value;
  return getPortalSessionUser(token);
}
