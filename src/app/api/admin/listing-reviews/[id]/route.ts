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
// PATCH — approve / reject / restore OR edit review content
// ---------------------------------------------------------------------------
// Body (partial): { status?, rating?, text?, name?, listingId? }
//
// Whenever an update changes the review's ACTIVE contribution (status,
// rating or the listing it belongs to) the cached listing aggregates
// (averageRating, reviewCount) are recomputed so the public page stays
// correct — for both the old and the new listing when it moves.
// ---------------------------------------------------------------------------

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const body = (await request.json().catch(() => null)) as {
      status?: unknown;
      rating?: unknown;
      text?: unknown;
      name?: unknown;
      listingId?: unknown;
    } | null;

    if (!body) {
      return json({ success: false, message: "Nothing to update" }, 400);
    }

    const data: {
      status?: ReviewStatus;
      rating?: number;
      text?: string;
      name?: string | null;
      listingId?: string;
    } = {};

    if (body.status !== undefined) {
      const status = body.status;
      if (typeof status !== "string" || !STATUSES.includes(status)) {
        return json(
          { success: false, message: "A valid review status is required" },
          400,
        );
      }
      data.status = status as ReviewStatus;
    }

    if (body.rating !== undefined) {
      const rating = Number(body.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return json(
          { success: false, message: "Rating must be between 1 and 5" },
          400,
        );
      }
      data.rating = rating;
    }

    if (body.text !== undefined) {
      const text = typeof body.text === "string" ? body.text.trim() : "";
      if (!text) {
        return json({ success: false, message: "Please write a review" }, 400);
      }
      if (text.length > 1000) {
        return json(
          { success: false, message: "Review must be under 1000 characters" },
          400,
        );
      }
      data.text = text;
    }

    if (body.name !== undefined) {
      if (body.name === null) {
        data.name = null;
      } else if (typeof body.name === "string") {
        const name = body.name.trim();
        if (name.length > 80) {
          return json(
            { success: false, message: "Name must be under 80 characters" },
            400,
          );
        }
        data.name = name || null;
      } else {
        return json({ success: false, message: "Invalid name" }, 400);
      }
    }

    if (body.listingId !== undefined) {
      if (typeof body.listingId !== "string" || !body.listingId) {
        return json(
          { success: false, message: "A valid listing is required" },
          400,
        );
      }
      data.listingId = body.listingId;
    }

    if (Object.keys(data).length === 0) {
      return json({ success: false, message: "Nothing to update" }, 400);
    }

    const existing = await prisma.listingReview.findUnique({
      where: { id },
      select: { id: true, status: true, listingId: true },
    });

    if (!existing) {
      return json({ success: false, message: "Review not found" }, 404);
    }

    if (data.listingId && data.listingId !== existing.listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: data.listingId },
        select: { id: true },
      });
      if (!listing) {
        return json({ success: false, message: "Listing not found" }, 404);
      }
    }

    const review = await prisma.listingReview.update({
      where: { id },
      data,
      include: {
        listing: { select: { id: true, title: true, slug: true } },
      },
    });

    const nextStatus = data.status ?? existing.status;
    const affectsStats =
      data.status !== undefined ||
      data.rating !== undefined ||
      (data.listingId !== undefined && data.listingId !== existing.listingId);

    if (affectsStats) {
      if (existing.status === ReviewStatus.ACTIVE) {
        await recomputeListingReviewStats(existing.listingId);
      }
      if (nextStatus === ReviewStatus.ACTIVE) {
        await recomputeListingReviewStats(review.listingId);
      }
    }

    const message =
      nextStatus === ReviewStatus.ACTIVE && data.status !== undefined
        ? "Review approved and published"
        : nextStatus === ReviewStatus.DELETED && data.status !== undefined
          ? "Review removed"
          : "Review updated";

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
