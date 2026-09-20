import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  PUBLIC_LISTING_DETAIL_SELECT,
  toPublicListingDetail,
} from "@/lib/public-listing";
import { deleteOwnedListing, updateOwnedListing } from "@/utils/owner-listing";
import { getSessionUser } from "@/utils/session";
import { ListingStatus } from "../../../../../../generated/prisma/enums";

// ---------------------------------------------------------------------------
// /api/public/listing/[slug]
// ---------------------------------------------------------------------------
// Three verbs, three audiences:
//
//   GET    → anyone (visitor), returns the approved listing for public pages.
//   PATCH  → the listing owner, updates their own listing (multipart form).
//   DELETE → the listing owner, removes their own listing.
//
// Each handler stays a thin HTTP wrapper around src/utils/owner-listing.ts so
// new behaviour (e.g. an admin editing a user listing) is easy to add later.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// GET — visitor listing detail (approved only, CDN cacheable)
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
      return json({ success: false, message: "Listing not found" }, 404);
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

    return json({ success: false, message: "Something went wrong" }, 500);
  }
}

// ---------------------------------------------------------------------------
// PATCH — owner updates their own listing (multipart form body)
// ---------------------------------------------------------------------------

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;

    const session = await getSessionUser();
    if (!session?.userId) {
      return json({ success: false, message: "Login is required" }, 401);
    }

    const formData = await request.formData();
    const result = await updateOwnedListing({
      slug,
      userId: session.userId,
      formData,
    });

    if (!result.ok) {
      return json({ success: false, message: result.message }, result.status);
    }

    return NextResponse.json({
      success: true,
      message: "Listing updated successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Update public listing error:", error);

    return json({ success: false, message: "Something went wrong" }, 500);
  }
}

// ---------------------------------------------------------------------------
// DELETE — owner removes their own listing
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;

    const session = await getSessionUser();
    if (!session?.userId) {
      return json({ success: false, message: "Login is required" }, 401);
    }

    const result = await deleteOwnedListing({
      slug,
      userId: session.userId,
    });

    if (!result.ok) {
      return json({ success: false, message: result.message }, result.status);
    }

    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Delete public listing error:", error);

    return json({ success: false, message: "Something went wrong" }, 500);
  }
}

// ---------------------------------------------------------------------------
// Small response helper — keeps the handlers above short and consistent
// ---------------------------------------------------------------------------

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status });
}
