import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recomputeListingReviewStats } from "@/utils/listing-review";
import { ReviewStatus } from "../../../../../../generated/prisma/enums";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const STATUSES = Object.values(ReviewStatus) as string[];

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const review = await prisma.listingReview.findUnique({
      where: { id },
      include: {
        listing: { select: { id: true, title: true, slug: true } },
      },
    });

    if (!review) {
      return json({ success: false, message: "Review not found" }, 404);
    }

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error("Get listing review error:", error);

    return json({ success: false, message: "Something went wrong" }, 500);
  }
}

// ---------------------------------------------------------------------------
// PATCH — change the review status (approve / reject / restore)
// ---------------------------------------------------------------------------
// Body: { status: "PENDING" | "ACTIVE" | "DELETED" }
//
// Whenever a review transitions to/from ACTIVE the cached listing aggregates
// (averageRating, reviewCount) are recomputed so the public page stays correct.
// ---------------------------------------------------------------------------

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const body = (await request.json().catch(() => null)) as {
      status?: unknown;
    } | null;

    const status = body?.status;
    if (typeof status !== "string" || !STATUSES.includes(status)) {
      return json(
        { success: false, message: "A valid review status is required" },
        400,
      );
    }

    const nextStatus = status as ReviewStatus;

    const existing = await prisma.listingReview.findUnique({
      where: { id },
      select: { id: true, status: true, listingId: true },
    });

    if (!existing) {
      return json({ success: false, message: "Review not found" }, 404);
    }

    const review = await prisma.listingReview.update({
      where: { id },
      data: { status: nextStatus },
      include: {
        listing: { select: { id: true, title: true, slug: true } },
      },
    });

    if (existing.status !== nextStatus) {
      await recomputeListingReviewStats(existing.listingId);
    }

    const message =
      nextStatus === ReviewStatus.ACTIVE
        ? "Review approved and published"
        : nextStatus === ReviewStatus.DELETED
          ? "Review removed"
          : "Review moved back to pending";

    return NextResponse.json({
      success: true,
      message,
      data: review,
    });
  } catch (error) {
    console.error("Update listing review error:", error);

    return json({ success: false, message: "Something went wrong" }, 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.listingReview.findUnique({
      where: { id },
      select: { id: true, status: true, listingId: true },
    });

    if (!existing) {
      return json({ success: false, message: "Review not found" }, 404);
    }

    await prisma.listingReview.delete({ where: { id } });

    if (existing.status === ReviewStatus.ACTIVE) {
      await recomputeListingReviewStats(existing.listingId);
    }

    return NextResponse.json({
      success: true,
      message: "Review deleted permanently",
    });
  } catch (error) {
    console.error("Delete listing review error:", error);

    return json({ success: false, message: "Something went wrong" }, 500);
  }
}

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status });
}
