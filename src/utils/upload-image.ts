import { cloudinary } from "@/lib/cloudinary";

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  extension: string;
  size: number;
};

export async function uploadToCloudinary(
  file: File,
): Promise<CloudinaryUploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "rentsheba",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(
            new Error("No result returned from Cloudinary"),
          );
        }

        const { format, bytes: iBytes, secure_url, public_id } = result;
        resolve({
          secure_url: secure_url,
          public_id: public_id,
          extension: format,
          size:iBytes
        });
      },
    );

    stream.end(buffer);
  });
}
