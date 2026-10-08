import { NextResponse } from "next/server";
import { getCachedSubscriptionPlans } from "@/lib/subscription-plans";

// ---------------------------------------------------------------------------
// GET /api/public/subscription-plans
// ---------------------------------------------------------------------------
// Active plans only, free first — powers the pricing section on the homepage.
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const plans = await getCachedSubscriptionPlans();

    return NextResponse.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("Get public subscription plans error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
