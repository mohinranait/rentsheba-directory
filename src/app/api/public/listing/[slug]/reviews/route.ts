import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomGuestName } from "@/utils/listing-review";
import {
  ListingStatus,
  ReviewStatus,
} from "../../../../../../../generated/prisma/enums";

// ---------------------------------------------------------------------------
// /api/public/listing/[slug]/reviews
// ---------------------------------------------------------------------------
//   GET  → approved (ACTIVE) reviews for the listing, fresh aggregate stats.
//   POST → submit a new review. Always created as PENDING so an admin can
//          approve it before it is published.
// ---------------------------------------------------------------------------

type RouteContext = {
  params: Promise<{ slug: string }>;
};

const REVIEW_SELECT = {
  id: true,
  rating: true,
  text: true,
  name: true,
  createdAt: true,
} as const;

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const listing = await prisma.listing.findFirst({
      where: { slug, verificationStatus: ListingStatus.APPROVED },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
      },
    });

    if (!listing) {
      return json({ success: false, message: "Listing not found" }, 404);
    }

    const [reviews, aggregate] = await Promise.all([
      prisma.listingReview.findMany({
        where: { listingId: listing.id, status: ReviewStatus.ACTIVE },
        orderBy: { createdAt: "desc" },
        select: REVIEW_SELECT,
      }),
      prisma.listingReview.aggregate({
        where: { listingId: listing.id, status: ReviewStatus.ACTIVE },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        listing,
        reviews: reviews.map((review) => ({
          ...review,
          createdAt: new Date(review.createdAt).toISOString(),
        })),
        averageRating: aggregate._avg.rating ?? 0,
        reviewCount: aggregate._count._all,
      },
    });
  } catch (error) {
    console.error("Get public reviews error:", error);

    return json({ success: false, message: "Something went wrong" }, 500);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const body = (await request.json().catch(() => null)) as {
      rating?: unknown;
      text?: unknown;
      name?: unknown;
      anonymous?: unknown;
    } | null;

    const rating = Number(body?.rating ?? 0);
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const anonymous = body?.anonymous === true;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return json(
        { success: false, message: "Rating must be between 1 and 5" },
        400,
      );
    }

    if (!text) {
      return json({ success: false, message: "Please write a review" }, 400);
    }

    if (text.length > 1000) {
      return json(
        { success: false, message: "Review must be under 1000 characters" },
        400,
      );
    }

    if (name.length > 80) {
      return json(
        { success: false, message: "Name must be under 80 characters" },
        400,
      );
    }

    const listing = await prisma.listing.findFirst({
      where: { slug, verificationStatus: ListingStatus.APPROVED },
      select: { id: true, title: true },
    });

    if (!listing) {
      return json({ success: false, message: "Listing not found" }, 404);
    }

    // Anonymous → store null. Otherwise use the typed name or, if empty,
    // generate a friendly random guest name.
    const storedName = anonymous ? null : name || randomGuestName();

    const review = await prisma.listingReview.create({
      data: {
        rating,
        text,
        name: storedName,
        status: ReviewStatus.PENDING,
        listingId: listing.id,
      },
      select: {
        id: true,
        rating: true,
        text: true,
        name: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Thanks for your review! It will appear here once an admin approves it.",
        data: review,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create public review error:", error);

    return json({ success: false, message: "Something went wrong" }, 500);
  }
}

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status });
}
