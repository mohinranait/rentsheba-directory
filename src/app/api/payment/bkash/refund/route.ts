import { NextResponse } from "next/server";
import { refundBkashPayment } from "@/lib/bkash";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/utils/session";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// POST /api/payment/bkash/refund
// ---------------------------------------------------------------------------
// Protected: Only ADMIN can initiate refund for an executed payment.
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();

    if (!session?.userId || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const body = (await request.json().catch(() => null)) as {
      paymentId?: string;
      paymentID?: string;
      trxID?: string;
      amount?: number | string;
      reason?: string;
    } | null;

    if (!body?.paymentId && (!body?.paymentID || !body?.trxID)) {
      return NextResponse.json(
        { success: false, message: "paymentId or (paymentID and trxID) is required" },
        { status: 400 },
      );
    }

    // Find payment record
    const payment = body.paymentId
      ? await prisma.payment.findUnique({
          where: { id: body.paymentId },
          include: { subscription: true },
        })
      : await prisma.payment.findFirst({
          where: {
            OR: [
              ...(body.paymentID ? [{ paymentID: body.paymentID }] : []),
              ...(body.trxID ? [{ trxID: body.trxID }] : []),
            ],
          },
          include: { subscription: true },
        });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment record not found" },
        { status: 404 },
      );
    }

    if (payment.status !== "PAID") {
      return NextResponse.json(
        { success: false, message: `Cannot refund payment with status: ${payment.status}` },
        { status: 400 },
      );
    }

    const paymentID = payment.paymentID;
    const trxID = payment.trxID || payment.transactionId;

    if (!paymentID || !trxID) {
      return NextResponse.json(
        { success: false, message: "Missing bKash paymentID or trxID required for refund" },
        { status: 400 },
      );
    }

    const refundAmount = body.amount ? Number(body.amount) : Number(payment.amount);
    const refundReason = body.reason || "Subscription refund approved by administrator";

    const refundResult = await refundBkashPayment({
      paymentID,
      trxID,
      amount: refundAmount,
      reason: refundReason,
    });

    // Update payment to REFUNDED and cancel the subscription
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "REFUNDED",
          failureReason: `Refunded: ${refundReason} (RefundTrx: ${refundResult.refundTrxID || "N/A"})`,
        },
      }),
      prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: "CANCELLED",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Refund processed successfully",
      data: refundResult,
    });
  } catch (error) {
    console.error("[bKash Refund Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process bKash refund";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
