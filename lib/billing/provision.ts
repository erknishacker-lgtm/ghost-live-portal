import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { generateLicenseKey } from '@/lib/licensing/tokens';
import { createPasswordSetToken } from '@/lib/auth/password-tokens';
import { sendSetPasswordEmail } from '@/lib/email/resend';
import { PLANS, type PlanId } from '@/lib/billing/plans';

async function createLicenseWithUniqueKey(data: {
  userId: string;
  plan: PlanId;
  maxDevices: number;
  expiresAt: Date;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const licenseKey = generateLicenseKey();
    try {
      return await prisma.license.create({
        data: { ...data, licenseKey, status: 'active' }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        continue; // astronomically unlikely collision — retry with a fresh key
      }
      throw error;
    }
  }
  throw new Error('Não foi possível gerar uma chave de licença única.');
}

/**
 * Runs after a Stripe checkout completes: find-or-create the user, create
 * the license (device limit snapshotted from the plan catalog), issue a
 * single-use "set your password" link, email it. Idempotent at the caller
 * level via stripe_webhook_events — safe to call once per successful
 * checkout session.
 */
export async function provisionLicenseFromCheckout(params: {
  email: string;
  name?: string | null;
  planId: PlanId;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodEnd: Date;
}) {
  const email = params.email.trim().toLowerCase();
  const plan = PLANS[params.planId];

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: params.name ?? undefined }
  });

  const license = await createLicenseWithUniqueKey({
    userId: user.id,
    plan: params.planId,
    maxDevices: plan.maxDevices,
    expiresAt: params.currentPeriodEnd,
    stripeCustomerId: params.stripeCustomerId,
    stripeSubscriptionId: params.stripeSubscriptionId
  });

  const token = await createPasswordSetToken(user.id);
  // The license/token are already committed at this point — a failed email
  // must not make the webhook handler throw (see app/api/webhooks/stripe:
  // the event is marked processed before this runs, so throwing here would
  // permanently swallow the provisioning on Stripe's retry). The customer
  // can always request a fresh link via "Registrar senha" on /login.
  await sendSetPasswordEmail(email, user.name, token, license.licenseKey, plan.label).catch((error) => {
    console.error('[provisionLicenseFromCheckout] falha ao enviar e-mail', error);
  });

  await prisma.licenseActivity.create({
    data: { licenseId: license.id, eventType: 'provisioned', detail: { via: 'stripe_checkout' } }
  }).catch(() => {});

  return { user, license };
}

export async function renewLicenseBySubscription(stripeSubscriptionId: string, currentPeriodEnd: Date) {
  const license = await prisma.license.findFirst({ where: { stripeSubscriptionId } });
  if (!license) return null;

  // A successful payment always brings the license back to active, even if
  // a previous invoice had suspended it.
  return prisma.license.update({
    where: { id: license.id },
    data: { expiresAt: currentPeriodEnd, status: 'active' }
  });
}

export async function suspendLicenseBySubscription(stripeSubscriptionId: string) {
  const license = await prisma.license.findFirst({ where: { stripeSubscriptionId } });
  if (!license) return null;
  return prisma.license.update({ where: { id: license.id }, data: { status: 'suspended' } });
}

export async function revokeLicenseBySubscription(stripeSubscriptionId: string) {
  const license = await prisma.license.findFirst({ where: { stripeSubscriptionId } });
  if (!license) return null;
  return prisma.license.update({ where: { id: license.id }, data: { status: 'revoked' } });
}
