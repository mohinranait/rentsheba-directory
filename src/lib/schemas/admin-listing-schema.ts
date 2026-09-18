import { z } from "zod";
import {
  DAYS_OF_WEEK,
  DEFAULT_OPENING_HOURS,
  FEATURE_TYPES,
} from "./listing-schema";

// ----------------------------------------------------------------------------
// Admin add / edit schema
// ----------------------------------------------------------------------------
// Same rules as the public listing form but WITHOUT the account step and with
// English validation messages so the admin panel stays consistent. Photos are
// optional because when editing an existing listing the images may already be
// on the server — a new file is only required on create.
// ----------------------------------------------------------------------------

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const urlOrEmpty = () =>
  z
    .string()
    .trim()
    .refine((val) => val === "" || /^https?:\/\/.+\..+/.test(val), {
      message: "Enter a valid URL starting with https://",
    })
    .optional()
    .or(z.literal(""));

const phoneRegex = /^(\+?880|0)1[3-9]\d{8}$/;

// ----------------------------------------------------------------------------
// Step 1 — Basic information
// ----------------------------------------------------------------------------

export const adminBasicsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be 120 characters or fewer"),
  tagline: z
    .string()
    .trim()
    .max(100, "Tagline must be 100 characters or fewer")
    .optional()
    .or(z.literal("")),
  categoryId: z.string().min(1, "Choose a category"),
  shortDescription: z
    .string()
    .trim()
    .max(500, "Short description must be 500 characters or fewer")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description must be 5000 characters or fewer"),
});

// ----------------------------------------------------------------------------
// Step 2 — Location & contact
// ----------------------------------------------------------------------------

export const adminSocialLinksSchema = z.object({
  facebook: urlOrEmpty(),
  instagram: urlOrEmpty(),
  youtube: urlOrEmpty(),
  linkedin: urlOrEmpty(),
  tiktok: urlOrEmpty(),
});

export const adminLocationContactSchema = z.object({
  locationId: z.string().min(1, "Choose a location"),
  addressLine1: z.string().trim().min(5, "Enter the full address"),
  phone: z
    .string()
    .trim()
    .regex(
      phoneRegex,
      "Enter a valid Bangladesh mobile number (e.g. 01712345678)",
    ),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  website: urlOrEmpty(),
  whatsapp: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid WhatsApp number")
    .optional()
    .or(z.literal("")),
  socialLinks: adminSocialLinksSchema,
});

// ----------------------------------------------------------------------------
// Step 3 — Business details & opening hours
// ----------------------------------------------------------------------------

const adminOpeningHourSchema = z
  .object({
    day: z.enum(DAYS_OF_WEEK),
    isClosed: z.boolean(),
    openTime: z.string().optional().or(z.literal("")),
    closeTime: z.string().optional().or(z.literal("")),
  })
  .refine((row) => row.isClosed || (!!row.openTime && !!row.closeTime), {
    message: "Enter opening and closing times, or mark the day as closed",
    path: ["openTime"],
  });

export const adminBusinessDetailsSchema = z.object({
  establishedYear: z
    .union([z.number().int().min(1900).max(new Date().getFullYear()), z.nan()])
    .optional(),
  priceRange: z.enum(["$", "$$", "$$$", "$$$$"]).optional().or(z.literal("")),
  areaServed: z.string().trim().max(200).optional().or(z.literal("")),
  openingHours: z.array(adminOpeningHourSchema).length(7),
});

// ----------------------------------------------------------------------------
// Step 4 — Features & FAQs
// ----------------------------------------------------------------------------

export const adminFeaturesSchema = z.object({
  features: z
    .array(
      z.object({
        type: z.enum(FEATURE_TYPES),
        name: z.string().trim().min(2, "Enter a name").max(60),
      }),
    )
    .min(1, "Add at least one service or amenity"),
  faqs: z.array(
    z.object({
      question: z.string().trim().min(5, "Enter a question").max(200),
      answer: z.string().trim().min(5, "Enter an answer").max(1000),
    }),
  ),
});

// ----------------------------------------------------------------------------
// Step 5 — Photos (optional on edit, required on create)
// ----------------------------------------------------------------------------

const adminImageFile = (requiredMessage = "Choose an image") =>
  z
    .instanceof(File, { message: requiredMessage })
    .refine(
      (f) => f.size <= MAX_FILE_SIZE_MB * 1024 * 1024,
      `Image must be smaller than ${MAX_FILE_SIZE_MB}MB`,
    )
    .refine(
      (f) => ACCEPTED_TYPES.includes(f.type as (typeof ACCEPTED_TYPES)[number]),
      "Only JPG, PNG or WEBP images are accepted",
    );

export const adminPhotosSchema = z.object({
  logo: adminImageFile().optional().nullable(),
  cover: adminImageFile().optional().nullable(),
  gallery: z
    .array(adminImageFile())
    .max(8, "You can add up to 8 images")
    .optional(),
});

// ----------------------------------------------------------------------------
// Full combined schema
// ----------------------------------------------------------------------------

export const adminListingFormSchema = adminBasicsSchema
  .and(adminLocationContactSchema)
  .and(adminBusinessDetailsSchema)
  .and(adminFeaturesSchema)
  .and(adminPhotosSchema);

export type AdminListingFormValues = z.infer<typeof adminListingFormSchema>;

// Field groups used to validate only the current admin step before advancing
export const ADMIN_STEP_FIELDS: Record<
  number,
  (keyof AdminListingFormValues)[]
> = {
  0: ["title", "tagline", "categoryId", "shortDescription", "description"],
  1: [
    "locationId",
    "addressLine1",
    "phone",
    "email",
    "website",
    "whatsapp",
    "socialLinks",
  ],
  2: ["establishedYear", "priceRange", "areaServed", "openingHours"],
  3: ["features", "faqs"],
  4: ["logo", "cover", "gallery"],
  5: [],
};

export const defaultAdminSocialLinks = {
  facebook: "",
  instagram: "",
  youtube: "",
  linkedin: "",
  tiktok: "",
};

export const defaultAdminListingValues: AdminListingFormValues = {
  title: "",
  tagline: "",
  categoryId: "",
  shortDescription: "",
  description: "",
  locationId: "",
  addressLine1: "",
  phone: "",
  email: "",
  website: "",
  whatsapp: "",
  socialLinks: defaultAdminSocialLinks,
  establishedYear: undefined,
  priceRange: "",
  areaServed: "",
  openingHours: DEFAULT_OPENING_HOURS,
  features: [],
  faqs: [],
  logo: null,
  cover: undefined,
  gallery: undefined,
};
