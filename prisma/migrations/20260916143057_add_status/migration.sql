/*
  Warnings:

  - You are about to drop the column `listingId` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `users` table. All the data in the column will be lost.
  - Added the required column `extension` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `public_id` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secure_url` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'DELETED');

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_listingId_fkey";

-- DropIndex
DROP INDEX "Media_listingId_idx";

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "listingId",
DROP COLUMN "sortOrder",
ADD COLUMN     "extension" TEXT NOT NULL,
ADD COLUMN     "public_id" TEXT NOT NULL,
ADD COLUMN     "secure_url" TEXT NOT NULL,
ADD COLUMN     "size" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isActive",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
