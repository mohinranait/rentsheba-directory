import { NextResponse } from "next/server";
import {
  executeBkashPayment,
  queryBkashPayment,
} from "@/lib/bkash";
import config from "@/lib/config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// GET /api/payment/bkash/callback
// ---------------------------------------------------------------------------
// bKash redirects the user back to this URL after payment checkout with:
// ?paymentID=...&status=success|failure|cancel
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status") ?? "").toLowerCase();
  const paymentID = searchParams.get("paymentID") ?? "";
  const merchantInvoiceNumber = searchParams.get("merchantInvoiceNumber") ?? "";

  const origin = config.app_url ?? new URL(request.url).origin;
  const statusBaseUrl = `${origin}/subscription/status`;

  console.log(`[bKash Callback] Received callback: status="${status}", paymentID="${paymentID}", invoice="${merchantInvoiceNumber}"`);

  if (!paymentID) {
    console.error("[bKash Callback] Missing paymentID in query params");
    return NextResponse.redirect(`${statusBaseUrl}?result=failed`);
  }

  try {
    // 1. Locate the pending payment in the database
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { paymentID },
          ...(merchantInvoiceNumber ? [{ merchantInvoiceNumber }] : []),
        ],
      },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!payment) {
      console.error(`[bKash Callback] Payment record not found for paymentID="${paymentID}"`);
      return NextResponse.redirect(`${statusBaseUrl}?result=failed`);
    }

    // 2. Idempotency Check: if payment is already completed/paid, return success without re-executing
    if (payment.status === "PAID") {
      console.log(`[bKash Callback] Payment ${payment.id} already marked as PAID. Returning success.`);
      const existingTrx = payment.trxID || payment.transactionId || "";
      return NextResponse.redirect(
        `${statusBaseUrl}?result=success&trx=${encodeURIComponent(existingTrx)}`,
      );
    }

    // 3. User cancelled on the bKash checkout screen
    if (status === "cancel") {
      console.log(`[bKash Callback] Payment ${payment.id} cancelled by user.`);
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "CANCELLED",
            failureReason: "Payment cancelled by user on bKash",
          },
        }),
        prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: { status: "CANCELLED" },
        }),
      ]);

      return NextResponse.redirect(`${statusBaseUrl}?result=cancelled&paymentID=${encodeURIComponent(paymentID)}`);
    }

    // 4. bKash reported payment failure (insufficient balance, wrong PIN, timeout, etc.)
    if (status === "failure") {
      const bKashReason =
        searchParams.get("errorMessage") ||
        searchParams.get("statusMessage") ||
        "Payment failed on bKash checkout";

      console.warn(`[bKash Callback] Payment ${payment.id} failed on bKash: ${bKashReason}`);
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            failureReason: bKashReason,
          },
        }),
        prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: { status: "CANCELLED" },
        }),
      ]);

      return NextResponse.redirect(
        `${statusBaseUrl}?result=failed&paymentID=${encodeURIComponent(paymentID)}&reason=${encodeURIComponent(bKashReason)}`,
      );
    }

    // 5. Payment was authorized by user on bKash -> Execute and complete transaction
    if (status === "success") {
      let trxID = "";
      let customerMsisdn: string | undefined;
      let executeData: Record<string, unknown> | undefined;

      try {
        console.log(`[bKash Callback] Executing payment ${paymentID}...`);
        const executionResult = await executeBkashPayment({ paymentID });

        if (
          executionResult.transactionStatus === "Completed" &&
          executionResult.trxID
        ) {
          trxID = executionResult.trxID;
          customerMsisdn = executionResult.customerMsisdn;
          executeData = executionResult as unknown as Record<string, unknown>;
        } else {
          throw new Error(
            `bKash execute returned status: ${executionResult.transactionStatus}`,
          );
        }
      } catch (executeErr) {
        console.warn("[bKash Callback] Direct execute threw, verifying via Query Payment Status API:", executeErr);

        // Fallback: Query payment status to reconcile if execution was already processed or network glitched
        try {
          const queryResult = await queryBkashPayment({ paymentID });
          if (
            queryResult.transactionStatus === "Completed" &&
            queryResult.trxID
          ) {
            trxID = queryResult.trxID;
            executeData = queryResult as unknown as Record<string, unknown>;
          } else {
            throw executeErr;
          }
        } catch {
          const failureMsg =
            executeErr instanceof Error
              ? executeErr.message
              : "bKash execute failed";

          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: "FAILED",
                failureReason: failureMsg,
              },
            }),
            prisma.subscription.update({
              where: { id: payment.subscriptionId },
              data: { status: "CANCELLED" },
            }),
          ]);

          return NextResponse.redirect(`${statusBaseUrl}?result=failed`);
        }
      }

      // Calculate subscription duration
      const now = new Date();
      const planDays = payment.subscription.plan.durationInDays;
      const expiresAt =
        planDays > 0 ? new Date(now.getTime() + planDays * 86_400_000) : null;

      // Activate subscription and mark payment as PAID atomically
      await prisma.$transaction([
        prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: {
            status: "ACTIVE",
            startsAt: now,
            expiresAt,
          },
        }),
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            transactionId: trxID,
            trxID,
            customerMsisdn: customerMsisdn ?? null,
            paidAt: now,
            failureReason: null,
            metadata: JSON.parse(JSON.stringify(executeData ?? {})),
          },
        }),
      ]);

      console.log(`[bKash Callback] Subscription ${payment.subscriptionId} activated successfully. TrxID: ${trxID}`);

      return NextResponse.redirect(
        `${statusBaseUrl}?result=success&trx=${encodeURIComponent(trxID)}`,
      );
    }

    // Any unrecognized status
    console.warn(`[bKash Callback] Unrecognized status: "${status}" for payment ${payment.id}`);
    return NextResponse.redirect(`${statusBaseUrl}?result=failed`);
  } catch (error) {
    console.error("[bKash Callback] Unexpected callback error:", error);
    return NextResponse.redirect(`${statusBaseUrl}?result=failed`);
  }
}
