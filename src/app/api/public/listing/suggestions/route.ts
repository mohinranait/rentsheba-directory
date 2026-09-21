import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ListingStatus } from "../../../../../../generated/prisma/enums";

// ---------------------------------------------------------------------------
// GET /api/public/listing/suggestions?q=…
// ---------------------------------------------------------------------------
// Lightweight autocomplete for the home-page search box. Returns just enough
// fields to render a suggestion row quickly (title, image, category, area),
// limited to the 6 most relevant approved listings.
// ---------------------------------------------------------------------------

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 6;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";

    if (query.length < MIN_QUERY_LENGTH) {
      return NextResponse.json({ success: true, data: [] });
    }

    const items = await prisma.listing.findMany({
      where: {
        verificationStatus: ListingStatus.APPROVED,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { tagline: { contains: query, mode: "insensitive" } },
          { shortDescription: { contains: query, mode: "insensitive" } },
          {
            category: {
              is: { name: { contains: query, mode: "insensitive" } },
            },
          },
          {
            location: {
              is: { nameLocal: { contains: query, mode: "insensitive" } },
            },
          },
        ],
      },
      orderBy: [{ viewCount: "desc" }, { averageRating: "desc" }],
      take: MAX_RESULTS,
      select: {
        id: true,
        title: true,
        slug: true,
        isFeatured: true,
        averageRating: true,
        thumbnail: { select: { secure_url: true, alt: true } },
        category: { select: { name: true } },
        location: { select: { nameLocal: true } },
      },
    });

    return NextResponse.json(
      { success: true, data: items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    console.error("Get listing suggestions error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
