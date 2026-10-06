import { NextResponse } from "next/server";
import { queryBkashPayment } from "@/lib/bkash";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/utils/session";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// POST /api/payment/bkash/query
// ---------------------------------------------------------------------------
// Allows querying bKash payment status and synchronizing state with the database.
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = (await request.json().catch(() => null)) as {
      paymentID?: string;
      internalPaymentId?: string;
    } | null;

    let paymentID = body?.paymentID;

    if (!paymentID && body?.internalPaymentId) {
      const record = await prisma.payment.findUnique({
        where: { id: body.internalPaymentId },
        select: { paymentID: true },
      });
      paymentID = record?.paymentID ?? undefined;
    }

    if (!paymentID) {
      return NextResponse.json(
        { success: false, message: "paymentID is required" },
        { status: 400 },
      );
    }

    // Call bKash Query Status API
    const result = await queryBkashPayment({ paymentID });

    // If database record exists and status is PENDING, synchronize it if Completed
    if (result.transactionStatus === "Completed" && result.trxID) {
      const dbPayment = await prisma.payment.findFirst({
        where: { paymentID },
        include: { subscription: { include: { plan: true } } },
      });

      if (dbPayment && dbPayment.status === "PENDING") {
        const now = new Date();
        const planDays = dbPayment.subscription.plan.durationInDays;
        const expiresAt =
          planDays > 0 ? new Date(now.getTime() + planDays * 86_400_000) : null;

        await prisma.$transaction([
          prisma.subscription.update({
            where: { id: dbPayment.subscriptionId },
            data: { status: "ACTIVE", startsAt: now, expiresAt },
          }),
          prisma.payment.update({
            where: { id: dbPayment.id },
            data: {
              status: "PAID",
              transactionId: result.trxID,
              trxID: result.trxID,
              paidAt: now,
            },
          }),
        ]);
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[bKash Query Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to query bKash payment";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
