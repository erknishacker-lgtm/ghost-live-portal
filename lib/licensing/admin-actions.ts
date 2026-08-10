import { prisma } from '@/lib/db/prisma';
import type { LicenseStatus } from '@prisma/client';

export async function setLicenseStatus(licenseId: string, status: LicenseStatus, adminUserId: string) {
  const license = await prisma.license.update({ where: { id: licenseId }, data: { status } });
  await prisma.licenseActivity.create({
    data: { licenseId, eventType: 'admin_status_change', detail: { by: adminUserId, status } }
  }).catch(() => {});
  return license;
}

export async function extendLicense(licenseId: string, days: number, adminUserId: string) {
  const license = await prisma.license.findUnique({ where: { id: licenseId } });
  if (!license) throw new Error('Licença não encontrada.');

  const base = license.expiresAt && license.expiresAt.getTime() > Date.now() ? license.expiresAt : new Date();
  const expiresAt = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

  const updated = await prisma.license.update({
    where: { id: licenseId },
    // Extending a lapsed/suspended license also brings it back to active —
    // an admin adding days clearly means "let this person back in".
    data: { expiresAt, status: 'active' }
  });
  await prisma.licenseActivity.create({
    data: { licenseId, eventType: 'admin_extend', detail: { by: adminUserId, days } }
  }).catch(() => {});
  return updated;
}
