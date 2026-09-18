import {
  type AdminListingFormValues,
  defaultAdminSocialLinks,
} from "@/lib/schemas/admin-listing-schema";
import { DEFAULT_OPENING_HOURS } from "@/lib/schemas/listing-schema";

export type AdminListingRemovals = {
  coverRemoved: boolean;
  logoRemoved: boolean;
  galleryRemoved: string[];
};

export type ParsedAdminListingForm = {
  values: AdminListingFormValues;
  removals: AdminListingRemovals;
};

function asString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function asJSON<T>(formData: FormData, key: string): T | undefined {
  const raw = formData.get(key);

  if (!raw) return undefined;

  try {
    return JSON.parse(String(raw)) as T;
  } catch {
    return undefined;
  }
}

function asFile(formData: FormData, key: string): File | null {
  const raw = formData.get(key);
  return raw instanceof File ? raw : null;
}

// ---------------------------------------------------------------------------
// Converts the multipart body of the admin add/edit form back into the shape
// the zod schema expects, plus the "remove the existing image" flags that are
// only meaningful when editing a listing that already has images.
// ---------------------------------------------------------------------------
export function parseAdminListingFormData(
  formData: FormData,
): ParsedAdminListingForm {
  const establishedYear = asString(formData, "establishedYear");

  const values: AdminListingFormValues = {
    // Step 1 — Basic information
    title: asString(formData, "title"),
    tagline: asString(formData, "tagline"),
    categoryId: asString(formData, "categoryId"),
    shortDescription: asString(formData, "shortDescription"),
    description: asString(formData, "description"),

    // Step 2 — Location & contact
    locationId: asString(formData, "locationId"),
    addressLine1: asString(formData, "addressLine1"),
    phone: asString(formData, "phone"),
    email: asString(formData, "email"),
    website: asString(formData, "website"),
    whatsapp: asString(formData, "whatsapp"),
    socialLinks: asJSON(formData, "socialLinks") ?? defaultAdminSocialLinks,

    // Step 3 — Business details
    establishedYear: establishedYear ? Number(establishedYear) : undefined,
    priceRange: (asString(formData, "priceRange") ||
      undefined) as AdminListingFormValues["priceRange"],
    areaServed: asString(formData, "areaServed"),
    openingHours: asJSON(formData, "openingHours") ?? DEFAULT_OPENING_HOURS,
    features: asJSON(formData, "features") ?? [],
    faqs: asJSON(formData, "faqs") ?? [],

    // Step 5 — Photos (optional; admin may keep the existing images on edit)
    logo: asFile(formData, "logo"),
    cover: asFile(formData, "cover"),
    gallery: Array.from(formData.getAll("gallery")).filter(
      (entry): entry is File => entry instanceof File,
    ),
  };

  const removals: AdminListingRemovals = {
    coverRemoved: asString(formData, "coverRemoved") === "true",
    logoRemoved: asString(formData, "logoRemoved") === "true",
    galleryRemoved: asJSON<string[]>(formData, "galleryRemoved") ?? [],
  };

  return { values, removals };
}
