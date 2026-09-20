import type {
  ListingGetPayload,
  ListingSelect,
  MediaSelect,
} from "../../generated/prisma/models";

// ---------------------------------------------------------------------------
// Shared public listing detail helpers. Used by the public listing API route
// and the listing detail page so both stay in sync.
// ---------------------------------------------------------------------------

export const MEDIA_SELECT = {
  id: true,
  url: true,
  secure_url: true,
  public_id: true,
  alt: true,
} satisfies MediaSelect;

export const PUBLIC_LISTING_DETAIL_SELECT = {
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
  latitude: true,
  longitude: true,
  establishedYear: true,
  priceRange: true,
  areaServed: true,
  openingHours: true,
  features: true,
  faqs: true,
  socialLinks: true,
  isFeatured: true,
  isClaimed: true,
  averageRating: true,
  reviewCount: true,
  viewCount: true,
  favoriteCount: true,
  updatedAt: true,
  publishedAt: true,
  canonicalUrl: true,
  category: { select: { id: true, name: true, slug: true } },
  location: {
    select: {
      id: true,
      nameEn: true,
      nameLocal: true,
      slug: true,
      type: true,
      parent: {
        select: { id: true, nameEn: true, nameLocal: true, type: true },
      },
    },
  },
  logo: { select: MEDIA_SELECT },
  thumbnail: { select: MEDIA_SELECT },
  gallery: { select: MEDIA_SELECT },
} satisfies ListingSelect;

export const RELATED_LISTING_SELECT = {
  id: true,
  title: true,
  slug: true,
  tagline: true,
  shortDescription: true,
  priceRange: true,
  isFeatured: true,
  isClaimed: true,
  averageRating: true,
  reviewCount: true,
  viewCount: true,
  favoriteCount: true,
  publishedAt: true,
  thumbnail: { select: { secure_url: true, alt: true } },
  category: { select: { name: true, slug: true } },
  location: { select: { nameEn: true, nameLocal: true, type: true } },
} satisfies ListingSelect;

type ListingDetailRow = ListingGetPayload<{
  select: typeof PUBLIC_LISTING_DETAIL_SELECT;
}>;

type RelatedListingRow = ListingGetPayload<{
  select: typeof RELATED_LISTING_SELECT;
}>;

export type OpeningHoursRow = {
  day?: string;
  isClosed?: boolean;
  openTime?: string;
  closeTime?: string;
};

export type FeatureItem = { type?: string; name?: string };

export type FaqItem = { question?: string; answer?: string };

export type SocialLinks = {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  tiktok?: string;
};

export type PublicMedia = {
  id: string;
  url: string;
  secure_url: string;
  public_id: string;
  alt: string | null;
};

export type PublicListingLocation = {
  id: string;
  nameEn: string;
  nameLocal: string;
  slug: string;
  type: string;
  parent: {
    id: string;
    nameEn: string;
    nameLocal: string;
    type: string;
  } | null;
};

export type PublicListingDetail = {
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
  latitude: number | null;
  longitude: number | null;
  establishedYear: number | null;
  priceRange: string | null;
  areaServed: string | null;
  openingHours: OpeningHoursRow[] | null;
  features: FeatureItem[] | null;
  faqs: FaqItem[] | null;
  socialLinks: SocialLinks | null;
  isFeatured: boolean;
  isClaimed: boolean;
  averageRating: number;
  reviewCount: number;
  viewCount: number;
  favoriteCount: number;
  updatedAt: string;
  publishedAt: string | null;
  canonicalUrl: string | null;
  category: { id: string; name: string; slug: string } | null;
  location: PublicListingLocation | null;
  logo: PublicMedia | null;
  thumbnail: PublicMedia | null;
  gallery: PublicMedia[];
};

export type RelatedListingItem = {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  shortDescription: string | null;
  priceRange: string | null;
  isFeatured: boolean;
  isClaimed: boolean;
  averageRating: number;
  reviewCount: number;
  viewCount: number;
  favoriteCount: number;
  publishedAt: string | null;
  thumbnail: { secure_url: string; alt: string | null } | null;
  category: { name: string; slug: string } | null;
  location: { nameEn: string; nameLocal: string; type: string } | null;
};

export function toPublicListingDetail(
  row: ListingDetailRow,
): PublicListingDetail {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    tagline: row.tagline,
    shortDescription: row.shortDescription,
    description: row.description,
    phone: row.phone,
    email: row.email,
    website: row.website,
    whatsapp: row.whatsapp,
    addressLine1: row.addressLine1,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    establishedYear: row.establishedYear,
    priceRange: row.priceRange,
    areaServed: row.areaServed,
    openingHours: (row.openingHours as OpeningHoursRow[] | null) ?? null,
    features: (row.features as FeatureItem[] | null) ?? null,
    faqs: (row.faqs as FaqItem[] | null) ?? null,
    socialLinks: (row.socialLinks as SocialLinks | null) ?? null,
    isFeatured: row.isFeatured,
    isClaimed: row.isClaimed,
    averageRating: row.averageRating,
    reviewCount: row.reviewCount,
    viewCount: row.viewCount,
    favoriteCount: row.favoriteCount,
    updatedAt: new Date(row.updatedAt).toISOString(),
    publishedAt: row.publishedAt
      ? new Date(row.publishedAt).toISOString()
      : null,
    canonicalUrl: row.canonicalUrl,
    category: row.category ?? null,
    location: row.location
      ? { ...row.location, parent: row.location.parent ?? null }
      : null,
    logo: row.logo ?? null,
    thumbnail: row.thumbnail ?? null,
    gallery: row.gallery ?? [],
  };
}

export function toRelatedListingItem(
  row: RelatedListingRow,
): RelatedListingItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    tagline: row.tagline,
    shortDescription: row.shortDescription,
    priceRange: row.priceRange,
    isFeatured: row.isFeatured,
    isClaimed: row.isClaimed,
    averageRating: row.averageRating,
    reviewCount: row.reviewCount,
    viewCount: row.viewCount,
    favoriteCount: row.favoriteCount,
    publishedAt: row.publishedAt
      ? new Date(row.publishedAt).toISOString()
      : null,
    thumbnail: row.thumbnail ?? null,
    category: row.category ?? null,
    location: row.location ?? null,
  };
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

export const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export const DAY_LABEL: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

// "Dhanmondi, Dhaka" style, derived from the listing location chain.
export function locationDisplay(
  location: PublicListingLocation | null,
): string {
  if (!location) return "";
  const parts = [location.nameLocal || location.nameEn];
  const parent = location.parent;
  if (parent) parts.push(parent.nameLocal || parent.nameEn);
  return parts.join(", ");
}

// "11:00 AM" from "11:00". Falls back to the raw value.
export function formatTime24to12(time?: string): string {
  if (!time) return "";
  const match = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!match) return time;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}
