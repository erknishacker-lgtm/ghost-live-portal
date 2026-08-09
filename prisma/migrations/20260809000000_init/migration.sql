-- Enable case-insensitive email comparisons
CREATE EXTENSION IF NOT EXISTS citext;

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('active', 'expired', 'suspended', 'revoked');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" CITEXT NOT NULL,
    "password_hash" TEXT,
    "name" TEXT,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable
CREATE TABLE "portal_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "portal_sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "portal_sessions_token_hash_key" ON "portal_sessions"("token_hash");
CREATE INDEX "portal_sessions_user_id_idx" ON "portal_sessions"("user_id");

-- CreateTable
CREATE TABLE "password_set_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_set_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "password_set_tokens_token_hash_key" ON "password_set_tokens"("token_hash");
CREATE INDEX "password_set_tokens_user_id_idx" ON "password_set_tokens"("user_id");

-- CreateTable
CREATE TABLE "licenses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "license_key" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "max_devices" INTEGER NOT NULL DEFAULT 1,
    "status" "LicenseStatus" NOT NULL DEFAULT 'active',
    "expires_at" TIMESTAMP(3),
    "features" JSONB NOT NULL DEFAULT '{}',
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "activated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "licenses_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "licenses_license_key_key" ON "licenses"("license_key");
CREATE INDEX "licenses_user_id_idx" ON "licenses"("user_id");

-- CreateTable
CREATE TABLE "license_devices" (
    "id" TEXT NOT NULL,
    "license_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "device_name" TEXT,
    "platform" TEXT,
    "last_app_version" TEXT,
    "last_extension_version" TEXT,
    "session_token_hash" TEXT NOT NULL,
    "session_expires_at" TIMESTAMP(3) NOT NULL,
    "activated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "license_devices_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "license_devices_license_id_device_id_key" ON "license_devices"("license_id", "device_id");
CREATE UNIQUE INDEX "license_devices_session_token_hash_key" ON "license_devices"("session_token_hash");

-- CreateTable
CREATE TABLE "license_activity_log" (
    "id" TEXT NOT NULL,
    "license_id" TEXT,
    "event_type" TEXT NOT NULL,
    "detail" JSONB NOT NULL DEFAULT '{}',
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "license_activity_log_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "license_activity_log_license_id_idx" ON "license_activity_log"("license_id");

-- CreateTable
CREATE TABLE "sale_events" (
    "id" TEXT NOT NULL,
    "license_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "product_id" TEXT,
    "product_name" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sale_events_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sale_events_event_id_key" ON "sale_events"("event_id");
CREATE INDEX "sale_events_license_id_occurred_at_idx" ON "sale_events"("license_id", "occurred_at");

-- CreateTable
CREATE TABLE "notification_preferences" (
    "user_id" TEXT NOT NULL,
    "receive_notifications" BOOLEAN NOT NULL DEFAULT true,
    "show_value" BOOLEAN NOT NULL DEFAULT true,
    "show_product" BOOLEAN NOT NULL DEFAULT true,
    "show_quantity" BOOLEAN NOT NULL DEFAULT true,
    "sound_enabled" BOOLEAN NOT NULL DEFAULT true,
    "vibration_enabled" BOOLEAN NOT NULL DEFAULT true,
    "notify_refund" BOOLEAN NOT NULL DEFAULT true,
    "notify_chargeback" BOOLEAN NOT NULL DEFAULT true,
    "update_badge" BOOLEAN NOT NULL DEFAULT true,
    "volume" INTEGER NOT NULL DEFAULT 100,
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "stripe_webhook_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stripe_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_flags" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "system_flags_pkey" PRIMARY KEY ("key")
);

-- AddForeignKey
ALTER TABLE "portal_sessions" ADD CONSTRAINT "portal_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "password_set_tokens" ADD CONSTRAINT "password_set_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "license_devices" ADD CONSTRAINT "license_devices_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "license_activity_log" ADD CONSTRAINT "license_activity_log_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "licenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sale_events" ADD CONSTRAINT "sale_events_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
