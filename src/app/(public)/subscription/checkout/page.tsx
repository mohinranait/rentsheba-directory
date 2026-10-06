import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { SubscriptionPlan } from "@/types/subscription-plan.type";
import { getSessionUser } from "@/utils/session";
import { CheckoutScreen } from "./components/checkout-screen";

export const dynamic = "force-dynamic";

async function serializePlan(plan: {
  id: string;
  name: string;
  slug: string;
  type: "FREE" | "YEARLY";
  price: unknown;
  maxListings: number;
  durationInDays: number;
  description: string | null;
  features: string[];
  badge: string | null;
  isActive: boolean;
}): Promise<SubscriptionPlan> {
  return {
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    type: plan.type,
    price: String(plan.price),
    maxListings: plan.maxListings,
    durationInDays: plan.durationInDays,
    description: plan.description,
    features: plan.features,
    badge: plan.badge,
    isActive: plan.isActive,
    createdAt: "",
    updatedAt: "",
  };
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan: planSlug } = await searchParams;

  const session = await getSessionUser();

  if (!session?.userId) {
    const next = `/subscription/checkout?plan=${encodeURIComponent(
      planSlug ?? "",
    )}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  if (!planSlug) {
    notFound();
  }

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { slug: planSlug },
  });

  if (!plan || !plan.isActive) {
    notFound();
  }

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId: session.userId,
      status: "ACTIVE",
      planId: plan.id,
      OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
    },
    select: { id: true, startsAt: true, expiresAt: true },
  });

  const planData = await serializePlan(plan);

  return (
    <CheckoutScreen plan={planData} alreadyActive={!!activeSubscription} />
  );
}
