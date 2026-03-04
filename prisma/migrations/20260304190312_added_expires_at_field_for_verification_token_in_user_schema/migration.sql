-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "variantName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "verificationExpiresAt" TIMESTAMP(3);
