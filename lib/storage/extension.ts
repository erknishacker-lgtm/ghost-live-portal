import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/lib/db/prisma';

// Must match a persistent volume mounted in EasyPanel (see Dockerfile) —
// anything written outside a mounted volume is lost on the next deploy.
const STORAGE_DIR = process.env.EXTENSION_STORAGE_DIR || '/app/storage';
const FILENAME = 'extension-latest.zip';

export async function saveExtensionRelease(buffer: Buffer, version: string, uploadedByUserId: string) {
  await mkdir(STORAGE_DIR, { recursive: true });
  await writeFile(path.join(STORAGE_DIR, FILENAME), buffer);

  return prisma.extensionRelease.create({
    data: {
      version,
      filename: FILENAME,
      sizeBytes: buffer.byteLength,
      uploadedByUserId
    }
  });
}

export async function getLatestExtensionRelease() {
  return prisma.extensionRelease.findFirst({ orderBy: { createdAt: 'desc' } });
}

export async function readExtensionFile(): Promise<Buffer> {
  return readFile(path.join(STORAGE_DIR, FILENAME));
}
