import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/utils/session";
import {
  PaymentStatus,
  SubscriptionStatus,
} from "@generated/prisma/enums";

// ---------------------------------------------------------------------------
// POST /api/admin/subscriptions/[id]/activate
// ---------------------------------------------------------------------------
// Manually activates a subscription and marks the payment as PAID.
// Allows specifying custom trxID, duration, and admin notes.
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        plan: true,
        payment: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: "Subscription not found" },
        { status: 404 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const trxID = (body?.trxID as string)?.trim() || "";
    const note = (body?.note as string)?.trim() || "Manual admin activation";
    const customDays = body?.durationInDays ? Number(body.durationInDays) : null;

    const durationDays =
      customDays && customDays > 0
        ? customDays
        : subscription.plan.durationInDays || 365;

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + durationDays * 24 * 60 * 60 * 1000,
    );

    const resolvedTrxID =
      trxID ||
      subscription.payment?.trxID ||
      `MANUAL-${Date.now().toString().slice(-8)}`;

    const [updatedSub, updatedPayment] = await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          startsAt: now,
          expiresAt,
        },
      }),
      prisma.payment.upsert({
        where: { subscriptionId: subscription.id },
        update: {
          trxID: resolvedTrxID,
          transactionId: resolvedTrxID,
          status: PaymentStatus.PAID,
          paidAt: now,
          metadata: JSON.parse(
            JSON.stringify({
              ...((subscription.payment?.metadata as object) || {}),
              manualActivation: true,
              adminNote: note,
              activatedBy: user.email || user.userId,
              activatedAt: now.toISOString(),
            }),
          ),
        },
        create: {
          subscriptionId: subscription.id,
          amount: subscription.plan.price,
          currency: "BDT",
          trxID: resolvedTrxID,
          transactionId: resolvedTrxID,
          status: PaymentStatus.PAID,
          paidAt: now,
          metadata: JSON.parse(
            JSON.stringify({
              manualActivation: true,
              adminNote: note,
              activatedBy: user.email || user.userId,
              activatedAt: now.toISOString(),
            }),
          ),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Subscription successfully activated until ${expiresAt.toLocaleDateString()}. TrxID: ${resolvedTrxID}`,
      data: {
        subscription: updatedSub,
        payment: updatedPayment,
      },
    });
  } catch (error) {
    console.error("Admin manual activation error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during activation" },
      { status: 500 },
    );
  }
}
