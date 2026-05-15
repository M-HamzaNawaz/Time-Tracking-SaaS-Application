-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- Backfill: existing users/invitations are migrated into a single default org.
INSERT INTO "Organization" ("id", "name", "createdAt")
VALUES ('org_default_migration', 'Default Organization', CURRENT_TIMESTAMP);

-- AlterTable: add column nullable, backfill, then enforce NOT NULL
ALTER TABLE "User" ADD COLUMN "organizationId" TEXT;
UPDATE "User" SET "organizationId" = 'org_default_migration' WHERE "organizationId" IS NULL;
ALTER TABLE "User" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "Invitation" ADD COLUMN "organizationId" TEXT;
UPDATE "Invitation" SET "organizationId" = 'org_default_migration' WHERE "organizationId" IS NULL;
ALTER TABLE "Invitation" ALTER COLUMN "organizationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
