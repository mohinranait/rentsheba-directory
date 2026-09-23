import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subscriptionPlanFormSchema } from "@/lib/schemas/subscription-plan-schema";
import { slugify, uniqueSlug } from "@/lib/slug";
import type {
  SubscriptionPlanFormValues,
  SubscriptionPlanStats,
} from "@/types/subscription-plan.type";
import { getSessionUser } from "@/utils/session";

// ---------------------------------------------------------------------------
// GET /api/admin/subscription-plan
// ---------------------------------------------------------------------------
// Returns every plan (active + inactive) with list stats. Plans are a tiny
// fixed set (type is unique), so no pagination — the client filters locally.
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const [items, total, active] = await Promise.all([
      prisma.subscriptionPlan.findMany({
        orderBy: [{ price: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          price: true,
          maxListings: true,
          durationInDays: true,
          description: true,
          features: true,
          badge: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { subscriptions: true } },
        },
      }),
      prisma.subscriptionPlan.count(),
      prisma.subscriptionPlan.count({ where: { isActive: true } }),
    ]);

    const stats: SubscriptionPlanStats = {
      total,
      active,
      inactive: total - active,
      subscriptions: items.reduce(
        (sum, plan) => sum + plan._count.subscriptions,
        0,
      ),
    };

    return NextResponse.json({
      success: true,
      data: { items, stats },
    });
  } catch (error) {
    console.error("Get subscription plans error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/subscription-plan
// ---------------------------------------------------------------------------
// Body: SubscriptionPlanFormValues (JSON).
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = (await request
      .json()
      .catch(() => null)) as Partial<SubscriptionPlanFormValues> | null;

    const parsed = subscriptionPlanFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const values = parsed.data;

    const typeExists = await prisma.subscriptionPlan.findUnique({
      where: { type: values.type },
      select: { id: true },
    });

    if (typeExists) {
      return NextResponse.json(
        {
          success: false,
          message: `A ${values.type.toLowerCase()} plan already exists`,
        },
        { status: 400 },
      );
    }

    const generatedSlug = values.slug.trim() || slugify(values.name);
    const finalSlug = await uniqueSlug(generatedSlug, (candidate) =>
      prisma.subscriptionPlan
        .findUnique({ where: { slug: candidate }, select: { id: true } })
        .then((found) => found !== null),
    );

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: values.name.trim(),
        slug: finalSlug,
        type: values.type,
        price: values.price,
        maxListings: values.maxListings,
        durationInDays: values.durationInDays,
        description: values.description.trim() || null,
        features: values.features,
        badge: values.badge.trim() || null,
        isActive: values.isActive,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Subscription plan created successfully",
        data: plan,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create subscription plan error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
