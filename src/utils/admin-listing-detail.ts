import type {
  AdminListingDetail,
  AdminMedia,
} from "@/app/api/admin/listing/[slug]/route";
import {
  type AdminListingFormValues,
  defaultAdminSocialLinks,
} from "@/lib/schemas/admin-listing-schema";
import { DEFAULT_OPENING_HOURS } from "@/lib/schemas/listing-schema";

export type ExistingListingMedia = {
  logo: AdminMedia | null;
  thumbnail: AdminMedia | null;
  gallery: AdminMedia[];
};

export function getExistingMedia(
  detail: AdminListingDetail,
): ExistingListingMedia {
  return {
    logo: detail.logo,
    thumbnail: detail.thumbnail,
    gallery: detail.gallery,
  };
}

// Converts the API detail payload back into form-shaped values so the admin
// can edit an existing listing. JSONB columns need a small reshape, and the
// file fields are always reset (server-side images are tracked separately).
export function buildEditValues(
  detail: AdminListingDetail,
): AdminListingFormValues {
  const rawSocial = (detail.socialLinks ?? {}) as Record<
    string,
    string | null | undefined
  >;

  const socialLinks = { ...defaultAdminSocialLinks };
  for (const key of Object.keys(socialLinks) as (keyof typeof socialLinks)[]) {
    const value = rawSocial[key];
    socialLinks[key] = typeof value === "string" ? value : "";
  }

  const openingHours =
    Array.isArray(detail.openingHours) && detail.openingHours.length === 7
      ? (detail.openingHours as AdminListingFormValues["openingHours"])
      : DEFAULT_OPENING_HOURS;

  const features = Array.isArray(detail.features)
    ? (detail.features as AdminListingFormValues["features"])
    : [];

  const faqs = Array.isArray(detail.faqs)
    ? (detail.faqs as AdminListingFormValues["faqs"])
    : [];

  return {
    title: detail.title,
    tagline: detail.tagline ?? "",
    categoryId: detail.category?.id ?? "",
    shortDescription: detail.shortDescription ?? "",
    description: detail.description,
    locationId: detail.location?.id ?? "",
    addressLine1: detail.addressLine1 ?? "",
    phone: detail.phone ?? "",
    email: detail.email ?? "",
    website: detail.website ?? "",
    whatsapp: detail.whatsapp ?? "",
    socialLinks,
    establishedYear: detail.establishedYear ?? undefined,
    priceRange: (detail.priceRange ??
      "") as AdminListingFormValues["priceRange"],
    areaServed: detail.areaServed ?? "",
    openingHours,
    features,
    faqs,
    logo: null,
    cover: undefined,
    gallery: undefined,
  };
}
