/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `Listing` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_locationId_fkey";

-- DropIndex
DROP INDEX "Listing_categoryId_idx";

-- DropIndex
DROP INDEX "Listing_categoryId_locationId_idx";

-- DropIndex
DROP INDEX "Listing_locationId_idx";

-- DropIndex
DROP INDEX "Listing_status_categoryId_locationId_idx";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "categoryId",
DROP COLUMN "locationId";
