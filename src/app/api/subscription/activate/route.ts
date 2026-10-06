import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/utils/session";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// POST /api/subscription/activate
// ---------------------------------------------------------------------------
// Body: { planId } — activates a FREE plan immediately (no payment involved).
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = (await request.json().catch(() => null)) as {
      planId?: string;
    } | null;

    if (!body?.planId) {
      return NextResponse.json(
        { success: false, message: "planId is required" },
        { status: 400 },
      );
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: body.planId },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 },
      );
    }

    if (Number(plan.price) !== 0) {
      return NextResponse.json(
        { success: false, message: "This plan requires payment" },
        { status: 400 },
      );
    }

    const existing = await prisma.subscription.findFirst({
      where: {
        userId: user.userId,
        status: "ACTIVE",
        planId: plan.id,
        OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { success: true, message: "Plan already active" },
        { status: 200 },
      );
    }

    const now = new Date();
    const expiresAt =
      plan.durationInDays > 0
        ? new Date(now.getTime() + plan.durationInDays * 86_400_000)
        : null;

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.userId,
        planId: plan.id,
        status: "ACTIVE",
        startsAt: now,
        expiresAt,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `${plan.name} plan activated`,
        data: subscription,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Activate subscription error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
