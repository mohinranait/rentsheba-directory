import { type NextRequest, NextResponse } from "next/server";
import { uploadAndCreateMedia } from "@/utils/upload-media";
import { getSessionUser } from "@/utils/session";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") || formData.get("image");
    const alt = (formData.get("alt") as string) || "Site Settings Asset";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No valid image file provided" },
        { status: 400 },
      );
    }

    // Allow common web images including ICO, SVG, PNG, JPG, WebP
    if (!file.type.startsWith("image/") && !file.name.endsWith(".ico")) {
      return NextResponse.json(
        { success: false, message: "File must be an image (PNG, JPG, SVG, WebP, ICO)" },
        { status: 400 },
      );
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Image file exceeds 5MB limit" },
        { status: 400 },
      );
    }

    // Uploads to Cloudinary and registers in Media table (identical to category upload)
    const media = await uploadAndCreateMedia(file, alt);

    return NextResponse.json({
      success: true,
      message: "Image uploaded and stored successfully",
      url: media.secure_url,
      mediaId: media.id,
    });
  } catch (error) {
    console.error("Settings file upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 },
    );
  }
}
