-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'ACTIVE', 'DELETED');

-- CreateTable
CREATE TABLE "listingreviews" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "text" TEXT NOT NULL,
    "name" TEXT DEFAULT 'annonimus',
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listingreviews_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "listingreviews" ADD CONSTRAINT "listingreviews_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;