import { NextResponse } from "next/server";
import { getPublicSiteSettings } from "@/lib/settings";

export async function GET() {
  try {
    const settings = await getPublicSiteSettings();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Fetch public settings error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load site settings",
      },
      { status: 500 },
    );
  }
}
