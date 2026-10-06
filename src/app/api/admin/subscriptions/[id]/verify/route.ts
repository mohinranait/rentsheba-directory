import { type NextRequest, NextResponse } from "next/server";
import { queryBkashPayment } from "@/lib/bkash";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/utils/session";
import {
  PaymentStatus,
  SubscriptionStatus,
} from "@generated/prisma/enums";

// ---------------------------------------------------------------------------
// POST /api/admin/subscriptions/[id]/verify
// ---------------------------------------------------------------------------
// Queries bKash payment gateway to check whether the transaction was completed.
// If completed, updates the payment record to PAID and activates the subscription.
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

    // Read optional overrides from body if provided
    const body = await request.json().catch(() => ({}));
    const targetPaymentID =
      (body?.paymentID as string)?.trim() || subscription.payment?.paymentID;

    if (!targetPaymentID) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No bKash Payment ID found for this subscription. Provide a payment ID to verify.",
        },
        { status: 400 },
      );
    }

    // Call bKash Query API
    let queryResult;
    try {
      queryResult = await queryBkashPayment({ paymentID: targetPaymentID });
    } catch (bkashErr) {
      const errMessage =
        bkashErr instanceof Error
          ? bkashErr.message
          : "Failed to communicate with bKash API";
      return NextResponse.json(
        {
          success: false,
          message: `bKash verification failed: ${errMessage}`,
        },
        { status: 400 },
      );
    }

    // Check transaction status from bKash
    const isCompleted =
      queryResult.transactionStatus?.toUpperCase() === "COMPLETED";

    if (!isCompleted) {
      return NextResponse.json(
        {
          success: false,
          message: `bKash reported status: ${queryResult.transactionStatus || "UNKNOWN"}. Status Message: ${queryResult.statusMessage || "Payment not completed."}`,
          data: {
            bKashResponse: queryResult,
          },
        },
        { status: 400 },
      );
    }

    // Payment is completed! Activate subscription and update payment
    const now = new Date();
    const durationDays = subscription.plan.durationInDays || 365;
    const expiresAt = new Date(
      now.getTime() + durationDays * 24 * 60 * 60 * 1000,
    );

    const resolvedTrxID =
      queryResult.trxID ||
      (body?.trxID as string)?.trim() ||
      subscription.payment?.trxID ||
      `BKASH-${targetPaymentID}`;

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
          paymentID: targetPaymentID,
          trxID: resolvedTrxID,
          transactionId: resolvedTrxID,
          status: PaymentStatus.PAID,
          paidAt: now,
          customerMsisdn:
            queryResult.payerReference || subscription.payment?.customerMsisdn,
          metadata: JSON.parse(
            JSON.stringify({
              ...((subscription.payment?.metadata as object) || {}),
              bKashVerification: queryResult,
              verifiedBy: user.email || user.userId,
              verifiedAt: now.toISOString(),
            }),
          ),
        },
        create: {
          subscriptionId: subscription.id,
          paymentID: targetPaymentID,
          trxID: resolvedTrxID,
          transactionId: resolvedTrxID,
          amount: subscription.plan.price,
          currency: "BDT",
          status: PaymentStatus.PAID,
          paidAt: now,
          customerMsisdn: queryResult.payerReference,
          metadata: JSON.parse(
            JSON.stringify({
              bKashVerification: queryResult,
              verifiedBy: user.email || user.userId,
              verifiedAt: now.toISOString(),
            }),
          ),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `bKash payment successfully verified! TrxID: ${resolvedTrxID}. Subscription activated until ${expiresAt.toLocaleDateString()}.`,
      data: {
        subscription: updatedSub,
        payment: updatedPayment,
      },
    });
  } catch (error) {
    console.error("Admin verify bKash payment error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during verification" },
      { status: 500 },
    );
  }
}
