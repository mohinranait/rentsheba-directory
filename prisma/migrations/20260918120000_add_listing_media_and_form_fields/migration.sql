-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "faqs" JSONB,
ADD COLUMN     "features" JSONB,
ADD COLUMN     "logoId" TEXT,
ADD COLUMN     "openingHours" JSONB,
ADD COLUMN     "thumbnailId" TEXT;

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "galleryListingId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Listing_logoId_key" ON "Listing"("logoId");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_thumbnailId_key" ON "Listing"("thumbnailId");

-- CreateIndex
CREATE INDEX "Listing_locationId_idx" ON "Listing"("locationId");

-- CreateIndex
CREATE INDEX "Media_galleryListingId_idx" ON "Media"("galleryListingId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_galleryListingId_fkey" FOREIGN KEY ("galleryListingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
