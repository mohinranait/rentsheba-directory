import { v2 as Cloudinary } from "cloudinary";
import config from "./config";
import { getSiteSettings } from "./settings";

Cloudinary.config({
  cloud_name: config.cloudinary_name,
  api_key: config.cloudinary_key,
  api_secret: config.cloudinary_SECRET,
});

/**
 * Returns a configured Cloudinary instance using DB settings if available,
 * falling back to process.env credentials.
 */
export async function getCloudinary() {
  try {
    const settings = await getSiteSettings();
    if (
      settings.cloudinaryCloudName &&
      settings.cloudinaryApiKey &&
      settings.cloudinaryApiSecret
    ) {
      Cloudinary.config({
        cloud_name: settings.cloudinaryCloudName,
        api_key: settings.cloudinaryApiKey,
        api_secret: settings.cloudinaryApiSecret,
      });
    } else {
      Cloudinary.config({
        cloud_name: config.cloudinary_name,
        api_key: config.cloudinary_key,
        api_secret: config.cloudinary_SECRET,
      });
    }
  } catch {
    // Keep default env configuration
  }
  return Cloudinary;
}

export const cloudinary = Cloudinary;