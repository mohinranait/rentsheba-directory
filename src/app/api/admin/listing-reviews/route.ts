import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReviewStatus } from "../../../../../generated/prisma/enums";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
const STATUSES = Object.values(ReviewStatus) as string[];

// ---------------------------------------------------------------------------
// GET /api/admin/listing-reviews
// ---------------------------------------------------------------------------
// Dynamic review table endpoint with search, status + listing filters and
// server-side pagination.
//
// Query params:
//   search      Partial match on reviewer name, review text or listing title
//   status      ReviewStatus (PENDING | ACTIVE | DELETED) or empty
//   listingId   Restrict to a single listing ("single post" view)
//   page        1-based page number (default: 1)
//   pageSize    Rows per page (default: 10, max: 100)
// ---------------------------------------------------------------------------

type GroupedCount = {
  status: ReviewStatus;
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
    const listingId = searchParams.get("listingId") ?? "";

    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { text: { contains: search, mode: "insensitive" as const } },
              {
                listing: {
                  is: {
                    title: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                },
              },
            ],
          }
        : {}),
      ...(status && STATUSES.includes(status)
        ? { status: status as ReviewStatus }
        : {}),
      ...(listingId ? { listingId } : {}),
    };

    const [total, items, counts] = await Promise.all([
      prisma.listingReview.count({ where }),
      prisma.listingReview.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          rating: true,
          text: true,
          name: true,
          status: true,
          createdAt: true,
          listing: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.listingReview.groupBy({
        by: ["status"],
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
    console.error("Get admin listing reviews error:", error);

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
  const byStatus = new Map<ReviewStatus, number>();

  for (const row of counts) {
    byStatus.set(row.status, row._count._all);
  }

  const total = counts.reduce((sum, row) => sum + row._count._all, 0);

  return {
    total,
    pending: byStatus.get(ReviewStatus.PENDING) ?? 0,
    approved: byStatus.get(ReviewStatus.ACTIVE) ?? 0,
    deleted: byStatus.get(ReviewStatus.DELETED) ?? 0,
  };
}
