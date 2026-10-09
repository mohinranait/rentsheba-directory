import { getCloudinary } from "@/lib/cloudinary";
import { getSiteSettings } from "@/lib/settings";

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  extension: string;
  size: number;
};

export async function uploadToCloudinary(
  file: File,
  customFolder?: string,
): Promise<CloudinaryUploadResult> {
  const cld = await getCloudinary();
  let targetFolder = customFolder;

  if (!targetFolder) {
    try {
      const settings = await getSiteSettings();
      targetFolder = settings.cloudinaryFolder || "rentsheba";
    } catch {
      targetFolder = "rentsheba";
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: targetFolder,
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
          size: iBytes,
        });
      },
    );

    stream.end(buffer);
  });
}
