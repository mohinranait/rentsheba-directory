import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminListingFormSchema } from "@/lib/schemas/admin-listing-schema";
import { slugify, uniqueSlug } from "@/lib/slug";
import { parseAdminListingFormData } from "@/utils/admin-listing-form";
import { uploadAndCreateMedia } from "@/utils/upload-media";
import { ListingStatus } from "../../../../../../generated/prisma/enums";

const STATUSES = Object.values(ListingStatus) as string[];

const mediaSelect = {
  select: { id: true, url: true, secure_url: true, public_id: true, alt: true },
} as const;

export type AdminMedia = {
  id: string;
  url: string;
  secure_url: string;
  public_id: string;
  alt: string | null;
};

export type AdminListingDetail = {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  shortDescription: string | null;
  description: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  whatsapp: string | null;
  addressLine1: string | null;
  establishedYear: number | null;
  priceRange: string | null;
  areaServed: string | null;
  openingHours: unknown;
  features: unknown;
  faqs: unknown;
  socialLinks: unknown;
  isFeatured: boolean;
  isClaimed: boolean;
  verificationStatus: ListingStatus;
  verifiedAt: string | null;
  rejectionReason: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  averageRating: number;
  reviewCount: number;
  viewCount: number;
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  owner: { id: string; name: string; email: string } | null;
  category: { id: string; name: string } | null;
  location: {
    id: string;
    nameEn: string;
    nameLocal: string;
    type: string;
  } | null;
  logo: AdminMedia | null;
  thumbnail: AdminMedia | null;
  gallery: AdminMedia[];
};

// ---------------------------------------------------------------------------
// GET /api/admin/listing/[slug]
// ---------------------------------------------------------------------------
// Full listing detail (with owner, category, location and every image) for the
// admin review page and the add/edit wizard.
// ---------------------------------------------------------------------------

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;

    const listing = await prisma.listing.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        tagline: true,
        shortDescription: true,
        description: true,
        phone: true,
        email: true,
        website: true,
        whatsapp: true,
        addressLine1: true,
        establishedYear: true,
        priceRange: true,
        areaServed: true,
        openingHours: true,
        features: true,
        faqs: true,
        socialLinks: true,
        isFeatured: true,
        isClaimed: true,
        verificationStatus: true,
        verifiedAt: true,
        rejectionReason: true,
        metaTitle: true,
        metaDescription: true,
        canonicalUrl: true,
        noIndex: true,
        averageRating: true,
        reviewCount: true,
        viewCount: true,
        favoriteCount: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        owner: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
        location: {
          select: { id: true, nameEn: true, nameLocal: true, type: true },
        },
        logo: mediaSelect,
        thumbnail: mediaSelect,
        gallery: mediaSelect,
      },
    });

    if (!listing) {
      return notFound();
    }

    return NextResponse.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error("Get admin listing error:", error);

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
// PATCH /api/admin/listing/[slug]
// ---------------------------------------------------------------------------
// Two modes:
//  • JSON body           → quick review actions (change status, feature flag).
//  • multipart/form-data → the full add/edit form (with optional images).
// ---------------------------------------------------------------------------

type ListingWithMedia = {
  id: string;
  slug: string;
  title: string;
  verificationStatus: ListingStatus;
  thumbnailId: string | null;
  logoId: string | null;
  thumbnail: { id: string } | null;
  logo: { id: string } | null;
  gallery: { id: string }[];
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;

    const existing = await prisma.listing.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        verificationStatus: true,
        thumbnailId: true,
        logoId: true,
        thumbnail: { select: { id: true } },
        logo: { select: { id: true } },
        gallery: { select: { id: true } },
      },
    });

    if (!existing) {
      return notFound();
    }

    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      return handleFullUpdate(request, existing);
    }

    return handleReviewUpdate(request, existing);
  } catch (error) {
    console.error("Update admin listing error:", error);

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
// PATCH — review actions (status / featured / claimed)
// ---------------------------------------------------------------------------

type ReviewBody = {
  verificationStatus?: string;
  rejectionReason?: string;
  isFeatured?: boolean;
  isClaimed?: boolean;
};

async function handleReviewUpdate(
  request: Request,
  existing: ListingWithMedia,
) {
  const body = (await request.json()) as ReviewBody;

  const targetStatus = (body.verificationStatus ??
    existing.verificationStatus) as string;

  if (!STATUSES.includes(targetStatus)) {
    return badRequest("Invalid status");
  }

  if (
    targetStatus === ListingStatus.REJECTED &&
    (!body.rejectionReason || !body.rejectionReason.trim())
  ) {
    return badRequest("A rejection reason is required");
  }

  const isApproved = targetStatus === ListingStatus.APPROVED;
  const now = new Date();

  const updated = await prisma.listing.update({
    where: { id: existing.id },
    data: {
      verificationStatus: targetStatus as ListingStatus,
      rejectionReason:
        targetStatus === ListingStatus.REJECTED
          ? body.rejectionReason?.trim()
          : null,
      ...(body.isFeatured !== undefined ? { isFeatured: body.isFeatured } : {}),
      ...(body.isClaimed !== undefined ? { isClaimed: body.isClaimed } : {}),
      verifiedAt: isApproved ? now : null,
      publishedAt: isApproved ? now : null,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      verificationStatus: true,
      verifiedAt: true,
      publishedAt: true,
      rejectionReason: true,
      isFeatured: true,
      isClaimed: true,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Listing review updated successfully",
    data: updated,
  });
}

// ---------------------------------------------------------------------------
// PATCH — full add/edit form (multipart)
// ---------------------------------------------------------------------------

async function handleFullUpdate(request: Request, existing: ListingWithMedia) {
  const formData = await request.formData();
  const { values, removals } = parseAdminListingFormData(formData);

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

  const [category, location] = await Promise.all([
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
  ]);

  if (data.categoryId && !category) {
    return badRequest("Selected category does not exist");
  }

  if (data.locationId && !location) {
    return badRequest("Selected location does not exist");
  }

  // Rebuild the slug only when the title actually changed
  const baseSlug =
    data.title.trim().toLowerCase() === existing.title.trim().toLowerCase()
      ? existing.slug
      : slugify(data.title) || existing.slug;

  const existsSlugCheck = (candidate: string) =>
    prisma.listing
      .findFirst({
        where: { slug: candidate, id: { not: existing.id } },
        select: { id: true },
      })
      .then((found) => found !== null);

  const statusRaw = String(formData.get("status") ?? "");
  const status = STATUSES.includes(statusRaw)
    ? (statusRaw as ListingStatus)
    : existing.verificationStatus;

  const isApproved = status === ListingStatus.APPROVED;

  // --- Images -------------------------------------------------------------
  // Upload whatever new files the admin picked, then connect them.
  const newThumbnail = data.cover
    ? await uploadAndCreateMedia(data.cover, data.title)
    : null;
  const newLogo = data.logo
    ? await uploadAndCreateMedia(data.logo, `${data.title} logo`)
    : null;
  const newGallery = await Promise.all(
    (values.gallery ?? []).map((file, index) =>
      uploadAndCreateMedia(file, `${data.title} - Image ${index + 1}`),
    ),
  );

  // Existing images that must be dropped (either replaced or removed)
  const thumbnailToDelete =
    newThumbnail || removals.coverRemoved ? existing.thumbnail : null;
  const logoToDelete = newLogo || removals.logoRemoved ? existing.logo : null;
  const galleryToDelete = existing.gallery.filter((media) =>
    removals.galleryRemoved.some((id) => id === media.id),
  );

  const newSlug = await uniqueSlug(baseSlug, existsSlugCheck);

  const updated = await prisma.listing.update({
    where: { id: existing.id },
    data: {
      title: data.title,
      slug: newSlug,
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
      verifiedAt: isApproved ? new Date() : null,
      publishedAt: isApproved ? new Date() : null,
      category: category ? { connect: { id: category.id } } : undefined,
      location: location ? { connect: { id: location.id } } : undefined,
      logo: newLogo ? { connect: { id: newLogo.id } } : undefined,
      thumbnail: newThumbnail
        ? { connect: { id: newThumbnail.id } }
        : undefined,
      gallery:
        newGallery.length > 0
          ? { connect: newGallery.map((media) => ({ id: media.id })) }
          : undefined,
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true } },
      location: {
        select: { id: true, nameEn: true, nameLocal: true, type: true },
      },
      logo: mediaSelect,
      thumbnail: mediaSelect,
      gallery: mediaSelect,
    },
  });

  // Clean up media rows that are no longer attached to the listing
  const mediaToDelete = [
    thumbnailToDelete?.id,
    logoToDelete?.id,
    ...galleryToDelete.map((media) => media.id),
  ].filter((id): id is string => Boolean(id));

  if (mediaToDelete.length > 0) {
    await prisma.media.deleteMany({
      where: { id: { in: mediaToDelete } },
    });
  }

  return NextResponse.json({
    success: true,
    message: "Listing updated successfully",
    data: updated,
  });
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/listing/[slug]
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;

    const existing = await prisma.listing.findUnique({
      where: { slug },
      select: {
        id: true,
        thumbnailId: true,
        logoId: true,
        gallery: { select: { id: true } },
      },
    });

    if (!existing) {
      return notFound();
    }

    await prisma.listing.delete({ where: { id: existing.id } });

    const mediaIds = [
      existing.thumbnailId,
      existing.logoId,
      ...existing.gallery.map((media) => media.id),
    ].filter((id): id is string => Boolean(id));

    if (mediaIds.length > 0) {
      await prisma.media.deleteMany({
        where: { id: { in: mediaIds } },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin listing error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}

function notFound() {
  return NextResponse.json(
    {
      success: false,
      message: "Listing not found",
    },
    { status: 404 },
  );
}

function badRequest(message: string) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 400 },
  );
}
