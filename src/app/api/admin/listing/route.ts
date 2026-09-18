import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ListingStatus } from "../../../../../generated/prisma/enums";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const SORT_FIELDS = ["createdAt", "title", "viewCount"] as const;
const SORT_ORDERS = ["asc", "desc"] as const;
const STATUSES = Object.values(ListingStatus) as string[];

// ---------------------------------------------------------------------------
// GET /api/admin/listing
// ---------------------------------------------------------------------------
// Dynamic listing table endpoint with search, filters, sorting and
// server-side pagination.
//
// Query params:
//   search     Partial match on title, description or owner name
//   status     ListingStatus (APPROVED | PENDING | REJECTED | ...) or empty
//   categoryId Restrict to a single category
//   locationId Restrict to a location and all of its descendants
//   sortBy     createdAt | title | viewCount (default: createdAt)
//   sortOrder  asc | desc (default: desc)
//   page       1-based page number (default: 1)
//   pageSize   Rows per page (default: 10, max: 100)
// ---------------------------------------------------------------------------

type GroupedCount = {
  verificationStatus: ListingStatus;
  _count: { _all: number };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number(searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE)),
    );

    const search = searchParams.get("search")?.trim() ?? "";
    const status = searchParams.get("status") ?? "";
    const categoryId = searchParams.get("categoryId") ?? "";
    const locationId = searchParams.get("locationId") ?? "";

    const sortByRaw = searchParams.get("sortBy") ?? "createdAt";
    const sortBy = (SORT_FIELDS as readonly string[]).includes(sortByRaw)
      ? (sortByRaw as (typeof SORT_FIELDS)[number])
      : "createdAt";

    const sortOrderRaw = searchParams.get("sortOrder") ?? "desc";
    const sortOrder = (SORT_ORDERS as readonly string[]).includes(sortOrderRaw)
      ? (sortOrderRaw as "asc" | "desc")
      : "desc";

    const where = {
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              {
                description: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                owner: {
                  is: {
                    name: { contains: search, mode: "insensitive" as const },
                  },
                },
              },
            ],
          }
        : {}),
      ...(status && STATUSES.includes(status)
        ? { verificationStatus: status as ListingStatus }
        : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(locationId
        ? { locationId: { in: await collectLocationIds(locationId) } }
        : {}),
    };

    const [total, items, counts] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          slug: true,
          verificationStatus: true,
          isFeatured: true,
          isClaimed: true,
          viewCount: true,
          averageRating: true,
          reviewCount: true,
          createdAt: true,
          owner: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true } },
          location: { select: { id: true, nameEn: true, nameLocal: true } },
          thumbnail: { select: { id: true, secure_url: true } },
        },
      }),
      prisma.listing.groupBy({
        by: ["verificationStatus"],
        _count: { _all: true },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      success: true,
      data: {
        items,
        meta: {
          total,
          page,
          pageSize,
          totalPages,
        },
        stats: buildStats(counts as unknown as GroupedCount[]),
      },
    });
  } catch (error) {
    console.error("Get admin listings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}

function buildStats(counts: GroupedCount[]) {
  const byStatus = new Map<ListingStatus, number>();

  for (const row of counts) {
    byStatus.set(row.verificationStatus, row._count._all);
  }

  const total = counts.reduce((sum, row) => sum + row._count._all, 0);

  return {
    total,
    approved: byStatus.get(ListingStatus.APPROVED) ?? 0,
    pending: byStatus.get(ListingStatus.PENDING) ?? 0,
    rejected: byStatus.get(ListingStatus.REJECTED) ?? 0,
  };
}

// Returns a location id and every descendant id (division → district →
// upazila) so filtering by a parent also matches all of its children.
async function collectLocationIds(locationId: string): Promise<string[]> {
  const locations = await prisma.location.findMany({
    select: { id: true, parentId: true },
  });

  const childrenByParent = new Map<string | null, string[]>();

  for (const location of locations) {
    const siblings = childrenByParent.get(location.parentId) ?? [];
    siblings.push(location.id);
    childrenByParent.set(location.parentId, siblings);
  }

  const ids: string[] = [];

  const walk = (id: string) => {
    ids.push(id);
    for (const childId of childrenByParent.get(id) ?? []) {
      walk(childId);
    }
  };

  walk(locationId);

  return ids;
}

// POST placeholder kept for future manual listing creation.
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: "Not implemented",
    },
    { status: 501 },
  );
}
