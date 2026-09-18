/*
  Warnings:

  - The values [COUNTRY] on the enum `LocationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `addressLine2` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Location` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nameEn` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameLocal` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LocationType_new" AS ENUM ('DIVISION', 'DISTRICT', 'UPAZILA');
ALTER TABLE "Location" ALTER COLUMN "type" TYPE "LocationType_new" USING ("type"::text::"LocationType_new");
ALTER TYPE "LocationType" RENAME TO "LocationType_old";
ALTER TYPE "LocationType_new" RENAME TO "LocationType";
DROP TYPE "public"."LocationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_parentId_fkey";

-- DropIndex
DROP INDEX "Location_slug_parentId_key";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "addressLine2",
DROP COLUMN "postalCode",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "locationId" TEXT;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "isActive",
DROP COLUMN "name",
ADD COLUMN     "lat" DECIMAL(10,7),
ADD COLUMN     "lon" DECIMAL(10,7),
ADD COLUMN     "nameEn" TEXT NOT NULL,
ADD COLUMN     "nameLocal" TEXT NOT NULL,
ADD COLUMN     "postalCode" TEXT;

-- CreateIndex
CREATE INDEX "Listing_categoryId_idx" ON "Listing"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_slug_key" ON "Location"("slug");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
