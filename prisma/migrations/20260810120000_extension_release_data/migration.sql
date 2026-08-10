-- AlterTable
ALTER TABLE "extension_releases" ADD COLUMN "data" BYTEA NOT NULL DEFAULT '';
ALTER TABLE "extension_releases" ALTER COLUMN "data" DROP DEFAULT;
