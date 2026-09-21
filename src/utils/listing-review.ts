import { prisma } from "@/lib/prisma";
import { ReviewStatus } from "../../generated/prisma/enums";

// ---------------------------------------------------------------------------
// Shared helpers for the review lifecycle.
//
// Reviews are created in a PENDING state from the public listing page. Only
// once an admin flips them to ACTIVE do they count toward the listing's cached
// averageRating / reviewCount and show up on the public page.
// ---------------------------------------------------------------------------

const GUEST_ADJECTIVES = [
  "Swift",
  "Brave",
  "Clever",
  "Sunny",
  "Happy",
  "Bright",
  "Calm",
  "Gentle",
  "Kind",
  "Lucky",
];

const GUEST_NOUNS = [
  "Panda",
  "Fox",
  "Tiger",
  "Eagle",
  "Lotus",
  "Mango",
  "Sparrow",
  "Dolphin",
  "Maple",
  "Comet",
];

// Generates a friendly, collision-light display name when a visitor submits a
// review without typing one (e.g. "BravePanda482").
export function randomGuestName(): string {
  const adjective =
    GUEST_ADJECTIVES[Math.floor(Math.random() * GUEST_ADJECTIVES.length)];
  const noun = GUEST_NOUNS[Math.floor(Math.random() * GUEST_NOUNS.length)];
  const number = Math.floor(10 + Math.random() * 90);
  return `${adjective}${noun}${number}`;
}

// Recomputes the cached aggregate stats (averageRating + reviewCount) for a
// listing from its ACTIVE reviews only. Call this whenever a review changes
// status or is deleted so the public page and JSON-LD stay accurate.
export async function recomputeListingReviewStats(listingId: string) {
  const [aggregate, count] = await Promise.all([
    prisma.listingReview.aggregate({
      where: { status: ReviewStatus.ACTIVE, listingId },
      _avg: { rating: true },
    }),
    prisma.listingReview.count({
      where: { status: ReviewStatus.ACTIVE, listingId },
    }),
  ]);

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      averageRating: aggregate._avg.rating ?? 0,
      reviewCount: count,
    },
  });

  return {
    averageRating: aggregate._avg.rating ?? 0,
    reviewCount: count,
  };
}
