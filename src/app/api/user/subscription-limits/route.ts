import { NextResponse } from "next/server";
import { getSessionUser } from "@/utils/session";
import { checkUserListingEligibility } from "@/utils/subscription-limits";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSessionUser();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
          data: null,
        },
        { status: 401 },
      );
    }

    const limits = await checkUserListingEligibility(session.userId);

    return NextResponse.json({
      success: true,
      data: limits,
    });
  } catch (error) {
    console.error("Get user subscription limits error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to check subscription limits" },
      { status: 500 },
    );
  }
}
