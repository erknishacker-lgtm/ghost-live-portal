-- AlterTable
ALTER TABLE "license_devices" ADD COLUMN "last_ip" TEXT;
ALTER TABLE "license_devices" ADD COLUMN "code_hash" TEXT;
ALTER TABLE "license_devices" ADD COLUMN "code_modified_at" TIMESTAMP(3);
