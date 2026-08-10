import { prisma } from '@/lib/db/prisma';

export async function saveExtensionRelease(buffer: Buffer, version: string, uploadedByUserId: string) {
  return prisma.extensionRelease.create({
    data: {
      version,
      filename: `ghost-live-${version}.zip`,
      sizeBytes: buffer.byteLength,
      data: buffer,
      uploadedByUserId
    }
  });
}

export async function getLatestExtensionRelease() {
  return prisma.extensionRelease.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { id: true, version: true, filename: true, sizeBytes: true, createdAt: true }
  });
}

export async function readExtensionFile(releaseId: string): Promise<Buffer | null> {
  const release = await prisma.extensionRelease.findUnique({ where: { id: releaseId }, select: { data: true } });
  return release ? Buffer.from(release.data) : null;
}
