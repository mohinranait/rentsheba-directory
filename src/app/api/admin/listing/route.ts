import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminListingFormSchema } from "@/lib/schemas/admin-listing-schema";
import { slugify, uniqueSlug } from "@/lib/slug";
import { parseAdminListingFormData } from "@/utils/admin-listing-form";
import { getSessionUser } from "@/utils/session";
import { uploadAndCreateMedia } from "@/utils/upload-media";
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
          isHeroListing: true,
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

// ---------------------------------------------------------------------------
// POST /api/admin/listing
// ---------------------------------------------------------------------------
// Creates a listing directly from the admin panel (multipart/form-data). The
// listing is created right away — no OTP / email verification step. Status can
// be chosen on the final "Review" step and defaults to APPROVED.
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in to create a listing",
        },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const { values } = parseAdminListingFormData(formData);

    const parsed = adminListingFormSchema.safeParse(values);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    if (!data.cover) {
      return NextResponse.json(
        {
          success: false,
          message: "A cover image is required",
        },
        { status: 400 },
      );
    }

    // Category / location must actually exist before we connect to them
    const [category, location, owner] = await Promise.all([
      data.categoryId
        ? prisma.category.findUnique({
            where: { id: data.categoryId },
            select: { id: true },
          })
        : Promise.resolve(null),
      data.locationId
        ? prisma.location.findUnique({
            where: { id: data.locationId },
            select: { id: true },
          })
        : Promise.resolve(null),
      prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true },
      }),
    ]);

    if (data.categoryId && !category) {
      return badRequest("Selected category does not exist");
    }

    if (data.locationId && !location) {
      return badRequest("Selected location does not exist");
    }

    if (!owner) {
      return badRequest("Sign-in user was not found");
    }

    const statusRaw = String(formData.get("status") ?? "");
    const status = STATUSES.includes(statusRaw)
      ? (statusRaw as ListingStatus)
      : ListingStatus.APPROVED;

    const baseSlug = slugify(data.title) || `listing-${Date.now()}`;
    const slug = await uniqueSlug(baseSlug, (candidate) =>
      prisma.listing
        .findUnique({ where: { slug: candidate }, select: { id: true } })
        .then((found) => found !== null),
    );

    const thumbnail = await uploadAndCreateMedia(data.cover, data.title);
    const logo = data.logo
      ? await uploadAndCreateMedia(data.logo, `${data.title} logo`)
      : null;

    const galleryFiles = values.gallery ?? [];
    const gallery = await Promise.all(
      galleryFiles.map((file, index) =>
        uploadAndCreateMedia(file, `${data.title} - Image ${index + 1}`),
      ),
    );

    const publishedAt = status === ListingStatus.APPROVED ? new Date() : null;

    const listing = await prisma.listing.create({
      data: {
        title: data.title,
        slug,
        tagline: data.tagline,
        shortDescription: data.shortDescription,
        description: data.description,
        phone: data.phone,
        email: data.email,
        website: data.website,
        whatsapp: data.whatsapp,
        addressLine1: data.addressLine1,
        establishedYear: data.establishedYear,
        priceRange: data.priceRange,
        areaServed: data.areaServed,
        socialLinks: data.socialLinks,
        openingHours: data.openingHours,
        features: data.features,
        faqs: data.faqs,
        verificationStatus: status,
        verifiedAt: publishedAt,
        publishedAt,
        category: category ? { connect: { id: category.id } } : undefined,
        location: location ? { connect: { id: location.id } } : undefined,
        owner: { connect: { id: owner.id } },
        logo: logo ? { connect: { id: logo.id } } : undefined,
        thumbnail: { connect: { id: thumbnail.id } },
        gallery:
          gallery.length > 0
            ? { connect: gallery.map((media) => ({ id: media.id })) }
            : undefined,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
        location: { select: { id: true, nameEn: true, nameLocal: true } },
        logo: mediaSelect,
        thumbnail: mediaSelect,
        gallery: { select: { id: true, secure_url: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Listing created successfully",
        data: listing,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create admin listing error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}

const mediaSelect = {
  select: { id: true, url: true, secure_url: true, public_id: true, alt: true },
} as const;

function badRequest(message: string) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 400 },
  );
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
