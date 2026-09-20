import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  PUBLIC_LISTING_DETAIL_SELECT,
  toPublicListingDetail,
} from "@/lib/public-listing";
import { ListingStatus } from "../../../../../../generated/prisma/enums";

// ---------------------------------------------------------------------------
// GET /api/public/listing/[slug]
// ---------------------------------------------------------------------------
// Visitor-facing listing detail endpoint. Only approved listings are exposed.
// Used server-side by the listing detail page as well as client-side calls.
// Responses are CDN-cacheable for fast, SEO-friendly delivery.
// ---------------------------------------------------------------------------

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;

    const listing = await prisma.listing.findFirst({
      where: { slug, verificationStatus: ListingStatus.APPROVED },
      select: PUBLIC_LISTING_DETAIL_SELECT,
    });

    if (!listing) {
      return NextResponse.json(
        {
          success: false,
          message: "Listing not found",
        },
        { status: 404 },
      );
    }

    // Fire-and-forget popularity counter. Never blocks the response and
    // avoids touching @updatedAt (updateMany skips the hook).
    prisma.listing
      .updateMany({
        where: { id: listing.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});

    return NextResponse.json(
      {
        success: true,
        data: toPublicListingDetail(listing),
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("Get public listing error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
