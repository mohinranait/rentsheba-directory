import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "./upload-image";

// Uploads an image to Cloudinary and saves its details in the Media table.
export async function uploadAndCreateMedia(file: File, alt: string) {
  const { secure_url, public_id, extension, size } =
    await uploadToCloudinary(file);

  return prisma.media.create({
    data: {
      url: secure_url,
      alt,
      public_id,
      extension, 
      secure_url,
      size: String(size),
    },
  });
}
