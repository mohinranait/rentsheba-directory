import { ArrowRight } from "lucide-react";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ListingStatus } from "../../../../generated/prisma/enums";

export const CATEGORIES_REVALIDATE = 3600 * 24; // 24 hours ISR

export type PublicCategoryCardItem = {
  id: string;
  name: string;
  slug: string;
  image: {
    secure_url: string;
    alt: string | null;
  } | null;
  listingCount: number;
};

const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  restaurant: "🍽️",
  food: "🍽️",
  cafe: "☕",
  dining: "🍽️",
  health: "✚",
  medical: "🏥",
  hospital: "🏥",
  ambulance: "🚑",
  doctor: "🩺",
  car: "🚗",
  vehicle: "🚗",
  rent: "🚘",
  transport: "🚌",
  home: "⌂",
  repair: "🔧",
  construction: "🔨",
  professional: "▣",
  service: "▣",
  shopping: "🛍️",
  retail: "▱",
  store: "🏪",
  education: "📚",
  school: "🏫",
  training: "▤",
  hotel: "🏨",
  travel: "✈️",
  beauty: "✨",
  salon: "💇",
};

function getCategoryFallbackIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(DEFAULT_CATEGORY_ICONS)) {
    if (lower.includes(key)) {
      return icon;
    }
  }
  return "🏷️";
}

// ---------------------------------------------------------------------------
// Cached database query with 24-hour ISR revalidation
// Fetches strictly necessary public fields only — no internal metadata,
// timestamps, or full listing arrays.
// ---------------------------------------------------------------------------
export const getCachedCategories = unstable_cache(
  async (limit: number = 6): Promise<PublicCategoryCardItem[]> => {
    // 1. Fetch only active, non-deleted categories with strictly necessary fields
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        delatedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        image: {
          select: {
            secure_url: true,
            alt: true,
          },
        },
        _count: {
          select: {
            listings: {
              where: {
                verificationStatus: ListingStatus.APPROVED,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // 2. Roll up child category listing counts to parent categories
    const childCounts = new Map<string, number>();
    for (const cat of categories) {
      if (cat.parentId) {
        const cur = childCounts.get(cat.parentId) ?? 0;
        childCounts.set(cat.parentId, cur + cat._count.listings);
      }
    }

    const formatted: PublicCategoryCardItem[] = categories.map((cat) => {
      const total = cat._count.listings + (childCounts.get(cat.id) ?? 0);
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        listingCount: total,
      };
    });

    // 3. Prioritize categories by listing count
    formatted.sort((a, b) => b.listingCount - a.listingCount);

    return formatted.slice(0, limit);
  },
  ["public-categories-grid"],
  {
    revalidate: CATEGORIES_REVALIDATE,
    tags: ["categories"],
  },
);

// ---------------------------------------------------------------------------
// Skeleton fallback for Suspense in page.tsx
// ---------------------------------------------------------------------------
export const CategoriesGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={`category-skeleton-${i}`}
        className="rounded-2xl border border-[#e1e9e3] bg-white p-5 animate-pulse"
      >
        <div className="flex items-center justify-between">
          <div className="size-11 rounded-xl bg-[#eef4f0]" />
          <div className="size-4 rounded bg-[#eef4f0]" />
        </div>
        <div className="mt-6 h-5 w-3/4 rounded bg-[#eef4f0]" />
        <div className="mt-2 h-4 w-1/3 rounded bg-[#eef4f0]" />
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// Server Component: CategoriesGrid
// ---------------------------------------------------------------------------
const CategoriesGrid = async ({ limit = 6 }: { limit?: number }) => {
  const categories = await getCachedCategories(limit);

  if (categories.length === 0) {
    return (
      <div className="mt-10 col-span-full rounded-2xl border border-dashed border-[#cbdcd1] bg-white/40 p-10 text-center text-sm text-[#6d887d]">
        No categories available right now.
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((item) => {
        const countText = `${item.listingCount.toLocaleString()} ${
          item.listingCount === 1 ? "listing" : "listings"
        }`;

        return (
          <Link
            href={`/search?category=${encodeURIComponent(item.slug)}`}
            key={item.id}
            className="group rounded-2xl border border-[#e1e9e3] bg-white p-5 transition hover:border-[#b9d4c5] hover:shadow-[0_12px_30px_rgba(43,92,67,.08)]"
          >
            <div className="flex items-center justify-between">
              {item.image?.secure_url ? (
                <div className="relative size-11 overflow-hidden rounded-xl border border-[#d6e5dc] bg-[#edf5ef]">
                  <Image
                    src={item.image.secure_url}
                    alt={item.image.alt || item.name}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <span className="grid size-11 place-items-center rounded-xl bg-[#edf5ef] text-xl text-[#3b7b63]">
                  {getCategoryFallbackIcon(item.name)}
                </span>
              )}
              <ArrowRight className="size-4 text-[#b2c2bb] transition group-hover:translate-x-1 group-hover:text-[#4b8b71]" />
            </div>
            <h3 className="mt-6 font-bold text-[#254b3f] line-clamp-1">
              {item.name}
            </h3>
            <p className="mt-1 text-sm text-[#81968d]">{countText}</p>
          </Link>
        );
      })}
    </div>
  );
};

export default CategoriesGrid;