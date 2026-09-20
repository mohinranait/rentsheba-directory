import type {
  AdminListingDetail,
  AdminMedia,
} from "@/app/api/admin/listing/[slug]/route";
import { prisma } from "@/lib/prisma";
import { adminListingFormSchema } from "@/lib/schemas/admin-listing-schema";
import { slugify, uniqueSlug } from "@/lib/slug";
import { parseAdminListingFormData } from "@/utils/admin-listing-form";
import { uploadAndCreateMedia } from "@/utils/upload-media";
import type { Prisma } from "../../generated/prisma/client";
import { ListingStatus } from "../../generated/prisma/enums";

// ---------------------------------------------------------------------------
// Owner listing service
// ---------------------------------------------------------------------------
// Server-side helpers for a signed-in user to read, update and delete their
// OWN listings. Keeping this logic outside the route handler makes the API
// file readable and lets the edit page reuse the exact same data rules.
// ---------------------------------------------------------------------------

const mediaSelect = {
  select: { id: true, url: true, secure_url: true, public_id: true, alt: true },
} as const;

// Every editable field, shaped like AdminListingDetail so the shared
// admin wizard helpers (buildEditValues / getExistingMedia) work unchanged.
const detailSelect = {
  id: true,
  title: true,
  slug: true,
  ownerId: true,
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
} as const satisfies Prisma.ListingSelect;

type OwnerDetailRow = Prisma.ListingGetPayload<{
  select: typeof detailSelect;
}>;

export type OwnerListingFailure = {
  ok: false;
  status: number;
  message: string;
  errors?: unknown;
};

export type OwnerListingResult<T> = { ok: true; data: T } | OwnerListingFailure;

// Prisma returns Date / JsonDB objects — normalise dates to ISO strings so the
// result can be rendered as a client-component prop after an RSC round trip.
function toAdminDetail(row: OwnerDetailRow): AdminListingDetail {
  const {
    ownerId: _ownerId,
    createdAt,
    updatedAt,
    publishedAt,
    verifiedAt,
    ...rest
  } = row;

  return {
    ...rest,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    publishedAt: publishedAt?.toISOString() ?? null,
    verifiedAt: verifiedAt?.toISOString() ?? null,
  };
}

// ---------------------------------------------------------------------------
// GET — the full detail of one of the user's own listings, or null when the
// listing does not exist / is not owned by `userId`.
// ---------------------------------------------------------------------------

export async function getOwnedListing(
  slug: string,
  userId: string,
): Promise<AdminListingDetail | null> {
  const listing = await prisma.listing.findUnique({
    where: { slug },
    select: detailSelect,
  });

  if (!listing || listing.ownerId !== userId) return null;

  return toAdminDetail(listing);
}

// ---------------------------------------------------------------------------
// PATCH — update one of the user's own listings (multipart form body). New
// images are uploaded, dropped images are cleaned up, and only safe fields are
// written by the owner.
// ---------------------------------------------------------------------------

type ExistingListing = {
  id: string;
  slug: string;
  title: string;
  ownerId: string;
  verificationStatus: ListingStatus;
  thumbnailId: string | null;
  logoId: string | null;
  thumbnail: { id: string } | null;
  logo: { id: string } | null;
  gallery: { id: string }[];
};

export async function updateOwnedListing(input: {
  slug: string;
  userId: string;
  formData: FormData;
}): Promise<
  OwnerListingResult<{
    id: string;
    slug: string;
    title: string;
    verificationStatus: ListingStatus;
  }>
> {
  const existing = await prisma.listing.findUnique({
    where: { slug: input.slug },
    select: {
      id: true,
      slug: true,
      title: true,
      ownerId: true,
      verificationStatus: true,
      thumbnailId: true,
      logoId: true,
      thumbnail: { select: { id: true } },
      logo: { select: { id: true } },
      gallery: { select: { id: true } },
    },
  });

  if (!existing) {
    return { ok: false, status: 404, message: "Listing not found" };
  }

  if (existing.ownerId !== input.userId) {
    return {
      ok: false,
      status: 403,
      message: "You can only update your own listings",
    };
  }

  return applyListingUpdate(existing, input.formData);
}

// Shared update logic (also easy to reuse for an admin endpoint later).
async function applyListingUpdate(
  existing: ExistingListing,
  formData: FormData,
): Promise<
  OwnerListingResult<{
    id: string;
    slug: string;
    title: string;
    verificationStatus: ListingStatus;
  }>
> {
  const { values, removals } = parseAdminListingFormData(formData);

  const parsed = adminListingFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  // Referenced dropdowns must still exist in the database
  const [category, location] = await Promise.all([
    data.categoryId
      ? prisma.category.findUnique({ where: { id: data.categoryId } })
      : Promise.resolve(null),
    data.locationId
      ? prisma.location.findUnique({ where: { id: data.locationId } })
      : Promise.resolve(null),
  ]);

  if (data.categoryId && !category) {
    return {
      ok: false,
      status: 400,
      message: "Selected category no longer exists",
    };
  }

  if (data.locationId && !location) {
    return {
      ok: false,
      status: 400,
      message: "Selected location no longer exists",
    };
  }

  // Rebuild the slug only when the title actually changed
  const titleChanged =
    data.title.trim().toLowerCase() !== existing.title.trim().toLowerCase();
  const baseSlug = titleChanged
    ? slugify(data.title) || existing.slug
    : existing.slug;

  const isSlugTaken = (candidate: string) =>
    prisma.listing
      .findFirst({
        where: { slug: candidate, id: { not: existing.id } },
        select: { id: true },
      })
      .then((found) => found !== null);

  // Rejected / draft listings go back into the review queue so the owner can
  // resubmit; everything else keeps its current status (live edits stay live).
  const targetStatus =
    existing.verificationStatus === ListingStatus.REJECTED ||
    existing.verificationStatus === ListingStatus.DRAFT
      ? ListingStatus.PENDING
      : existing.verificationStatus;

  const isApproved = targetStatus === ListingStatus.APPROVED;

  // --- Images ---------------------------------------------------------------
  const newThumbnail = data.cover
    ? await uploadAndCreateMedia(data.cover, data.title)
    : null;
  const newLogo = data.logo
    ? await uploadAndCreateMedia(data.logo, `${data.title} logo`)
    : null;
  const newGallery = await Promise.all(
    (data.gallery ?? []).map((file, index) =>
      uploadAndCreateMedia(file, `${data.title} - Image ${index + 1}`),
    ),
  );

  // Existing images that must be dropped (either replaced or removed)
  const thumbnailToDelete =
    newThumbnail || removals.coverRemoved ? existing.thumbnail : null;
  const logoToDelete = newLogo || removals.logoRemoved ? existing.logo : null;
  const galleryToDelete = existing.gallery.filter((media) =>
    removals.galleryRemoved.includes(media.id),
  );

  const newSlug = await uniqueSlug(baseSlug, isSlugTaken);

  const updated = await prisma.listing.update({
    where: { id: existing.id },
    data: {
      title: data.title,
      slug: newSlug,
      tagline: data.tagline ?? null,
      shortDescription: data.shortDescription ?? null,
      description: data.description,
      phone: data.phone ?? null,
      email: data.email ?? null,
      website: data.website ?? null,
      whatsapp: data.whatsapp ?? null,
      addressLine1: data.addressLine1,
      establishedYear: data.establishedYear ?? null,
      priceRange: data.priceRange || null,
      areaServed: data.areaServed || null,
      socialLinks: data.socialLinks,
      openingHours: data.openingHours,
      features: data.features,
      faqs: data.faqs,
      verificationStatus: targetStatus,
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
    select: {
      id: true,
      slug: true,
      title: true,
      verificationStatus: true,
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

  return { ok: true, data: updated };
}

// ---------------------------------------------------------------------------
// DELETE — remove one of the user's own listings and its attached images.
// ---------------------------------------------------------------------------

export async function deleteOwnedListing(input: {
  slug: string;
  userId: string;
}): Promise<OwnerListingResult<{ id: string }>> {
  const existing = await prisma.listing.findUnique({
    where: { slug: input.slug },
    select: {
      id: true,
      ownerId: true,
      thumbnailId: true,
      logoId: true,
      gallery: { select: { id: true } },
    },
  });

  if (!existing) {
    return { ok: false, status: 404, message: "Listing not found" };
  }

  if (existing.ownerId !== input.userId) {
    return {
      ok: false,
      status: 403,
      message: "You can only delete your own listings",
    };
  }

  await prisma.listing.delete({ where: { id: existing.id } });

  const mediaIds = [
    existing.thumbnailId,
    existing.logoId,
    ...existing.gallery.map((media) => media.id),
  ].filter((id): id is string => Boolean(id));

  if (mediaIds.length > 0) {
    await prisma.media.deleteMany({ where: { id: { in: mediaIds } } });
  }

  return { ok: true, data: { id: existing.id } };
}

// Re-export so client code can type the media objects handed to the UI
export type OwnerListingMedia = AdminMedia;
