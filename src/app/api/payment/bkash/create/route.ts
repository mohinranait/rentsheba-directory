import { NextResponse } from "next/server";
import {
  createBkashPayment,
  generateInvoiceNumber,
  getBkashConfig,
} from "@/lib/bkash";
import config from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/utils/session";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// POST /api/payment/bkash/create
// ---------------------------------------------------------------------------
// Body: { planId }
// 1. Validates user session and selected paid plan
// 2. Generates unique invoice number
// 3. Calls bKash Create Payment API (using Redis-cached token)
// 4. Stores PENDING subscription + payment in database with bKash paymentID
// 5. Returns bKash checkout URL for frontend redirect
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in first." },
        { status: 401 },
      );
    }

    const body = (await request.json().catch(() => null)) as { planId?: string } | null;

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
        { success: false, message: "Subscription plan not found or inactive" },
        { status: 404 },
      );
    }

    const amount = Number(plan.price);

    if (amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This plan is free. Please activate it directly without payment.",
        },
        { status: 400 },
      );
    }

    // Check if the user already has an active subscription for this plan
    const existingActive = await prisma.subscription.findFirst({
      where: {
        userId: user.userId,
        status: "ACTIVE",
        planId: plan.id,
        OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
      },
      select: { id: true },
    });

    if (existingActive) {
      return NextResponse.json(
        { success: false, message: "You already have an active subscription for this plan." },
        { status: 400 },
      );
    }

    const bkashConfig = getBkashConfig();

    if (!bkashConfig) {
      return NextResponse.json(
        {
          success: false,
          message: "bKash payment gateway is not configured yet. Please contact support.",
        },
        { status: 503 },
      );
    }

    // Determine the callback URL (configured BKASH_CALLBACK_URL or derived from APP_URL / request origin)
    const origin = config.app_url ?? new URL(request.url).origin;
    const callbackURL =
      config.bkash_callback_url || `${origin}/api/payment/bkash/callback`;

    const invoiceNumber = generateInvoiceNumber();

    // 1. Call bKash Create Payment API first
    const paymentIntent = await createBkashPayment({
      amount,
      invoiceNumber,
      callbackURL,
      payerReference: user.email || user.userId,
    });

    if (!paymentIntent.paymentID || !paymentIntent.bkashURL) {
      return NextResponse.json(
        { success: false, message: "Failed to initiate payment with bKash" },
        { status: 502 },
      );
    }

    const now = new Date();
    const expiresAt =
      plan.durationInDays > 0
        ? new Date(now.getTime() + plan.durationInDays * 86_400_000)
        : null;

    // 2. Persist PENDING Subscription and Payment records
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.userId,
        planId: plan.id,
        status: "PENDING",
        startsAt: now,
        expiresAt,
      },
    });

    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        paymentID: paymentIntent.paymentID,
        merchantInvoiceNumber: invoiceNumber,
        amount: plan.price,
        currency: "BDT",
        method: "BKASH",
        status: "PENDING",
        metadata: JSON.parse(JSON.stringify(paymentIntent)),
      },
    });

    return NextResponse.json({
      success: true,
      message: "bKash payment initiated successfully",
      data: {
        paymentID: paymentIntent.paymentID,
        bkashURL: paymentIntent.bkashURL,
      },
    });
  } catch (error) {
    console.error("[bKash Create Payment Error]:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to initiate payment";

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 },
    );
  }
}
