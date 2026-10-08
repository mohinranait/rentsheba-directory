import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ListingStatus } from "../../../../../generated/prisma/enums";

export const revalidate = 3600 * 24; // 24 hours ISR revalidation

// ---------------------------------------------------------------------------
// GET /api/public/categories
// ---------------------------------------------------------------------------
// Returns active categories for public pages and user panels.
// Optimized for performance: fetches only necessary public fields (no internal
// metadata, timestamps, or full listing arrays), with approved listing counts.
// Supports optional query parameters:
//   - rootOnly=true: returns only top-level categories (parentId is null)
//   - limit=N: limits the number of categories returned
//   - sortBy=listings: sorts by approved listing count descending
// ---------------------------------------------------------------------------

export type PublicCategoryItem = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  image: {
    secure_url: string;
    alt: string | null;
  } | null;
  listingCount: number;
  _count: {
    listings: number;
  };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rootOnly = searchParams.get("rootOnly") === "true";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.max(1, parseInt(limitParam, 10)) : undefined;
    const sortBy = searchParams.get("sortBy")?.toLowerCase();

    // 1. Fetch only active, non-deleted categories with strictly necessary fields
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        delatedAt: null,
        ...(rootOnly ? { parentId: null } : {}),
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

    // 2. If rootOnly, roll up child category listing counts to parent categories
    let formatted: PublicCategoryItem[] = [];

    if (rootOnly) {
      const childCategories = await prisma.category.findMany({
        where: {
          isActive: true,
          delatedAt: null,
          parentId: { not: null },
        },
        select: {
          parentId: true,
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
      });

      const childCounts = new Map<string, number>();
      for (const child of childCategories) {
        if (child.parentId) {
          const current = childCounts.get(child.parentId) ?? 0;
          childCounts.set(child.parentId, current + child._count.listings);
        }
      }

      formatted = categories.map((cat) => {
        const total = cat._count.listings + (childCounts.get(cat.id) ?? 0);
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          parentId: cat.parentId,
          image: cat.image,
          listingCount: total,
          _count: {
            listings: total,
          },
        };
      });
    } else {
      formatted = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parentId,
        image: cat.image,
        listingCount: cat._count.listings,
        _count: {
          listings: cat._count.listings,
        },
      }));
    }

    // 3. Optional sort by listing count
    if (sortBy === "listings" || sortBy === "popular") {
      formatted.sort((a, b) => b.listingCount - a.listingCount);
    }

    const result = limit ? formatted.slice(0, limit) : formatted;

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get public categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
