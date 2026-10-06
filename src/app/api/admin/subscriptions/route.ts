import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type {
  AdminSubscriptionItem,
  AdminSubscriptionListResponse,
  AdminSubscriptionStats,
} from "@/types/subscription-admin.type";
import { getSessionUser } from "@/utils/session";
import {
  PaymentStatus,
  SubscriptionStatus,
} from "@generated/prisma/enums";

// ---------------------------------------------------------------------------
// GET /api/admin/subscriptions
// ---------------------------------------------------------------------------
// Lists all subscriptions with user details, plan info, and payment records.
// Supports search, status filtering, payment status filtering, and pagination.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const statusParam = searchParams.get("status")?.trim().toUpperCase() || "";
    const paymentStatusParam =
      searchParams.get("paymentStatus")?.trim().toUpperCase() || "";
    const planIdParam = searchParams.get("planId")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get("pageSize") || "10", 10)),
    );

    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    // Build Prisma where clause
    const where: Record<string, unknown> = {};

    if (
      statusParam &&
      Object.values(SubscriptionStatus).includes(
        statusParam as SubscriptionStatus,
      )
    ) {
      where.status = statusParam as SubscriptionStatus;
    }

    if (planIdParam) {
      where.planId = planIdParam;
    }

    if (
      paymentStatusParam &&
      Object.values(PaymentStatus).includes(
        paymentStatusParam as PaymentStatus,
      )
    ) {
      where.payment = {
        status: paymentStatusParam as PaymentStatus,
      };
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search, mode: "insensitive" } } },
        { payment: { trxID: { contains: search, mode: "insensitive" } } },
        { payment: { paymentID: { contains: search, mode: "insensitive" } } },
        {
          payment: {
            merchantInvoiceNumber: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    // Execute queries concurrently
    const [subscriptions, totalCount, statsAgg] = await Promise.all([
      prisma.subscription.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
          plan: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              maxListings: true,
              durationInDays: true,
            },
          },
          payment: true,
        },
      }),
      prisma.subscription.count({ where }),
      // Calculate overall counts and stats
      Promise.all([
        prisma.subscription.count(),
        prisma.subscription.count({
          where: {
            status: SubscriptionStatus.ACTIVE,
            OR: [{ expiresAt: { gt: now } }, { expiresAt: null }],
          },
        }),
        prisma.subscription.count({
          where: { status: SubscriptionStatus.PENDING },
        }),
        prisma.subscription.count({
          where: {
            OR: [
              { status: SubscriptionStatus.EXPIRED },
              {
                status: SubscriptionStatus.ACTIVE,
                expiresAt: { lte: now },
              },
            ],
          },
        }),
        prisma.subscription.count({
          where: { status: SubscriptionStatus.CANCELLED },
        }),
        prisma.subscription.count({
          where: {
            status: SubscriptionStatus.ACTIVE,
            expiresAt: {
              gt: now,
              lte: thirtyDaysFromNow,
            },
          },
        }),
        prisma.payment.aggregate({
          where: { status: PaymentStatus.PAID },
          _sum: { amount: true },
        }),
      ]),
    ]);

    const [
      totalAll,
      activeCount,
      pendingCount,
      expiredCount,
      cancelledCount,
      expiringSoonCount,
      revenueAgg,
    ] = statsAgg;

    const stats: AdminSubscriptionStats = {
      total: totalAll,
      active: activeCount,
      pending: pendingCount,
      expired: expiredCount,
      cancelled: cancelledCount,
      expiringSoon: expiringSoonCount,
      totalRevenue: Number(revenueAgg._sum.amount ?? 0),
    };

    const items: AdminSubscriptionItem[] = subscriptions.map((sub) => {
      let daysRemaining: number | null = null;
      let isExpiringSoon = false;

      if (sub.expiresAt) {
        const diffMs = new Date(sub.expiresAt).getTime() - now.getTime();
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (
          sub.status === SubscriptionStatus.ACTIVE &&
          daysRemaining >= 0 &&
          daysRemaining <= 30
        ) {
          isExpiringSoon = true;
        }
      }

      return {
        id: sub.id,
        userId: sub.userId,
        planId: sub.planId,
        status: sub.status,
        startsAt: sub.startsAt.toISOString(),
        expiresAt: sub.expiresAt ? sub.expiresAt.toISOString() : null,
        createdAt: sub.createdAt.toISOString(),
        updatedAt: sub.updatedAt.toISOString(),
        user: {
          id: sub.user.id,
          name: sub.user.name,
          email: sub.user.email,
          phone: sub.user.phone,
          image: sub.user.image,
        },
        plan: {
          id: sub.plan.id,
          name: sub.plan.name,
          slug: sub.plan.slug,
          price: sub.plan.price.toString(),
          maxListings: sub.plan.maxListings,
          durationInDays: sub.plan.durationInDays,
        },
        payment: sub.payment
          ? {
              id: sub.payment.id,
              transactionId: sub.payment.transactionId,
              paymentID: sub.payment.paymentID,
              trxID: sub.payment.trxID,
              merchantInvoiceNumber: sub.payment.merchantInvoiceNumber,
              amount: sub.payment.amount.toString(),
              currency: sub.payment.currency,
              method: sub.payment.method,
              status: sub.payment.status,
              customerMsisdn: sub.payment.customerMsisdn,
              failureReason: sub.payment.failureReason,
              metadata: sub.payment.metadata,
              paidAt: sub.payment.paidAt
                ? sub.payment.paidAt.toISOString()
                : null,
              createdAt: sub.payment.createdAt.toISOString(),
            }
          : null,
        daysRemaining,
        isExpiringSoon,
      };
    });

    const response: AdminSubscriptionListResponse = {
      success: true,
      data: {
        items,
        meta: {
          total: totalCount,
          page,
          pageSize,
          totalPages: Math.ceil(totalCount / pageSize) || 1,
        },
        stats,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get admin subscriptions error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
