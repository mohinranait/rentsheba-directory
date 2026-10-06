import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type {
  AdminDashboardData,
  AdminDashboardResponse,
  CategoryStatItem,
  ExpiringSubscriptionItem,
  LocationStatItem,
  MonthlyTrendItem,
  PendingListingItem,
  RecentPaymentItem,
  StatusStatItem,
} from "@/types/dashboard-admin.type";
import { getSessionUser } from "@/utils/session";
import {
  ListingStatus,
  PaymentStatus,
  ReviewStatus,
  SubscriptionStatus,
  UserStatus,
} from "@generated/prisma/enums";

// ---------------------------------------------------------------------------
// GET /api/admin/dashboard
// ---------------------------------------------------------------------------
// Returns aggregated directory KPIs, monthly trends, distributions, and
// actionable recent items (pending listings, recent payments, expiring renewals).
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "#10b981", // emerald-500
  PENDING: "#f59e0b", // amber-500
  REJECTED: "#ef4444", // red-500
  SUSPENDED: "#64748b", // slate-500
  EXPIRED: "#f97316", // orange-500
  DRAFT: "#3b82f6", // blue-500
};

const CATEGORY_COLORS = [
  "#2563eb", // blue-600
  "#10b981", // emerald-500
  "#8b5cf6", // violet-500
  "#f59e0b", // amber-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
];

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Parallelize all count, aggregate and list queries
    const [
      totalListings,
      approvedListings,
      pendingListings,
      featuredListings,
      rejectedListings,
      viewsAgg,
      totalUsers,
      activeUsers,
      totalSellers,
      totalRevenueAgg,
      monthlyRevenueAgg,
      activeSubscriptions,
      pendingSubscriptions,
      expiringSoonSubscriptions,
      totalReviews,
      pendingReviews,
      categoriesWithCount,
      locationsWithCount,
      statusGroups,
      recentPendingListings,
      recentPayments,
      expiringSubs,
      pastListings,
      pastPayments,
      pastUsers,
    ] = await Promise.all([
      // Listings
      prisma.listing.count(),
      prisma.listing.count({
        where: { verificationStatus: ListingStatus.APPROVED },
      }),
      prisma.listing.count({
        where: { verificationStatus: ListingStatus.PENDING },
      }),
      prisma.listing.count({ where: { isFeatured: true } }),
      prisma.listing.count({
        where: { verificationStatus: ListingStatus.REJECTED },
      }),
      prisma.listing.aggregate({ _sum: { viewCount: true } }),

      // Users
      prisma.user.count(),
      prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      prisma.user.count({ where: { listings: { some: {} } } }),

      // Subscriptions & Revenue
      prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: PaymentStatus.PAID,
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
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
          status: SubscriptionStatus.ACTIVE,
          expiresAt: { gt: now, lte: thirtyDaysFromNow },
        },
      }),

      // Reviews
      prisma.listingReview.count(),
      prisma.listingReview.count({
        where: { status: ReviewStatus.PENDING },
      }),

      // Categories distribution
      prisma.category.findMany({
        select: {
          name: true,
          _count: { select: { listings: true } },
        },
        orderBy: { listings: { _count: "desc" } },
        take: 6,
      }),

      // Locations distribution (Divisions)
      prisma.location.findMany({
        where: { type: "DIVISION" },
        select: {
          nameLocal: true,
          nameEn: true,
          _count: { select: { listings: true } },
        },
        orderBy: { listings: { _count: "desc" } },
        take: 8,
      }),

      // Status groups
      prisma.listing.groupBy({
        by: ["verificationStatus"],
        _count: { id: true },
      }),

      // Top Pending Listings
      prisma.listing.findMany({
        where: { verificationStatus: ListingStatus.PENDING },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
          owner: { select: { name: true, email: true } },
          category: { select: { name: true } },
          location: { select: { nameLocal: true, nameEn: true } },
          thumbnail: { select: { secure_url: true } },
        },
      }),

      // Recent Payments
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          subscription: {
            include: {
              user: { select: { name: true, email: true } },
              plan: { select: { name: true } },
            },
          },
        },
      }),

      // Expiring Subscriptions (next 30 days)
      prisma.subscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          expiresAt: { gt: now },
        },
        orderBy: { expiresAt: "asc" },
        take: 5,
        include: {
          user: { select: { name: true, email: true } },
          plan: { select: { name: true } },
        },
      }),

      // Data for 6-month trends
      prisma.listing.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
      prisma.payment.findMany({
        where: {
          status: PaymentStatus.PAID,
          createdAt: { gte: sixMonthsAgo },
        },
        select: { createdAt: true, amount: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
    ]);

    // Build 6 monthly trend buckets
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyTrends: MonthlyTrendItem[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const label = `${monthNames[monthIdx]}`;

      const isInMonth = (date: Date) =>
        date.getFullYear() === year && date.getMonth() === monthIdx;

      const listingsCount = pastListings.filter((l) =>
        isInMonth(new Date(l.createdAt)),
      ).length;

      const usersCount = pastUsers.filter((u) =>
        isInMonth(new Date(u.createdAt)),
      ).length;

      const revenueSum = pastPayments
        .filter((p) => isInMonth(new Date(p.createdAt)))
        .reduce((sum, p) => sum + Number(p.amount), 0);

      monthlyTrends.push({
        month: label,
        listings: listingsCount,
        revenue: revenueSum,
        users: usersCount,
      });
    }

    // Category distribution
    const categoryDistribution: CategoryStatItem[] = categoriesWithCount.map(
      (cat, idx) => ({
        name: cat.name,
        count: cat._count.listings,
        fill: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      }),
    );

    // Location distribution
    const locationDistribution: LocationStatItem[] = locationsWithCount.map(
      (loc) => ({
        name: loc.nameLocal || loc.nameEn,
        count: loc._count.listings,
      }),
    );

    // Status distribution
    const statusDistribution: StatusStatItem[] = statusGroups.map((group) => ({
      status: group.verificationStatus,
      count: group._count.id,
      fill: STATUS_COLORS[group.verificationStatus] || "#94a3b8",
    }));

    // Formatted pending listings
    const formattedPendingListings: PendingListingItem[] =
      recentPendingListings.map((l) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        createdAt: l.createdAt.toISOString(),
        ownerName: l.owner?.name || "Anonymous",
        ownerEmail: l.owner?.email || "No email",
        categoryName: l.category?.name || "General",
        locationName: l.location?.nameLocal || l.location?.nameEn || "Bangladesh",
        thumbnailUrl: l.thumbnail?.secure_url || null,
      }));

    // Formatted recent payments
    const formattedRecentPayments: RecentPaymentItem[] = recentPayments.map(
      (p) => ({
        id: p.id,
        subscriptionId: p.subscriptionId,
        amount: Number(p.amount),
        status: p.status,
        trxID: p.trxID,
        paymentID: p.paymentID,
        paidAt: p.paidAt ? p.paidAt.toISOString() : null,
        createdAt: p.createdAt.toISOString(),
        userName: p.subscription?.user?.name || "Unknown",
        userEmail: p.subscription?.user?.email || "—",
        planName: p.subscription?.plan?.name || "Plan",
      }),
    );

    // Formatted expiring subscriptions
    const formattedExpiringSubs: ExpiringSubscriptionItem[] = expiringSubs.map(
      (sub) => {
        const diffMs = sub.expiresAt
          ? new Date(sub.expiresAt).getTime() - now.getTime()
          : 0;
        const daysRemaining = Math.max(
          0,
          Math.ceil(diffMs / (1000 * 60 * 60 * 24)),
        );

        return {
          id: sub.id,
          userId: sub.userId,
          userName: sub.user.name,
          userEmail: sub.user.email,
          planName: sub.plan.name,
          expiresAt: sub.expiresAt ? sub.expiresAt.toISOString() : "",
          daysRemaining,
        };
      },
    );

    const data: AdminDashboardData = {
      adminName: user.name || "Admin",
      kpis: {
        totalListings,
        approvedListings,
        pendingListings,
        featuredListings,
        rejectedListings,
        totalUsers,
        activeUsers,
        totalSellers,
        totalRevenue: Number(totalRevenueAgg._sum.amount ?? 0),
        monthlyRevenue: Number(monthlyRevenueAgg._sum.amount ?? 0),
        activeSubscriptions,
        pendingSubscriptions,
        expiringSoonSubscriptions,
        totalReviews,
        pendingReviews,
        totalViews: Number(viewsAgg._sum.viewCount ?? 0),
      },
      monthlyTrends,
      categoryDistribution,
      locationDistribution,
      statusDistribution,
      pendingListings: formattedPendingListings,
      recentPayments: formattedRecentPayments,
      expiringSubscriptions: formattedExpiringSubs,
    };

    const response: AdminDashboardResponse = {
      success: true,
      data,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get admin dashboard stats error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
