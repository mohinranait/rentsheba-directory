import { prisma } from "@/lib/prisma";

export type ListingEligibilityResult = {
  eligible: boolean;
  reason?: string;
  code?: "NO_SUBSCRIPTION" | "SUBSCRIPTION_EXPIRED" | "LIMIT_REACHED" | "OK";
  currentCount: number;
  maxListings: number;
  planName?: string;
  planSlug?: string;
  expiresAt?: Date | null;
};

/**
 * Checks whether a user is allowed to create another listing
 * based on their active subscription status and plan listing limits.
 */
export async function checkUserListingEligibility(
  userId: string,
): Promise<ListingEligibilityResult> {
  const now = new Date();

  // 1. Find user's active, non-expired subscription
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      OR: [{ expiresAt: { gt: now } }, { expiresAt: null }],
    },
    include: {
      plan: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const currentCount = await prisma.listing.count({
    where: { ownerId: userId },
  });

  // If no active subscription
  if (!activeSubscription) {
    // Check if user has an expired subscription
    const expiredSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        expiresAt: { lte: now },
      },
      include: { plan: true },
      orderBy: { expiresAt: "desc" },
    });

    if (expiredSubscription) {
      return {
        eligible: false,
        code: "SUBSCRIPTION_EXPIRED",
        reason: `Your subscription to "${expiredSubscription.plan.name}" expired on ${expiredSubscription.expiresAt?.toLocaleDateString()}. Please renew or upgrade your plan to create listings.`,
        currentCount,
        maxListings: expiredSubscription.plan.maxListings,
        planName: expiredSubscription.plan.name,
        planSlug: expiredSubscription.plan.slug,
        expiresAt: expiredSubscription.expiresAt,
      };
    }

    return {
      eligible: false,
      code: "NO_SUBSCRIPTION",
      reason: "You do not have an active subscription. Please subscribe to a plan to start creating listings.",
      currentCount,
      maxListings: 0,
    };
  }

  const maxListings = activeSubscription.plan.maxListings;

  // Check quota limit
  if (currentCount >= maxListings) {
    return {
      eligible: false,
      code: "LIMIT_REACHED",
      reason: `You have reached the maximum listing limit (${maxListings}) allowed by your "${activeSubscription.plan.name}" plan. Please upgrade your plan to create more listings.`,
      currentCount,
      maxListings,
      planName: activeSubscription.plan.name,
      planSlug: activeSubscription.plan.slug,
      expiresAt: activeSubscription.expiresAt,
    };
  }

  return {
    eligible: true,
    code: "OK",
    currentCount,
    maxListings,
    planName: activeSubscription.plan.name,
    planSlug: activeSubscription.plan.slug,
    expiresAt: activeSubscription.expiresAt,
  };
}
