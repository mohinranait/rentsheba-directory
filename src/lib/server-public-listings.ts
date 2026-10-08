import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ListingStatus } from "../../generated/prisma/enums";
import { RELATED_LISTING_SELECT } from "./public-listing";

// ---------------------------------------------------------------------------
// Server-only cached public listing queries (ISR) for Homepage & Discovery
// Eliminates HTTP loopback fetch calls in Server Components.
// ---------------------------------------------------------------------------

export const getCachedHeroListings = unstable_cache(
  async () => {
    let listings = await prisma.listing.findMany({
      where: {
        verificationStatus: ListingStatus.APPROVED,
        isHeroListing: true,
      },
      orderBy: { viewCount: "desc" },
      take: 2,
      select: RELATED_LISTING_SELECT,
    });

    if (listings.length === 0) {
      listings = await prisma.listing.findMany({
        where: {
          verificationStatus: ListingStatus.APPROVED,
        },
        orderBy: [{ isFeatured: "desc" }, { viewCount: "desc" }],
        take: 2,
        select: RELATED_LISTING_SELECT,
      });
    }

    return listings;
  },
  ["hero-showcase-listings"],
  {
    revalidate: 3600, // 1 hour ISR
    tags: ["listings", "hero-listings"],
  },
);

export const getCachedExploreListings = unstable_cache(
  async (pageSize: number = 6) => {
    return prisma.listing.findMany({
      where: {
        verificationStatus: ListingStatus.APPROVED,
      },
      orderBy: [{ isFeatured: "desc" }, { viewCount: "desc" }],
      take: pageSize,
      select: RELATED_LISTING_SELECT,
    });
  },
  ["explore-curated-listings"],
  {
    revalidate: 3600, // 1 hour ISR
    tags: ["listings", "explore-listings"],
  },
);
