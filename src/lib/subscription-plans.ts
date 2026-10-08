import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { SubscriptionPlan } from "@/types/subscription-plan.type";

export const getCachedSubscriptionPlans = unstable_cache(
  async (): Promise<SubscriptionPlan[]> => {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: [{ price: "asc" }],
    });

    return plans.map((p) => ({
      ...p,
      price: Number(p.price),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })) as unknown as SubscriptionPlan[];
  },
  ["subscription-plans-public"],
  {
    revalidate: 3600 * 24, // 24 hours
    tags: ["subscription-plans"],
  },
);
