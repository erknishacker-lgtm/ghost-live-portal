import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { generateLicenseKey } from '@/lib/licensing/tokens';
import { createPasswordSetToken } from '@/lib/auth/password-tokens';
import { sendSetPasswordEmail } from '@/lib/email/resend';

/**
 * Admin-issued test license — not tied to any Stripe subscription. Reuses
 * the same license_key/license_devices machinery as a real purchase, just
 * with an admin-chosen expiry and device count instead of a plan lookup.
 * Also mirrors provisionLicenseFromCheckout's set-password email so the
 * tester can log in to the portal, not just receive a bare key.
 */
export async function createTestLicense(params: {
  email: string;
  name?: string | null;
  days: number;
  maxDevices: number;
  createdByUserId: string;
}) {
  const email = params.email.trim().toLowerCase();
  const days = Math.max(1, Math.round(params.days));
  const maxDevices = Math.max(1, Math.round(params.maxDevices));
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: params.name ?? undefined }
  });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const licenseKey = generateLicenseKey();
    try {
      const license = await prisma.license.create({
        data: {
          userId: user.id,
          licenseKey,
          plan: 'trial',
          maxDevices,
          status: 'active',
          expiresAt
        }
      });
      await prisma.licenseActivity.create({
        data: { licenseId: license.id, eventType: 'trial_issued', detail: { by: params.createdByUserId, days, maxDevices } }
      }).catch(() => {});

      const token = await createPasswordSetToken(user.id);
      let emailed = true;
      let emailError: string | null = null;
      await sendSetPasswordEmail(email, user.name, token, license.licenseKey, `teste (${days} dias)`).catch((error) => {
        console.error('[createTestLicense] falha ao enviar e-mail', error);
        emailed = false;
        emailError = error instanceof Error ? error.message : String(error);
      });

      return { user, license, emailed, emailError };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') continue;
      throw error;
    }
  }
  throw new Error('Não foi possível gerar uma chave de licença única.');
}
