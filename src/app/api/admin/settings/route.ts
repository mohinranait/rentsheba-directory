import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { siteSettingsSchema } from "@/lib/schemas/settings-schema";
import { getSessionUser } from "@/utils/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const settings = await getSiteSettings();

    // Mask sensitive keys when returning to admin UI for security,
    // while keeping flags indicating if they are configured.
    const maskedSettings = {
      ...settings,
      smtpPassConfigured: Boolean(settings.smtpPass),
      smtpPass: settings.smtpPass ? "••••••••" : "",
      cloudinaryApiSecretConfigured: Boolean(settings.cloudinaryApiSecret),
      cloudinaryApiSecret: settings.cloudinaryApiSecret ? "••••••••" : "",
    };

    return NextResponse.json({
      success: true,
      data: maskedSettings,
    });
  } catch (error) {
    console.error("Fetch site settings error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = siteSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const currentSettings = await getSiteSettings();
    const data = parsed.data;

    // Normalize smtpHost if an email address or gmail shorthand was entered
    if (data.smtpHost) {
      let host = data.smtpHost.trim();
      if (host.includes("@")) {
        if (host.toLowerCase().includes("gmail")) {
          host = "smtp.gmail.com";
        } else {
          const parts = host.split("@");
          host = `mail.${parts[1] || parts[0]}`;
        }
      }
      data.smtpHost = host;
    }

    // Preserve existing sensitive passwords if masked or blank
    let finalSmtpPass = currentSettings.smtpPass;
    if (data.smtpPass && data.smtpPass !== "••••••••" && data.smtpPass.trim() !== "") {
      finalSmtpPass = data.smtpPass.trim();
    } else if (data.smtpPass === "") {
      finalSmtpPass = null;
    }

    let finalCloudinaryApiSecret = currentSettings.cloudinaryApiSecret;
    if (
      data.cloudinaryApiSecret &&
      data.cloudinaryApiSecret !== "••••••••" &&
      data.cloudinaryApiSecret.trim() !== ""
    ) {
      finalCloudinaryApiSecret = data.cloudinaryApiSecret.trim();
    } else if (data.cloudinaryApiSecret === "") {
      finalCloudinaryApiSecret = null;
    }

    const updated = await prisma.siteSetting.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        ...data,
        smtpPass: finalSmtpPass,
        cloudinaryApiSecret: finalCloudinaryApiSecret,
      },
      update: {
        ...data,
        smtpPass: finalSmtpPass,
        cloudinaryApiSecret: finalCloudinaryApiSecret,
      },
    });

    // Revalidate Next.js cache so layout and public components refresh immediately
    try {
      revalidateTag("site-settings", "max");
      revalidatePath("/", "layout");
    } catch {
      // Ignore cache revalidation errors if triggered in an environment that doesn't support it
    }

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      data: {
        ...updated,
        smtpPass: updated.smtpPass ? "••••••••" : "",
        smtpPassConfigured: Boolean(updated.smtpPass),
        cloudinaryApiSecret: updated.cloudinaryApiSecret ? "••••••••" : "",
        cloudinaryApiSecretConfigured: Boolean(updated.cloudinaryApiSecret),
      },
    });
  } catch (error) {
    console.error("Save site settings error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to save settings",
      },
      { status: 500 },
    );
  }
}
