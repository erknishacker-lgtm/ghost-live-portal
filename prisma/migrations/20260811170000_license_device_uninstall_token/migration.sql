-- AlterTable
ALTER TABLE "license_devices" ADD COLUMN "uninstall_token_hash" TEXT;
CREATE UNIQUE INDEX "license_devices_uninstall_token_hash_key" ON "license_devices"("uninstall_token_hash");
