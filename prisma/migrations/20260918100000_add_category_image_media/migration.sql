-- AlterTable
ALTER TABLE "Category" DROP COLUMN "image";
ALTER TABLE "Category" ADD COLUMN "delatedAt" TIMESTAMP(3);
ALTER TABLE "Category" ADD COLUMN "imageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_imageId_key" ON "Category"("imageId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;