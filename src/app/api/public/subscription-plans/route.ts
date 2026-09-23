import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// GET /api/public/subscription-plans
// ---------------------------------------------------------------------------
// Active plans only, free first — powers the pricing section on the homepage.
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: [{ price: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        price: true,
        maxListings: true,
        durationInDays: true,
        description: true,
        features: true,
        badge: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

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
