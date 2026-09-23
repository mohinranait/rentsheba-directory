import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subscriptionPlanFormSchema } from "@/lib/schemas/subscription-plan-schema";
import { slugify, uniqueSlug } from "@/lib/slug";
import type { SubscriptionPlanFormValues } from "@/types/subscription-plan.type";
import { getSessionUser } from "@/utils/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ---------------------------------------------------------------------------
// GET /api/admin/subscription-plan/[id]
// ---------------------------------------------------------------------------

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: { _count: { select: { subscriptions: true } } },
    });

    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription plan not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error("Get subscription plan error:", error);

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
// PATCH /api/admin/subscription-plan/[id]
// ---------------------------------------------------------------------------
// Accepts the full SubscriptionPlanFormValues payload from the edit dialog,
// or a partial body (e.g. `{ isActive: false }`) for quick row toggles.
// Missing keys fall back to the current values before validation.
// ---------------------------------------------------------------------------

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    const existing = await prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription plan not found",
        },
        { status: 404 },
      );
    }

    const body = (await request
      .json()
      .catch(() => ({}))) as Partial<SubscriptionPlanFormValues> &
      Record<string, unknown>;

    const merged: SubscriptionPlanFormValues = {
      name: typeof body.name === "string" ? body.name : existing.name,
      slug: typeof body.slug === "string" ? body.slug : existing.slug,
      type: typeof body.type === "string" ? body.type : existing.type,
      price:
        body.price !== undefined ? Number(body.price) : Number(existing.price),
      maxListings:
        body.maxListings !== undefined
          ? Number(body.maxListings)
          : existing.maxListings,
      durationInDays:
        body.durationInDays !== undefined
          ? Number(body.durationInDays)
          : existing.durationInDays,
      description:
        typeof body.description === "string"
          ? body.description
          : (existing.description ?? ""),
      features: Array.isArray(body.features)
        ? (body.features.filter(
            (feature): feature is string => typeof feature === "string",
          ) as string[])
        : existing.features,
      badge:
        typeof body.badge === "string" ? body.badge : (existing.badge ?? ""),
      isActive:
        typeof body.isActive === "boolean" ? body.isActive : existing.isActive,
    };

    const parsed = subscriptionPlanFormSchema.safeParse(merged);

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

    if (values.type !== existing.type) {
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
    }

    const suppliedSlug = values.slug.trim() || slugify(values.name);
    const finalSlug =
      suppliedSlug === existing.slug
        ? existing.slug
        : await uniqueSlug(suppliedSlug, (candidate) =>
            prisma.subscriptionPlan
              .findFirst({
                where: { slug: candidate, id: { not: id } },
                select: { id: true },
              })
              .then((found) => found !== null),
          );

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
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
      include: { _count: { select: { subscriptions: true } } },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription plan updated successfully",
      data: plan,
    });
  } catch (error) {
    console.error("Update subscription plan error:", error);

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
// DELETE /api/admin/subscription-plan/[id]
// ---------------------------------------------------------------------------
// Plans referenced by subscriptions are protected (FK RESTRICT) — we check
// the count up front and tell the admin to deactivate instead.
// ---------------------------------------------------------------------------

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    const existing = await prisma.subscriptionPlan.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        _count: { select: { subscriptions: true } },
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription plan not found",
        },
        { status: 404 },
      );
    }

    if (existing._count.subscriptions > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `“${existing.name}” has ${existing._count.subscriptions} subscription(s) and cannot be deleted. Deactivate it instead.`,
        },
        { status: 400 },
      );
    }

    const deleted = await prisma.subscriptionPlan.delete({
      where: { id },
      select: { id: true, name: true },
    });

    return NextResponse.json({
      success: true,
      message: `"${deleted.name}" deleted successfully`,
      data: deleted,
    });
  } catch (error) {
    console.error("Delete subscription plan error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
