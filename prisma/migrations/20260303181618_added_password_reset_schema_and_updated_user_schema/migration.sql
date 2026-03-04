/*
  Warnings:

  - You are about to drop the column `createdAt` on the `RefreshSession` table. All the data in the column will be lost.
  - You are about to drop the column `revoked` on the `RefreshSession` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `RefreshSession` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "RefreshSession_expiresAt_idx";

-- AlterTable
ALTER TABLE "RefreshSession" DROP COLUMN "createdAt",
DROP COLUMN "revoked",
DROP COLUMN "updatedAt";

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- CreateIndex
CREATE INDEX "PasswordReset_userId_idx" ON "PasswordReset"("userId");

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
