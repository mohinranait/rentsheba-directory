/*
  Warnings:

  - You are about to drop the column `address` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Listing` table. All the data in the column will be lost.
  - You are about to alter the column `latitude` on the `Listing` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,7)`.
  - You are about to alter the column `longitude` on the `Listing` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,7)`.

*/
-- DropIndex
DROP INDEX "Listing_status_idx";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "address",
DROP COLUMN "status",
ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "areaServed" TEXT,
ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "establishedYear" INTEGER,
ADD COLUMN     "favoriteCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isClaimed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metaDescription" VARCHAR(160),
ADD COLUMN     "metaTitle" VARCHAR(70),
ADD COLUMN     "noIndex" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "priceRange" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "verificationStatus" "ListingStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "whatsapp" TEXT,
ALTER COLUMN "latitude" SET DATA TYPE DECIMAL(10,7),
ALTER COLUMN "longitude" SET DATA TYPE DECIMAL(10,7);

-- CreateIndex
CREATE INDEX "Listing_verificationStatus_idx" ON "Listing"("verificationStatus");
