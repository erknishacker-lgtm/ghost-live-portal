import { Prisma, LicenseStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { generateOpaqueToken, hashToken } from '@/lib/licensing/tokens';
import { LicenseApiError } from '@/lib/licensing/errors';

const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days, rolling on each successful verify

type ActivateInput = {
  email: string;
  licenseKey: string;
  deviceId: string;
  deviceName?: string;
  appVersion?: string;
  extensionVersion?: string;
  platform?: string;
  ip?: string;
};

function statusToFatalCode(status: LicenseStatus): string {
  switch (status) {
    case 'expired':
      return 'LICENSE_EXPIRED';
    case 'suspended':
      return 'LICENSE_SUSPENDED';
    case 'revoked':
      return 'LICENSE_REVOKED';
    default:
      return 'INVALID_LICENSE';
  }
}

async function logActivity(licenseId: string | null, eventType: string, detail: Record<string, unknown>, ip?: string) {
  await prisma.licenseActivity.create({
    data: { licenseId, eventType, detail: detail as Prisma.InputJsonValue, ip }
  }).catch(() => {
    // Activity logging must never break the licensing flow itself.
  });
}

export async function activateLicense(input: ActivateInput) {
  const email = input.email.trim().toLowerCase();
  const licenseKey = input.licenseKey.trim().toUpperCase();

  const license = await prisma.license.findUnique({
    where: { licenseKey },
    include: { user: true }
  });

  // Never reveal whether the email or the key was the wrong part.
  if (!license || license.user.email.toLowerCase() !== email) {
    await logActivity(license?.id ?? null, 'activate_fail', { reason: 'mismatch', email }, input.ip);
    throw new LicenseApiError('INVALID_LICENSE', 401);
  }

  if (license.status !== 'active') {
    throw new LicenseApiError(statusToFatalCode(license.status), 403);
  }

  if (license.expiresAt && license.expiresAt.getTime() < Date.now()) {
    await prisma.license.update({ where: { id: license.id }, data: { status: 'expired' } });
    throw new LicenseApiError('LICENSE_EXPIRED', 403);
  }

  const sessionToken = generateOpaqueToken();
  const sessionTokenHash = hashToken(sessionToken);
  const sessionExpiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const deviceData = {
    deviceId: input.deviceId,
    deviceName: input.deviceName,
    platform: input.platform,
    lastAppVersion: input.appVersion,
    lastExtensionVersion: input.extensionVersion,
    sessionTokenHash,
    sessionExpiresAt,
    lastSeenAt: new Date()
  };

  // A plan can allow more than one simultaneous device (e.g. "2 contas
  // TikTok" = up to 2 devices on the same license). Row-lock the license
  // for the duration of the check+write so two concurrent activations for
  // the same license can never both slip past the count check when only one
  // slot is left.
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM licenses WHERE id = ${license.id} FOR UPDATE`;

    const existing = await tx.licenseDevice.findUnique({
      where: { licenseId_deviceId: { licenseId: license.id, deviceId: input.deviceId } }
    });

    if (existing) {
      // Idempotent re-activation of the same device — always allowed.
      await tx.licenseDevice.update({ where: { id: existing.id }, data: deviceData });
      return;
    }

    const activeCount = await tx.licenseDevice.count({ where: { licenseId: license.id } });
    if (activeCount >= license.maxDevices) {
      await logActivity(license.id, 'activate_fail', { reason: 'device_limit', deviceId: input.deviceId }, input.ip);
      throw new LicenseApiError('DEVICE_LIMIT_REACHED', 409);
    }

    await tx.licenseDevice.create({ data: { licenseId: license.id, activatedAt: new Date(), ...deviceData } });
  });

  await prisma.license.update({ where: { id: license.id }, data: { activatedAt: license.activatedAt ?? new Date() } });
  await logActivity(license.id, 'activate', { deviceId: input.deviceId }, input.ip);

  return {
    session_token: sessionToken,
    session_expires_at: sessionExpiresAt.toISOString(),
    license: {
      plan: license.plan,
      expires_at: license.expiresAt ? license.expiresAt.toISOString() : null,
      features: license.features
    },
    features: license.features
  };
}

async function resolveActiveDeviceByToken(sessionToken: string, deviceId?: string) {
  const tokenHash = hashToken(sessionToken);
  const device = await prisma.licenseDevice.findUnique({
    where: { sessionTokenHash: tokenHash },
    include: { license: true }
  });

  if (!device) throw new LicenseApiError('SESSION_EXPIRED', 401);
  if (deviceId && device.deviceId !== deviceId) throw new LicenseApiError('SESSION_EXPIRED', 401);
  if (device.sessionExpiresAt.getTime() < Date.now()) throw new LicenseApiError('SESSION_EXPIRED', 401);

  return device;
}

export async function verifySession(sessionToken: string, deviceId: string, appVersion?: string, extensionVersion?: string) {
  const device = await resolveActiveDeviceByToken(sessionToken, deviceId);
  const license = device.license;

  if (license.status !== 'active') {
    return { valid: false, code: statusToFatalCode(license.status) };
  }

  if (license.expiresAt && license.expiresAt.getTime() < Date.now()) {
    await prisma.license.update({ where: { id: license.id }, data: { status: 'expired' } });
    return { valid: false, code: 'LICENSE_EXPIRED' };
  }

  const sessionExpiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.licenseDevice.update({
    where: { id: device.id },
    data: {
      lastSeenAt: new Date(),
      lastAppVersion: appVersion ?? device.lastAppVersion,
      lastExtensionVersion: extensionVersion ?? device.lastExtensionVersion,
      sessionExpiresAt
    }
  });

  return {
    valid: true,
    code: null,
    session_expires_at: sessionExpiresAt.toISOString(),
    plan: license.plan,
    expires_at: license.expiresAt ? license.expiresAt.toISOString() : null,
    features: license.features
  };
}

export async function endSession(sessionToken: string) {
  const tokenHash = hashToken(sessionToken);
  const device = await prisma.licenseDevice.findUnique({ where: { sessionTokenHash: tokenHash } });
  if (!device) return { ok: true };
  await prisma.licenseDevice.delete({ where: { id: device.id } });
  await logActivity(device.licenseId, 'logout', { deviceId: device.deviceId });
  return { ok: true };
}

export async function deactivateDeviceByToken(sessionToken: string, deviceId: string) {
  const device = await resolveActiveDeviceByToken(sessionToken, deviceId);
  await prisma.licenseDevice.delete({ where: { id: device.id } });
  await logActivity(device.licenseId, 'deactivate_device', { deviceId });
  return { ok: true };
}

/**
 * Used by the portal's own "Redefinir dispositivo" button (cookie-auth, not
 * bearer). `deviceRowId` is the LicenseDevice.id shown to the logged-in
 * owner of the license — never trust a caller-supplied licenseId/deviceId
 * pair here without also checking license ownership at the route level.
 */
export async function deactivateDeviceByRowId(deviceRowId: string) {
  const device = await prisma.licenseDevice.findUnique({ where: { id: deviceRowId } });
  if (!device) return { ok: true };
  await prisma.licenseDevice.delete({ where: { id: deviceRowId } });
  await logActivity(device.licenseId, 'deactivate_device', { via: 'portal', deviceId: device.deviceId });
  return { ok: true };
}

type SaleEventInput = {
  eventId: string;
  eventType: string;
  amount: number;
  currency: string;
  productId?: string;
  productName?: string;
  quantity: number;
  occurredAt: string;
};

export async function recordSaleEvent(sessionToken: string, input: SaleEventInput) {
  // The extension's sale-event payload has no device_id field (see
  // src/licensing/license-client.js `sendSaleEvent`) — the bearer token alone
  // identifies the device/license.
  const device = await resolveActiveDeviceByToken(sessionToken);

  await prisma.saleEvent.upsert({
    where: { eventId: input.eventId },
    create: {
      licenseId: device.licenseId,
      eventId: input.eventId,
      eventType: input.eventType,
      amountCents: Math.round(Math.max(0, input.amount) * 100),
      currency: input.currency || 'BRL',
      productId: input.productId,
      productName: input.productName,
      quantity: Math.max(1, Math.round(input.quantity || 1)),
      occurredAt: new Date(input.occurredAt)
    },
    // Idempotent: if the extension retries, don't fail or duplicate.
    update: {}
  });

  return { ok: true };
}
