import { z } from "zod";

// ----------------------------------------------------------------------------
// Shared enums (kept in sync with the Prisma schema)
// ----------------------------------------------------------------------------

export const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export const FEATURE_TYPES = ["SERVICE", "AMENITY"] as const;

const urlOrEmpty = () =>
  z
    .string()
    .trim()
    .refine((val) => val === "" || /^https?:\/\/.+\..+/.test(val), {
      message: "সঠিক একটি লিংক দিন (https:// দিয়ে শুরু করে)",
    })
    .optional()
    .or(z.literal(""));

const phoneRegex = /^(\+?880|0)1[3-9]\d{8}$/;

// ----------------------------------------------------------------------------
// Step 1 — Basic information
// ----------------------------------------------------------------------------

export const basicsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "প্রতিষ্ঠানের নাম কমপক্ষে ৩ অক্ষরের হতে হবে")
    .max(120, "নাম ১২০ অক্ষরের বেশি হতে পারবে না"),
  tagline: z
    .string()
    .trim()
    .max(100, "ট্যাগলাইন ১০০ অক্ষরের বেশি হতে পারবে না")
    .optional()
    .or(z.literal("")),
  categoryId: z.string().min(1, "একটি ক্যাটাগরি বাছাই করুন"),
  shortDescription: z
    .string()
    .trim()
    .max(500, "সংক্ষিপ্ত বিবরণ ৫০০ অক্ষরের বেশি হতে পারবে না")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .min(50, "বিস্তারিত বিবরণ কমপক্ষে ৫০ অক্ষরের হতে হবে")
    .max(5000, "বিস্তারিত বিবরণ ৫০০০ অক্ষরের বেশি হতে পারবে না"),
});

// ----------------------------------------------------------------------------
// Step 2 — Location & contact
// ----------------------------------------------------------------------------

export const socialLinksSchema = z.object({
  facebook: urlOrEmpty(),
  instagram: urlOrEmpty(),
  youtube: urlOrEmpty(),
  linkedin: urlOrEmpty(),
  tiktok: urlOrEmpty(),
});

export const locationContactSchema = z.object({
  locationId: z.string().min(1, "একটি এলাকা বাছাই করুন"),
  addressLine1: z.string().trim().min(5, "সম্পূর্ণ ঠিকানা লিখুন"),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "সঠিক একটি বাংলাদেশি মোবাইল নম্বর দিন (যেমন 01712345678)"),
  email: z.string().trim().email("সঠিক ইমেইল দিন").optional().or(z.literal("")),
  website: urlOrEmpty(),
  whatsapp: z
    .string()
    .trim()
    .regex(phoneRegex, "সঠিক একটি হোয়াটসঅ্যাপ নম্বর দিন")
    .optional()
    .or(z.literal("")),
  socialLinks: socialLinksSchema,
});

// ----------------------------------------------------------------------------
// Step 3 — Business details & opening hours
// ----------------------------------------------------------------------------

export const openingHourSchema = z
  .object({
    day: z.enum(DAYS_OF_WEEK),
    isClosed: z.boolean(),
    openTime: z.string().optional().or(z.literal("")),
    closeTime: z.string().optional().or(z.literal("")),
  })
  .refine((row) => row.isClosed || (!!row.openTime && !!row.closeTime), {
    message: "খোলা ও বন্ধের সময় দিন, অথবা 'বন্ধ' নির্বাচন করুন",
    path: ["openTime"],
  });

export const businessDetailsSchema = z.object({
  establishedYear: z
    .union([z.number().int().min(1900).max(new Date().getFullYear()), z.nan()])
    .optional(),
  priceRange: z.enum(["$", "$$", "$$$", "$$$$"]).optional().or(z.literal("")),
  areaServed: z.string().trim().max(200).optional().or(z.literal("")),
  openingHours: z.array(openingHourSchema).length(7),
});

// ----------------------------------------------------------------------------
// Step 4 — Features & FAQs
// ----------------------------------------------------------------------------

export const featureSchema = z.object({
  type: z.enum(FEATURE_TYPES),
  name: z.string().trim().min(2, "নাম দিন").max(60),
});

export const faqSchema = z.object({
  question: z.string().trim().min(5, "প্রশ্ন লিখুন").max(200),
  answer: z.string().trim().min(5, "উত্তর লিখুন").max(1000),
});

export const featuresSchema = z.object({
  features: z.array(featureSchema).min(1, "কমপক্ষে একটি সার্ভিস বা সুবিধা যোগ করুন"),
  faqs: z.array(faqSchema),
});

// ----------------------------------------------------------------------------
// Step 5 — Photos
// ----------------------------------------------------------------------------

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const imageFile = (requiredMessage = "একটি ছবি নির্বাচন করুন") =>
  z
    .instanceof(File, { message: requiredMessage })
    .refine(
      (f) => f.size <= MAX_FILE_SIZE_MB * 1024 * 1024,
      `ছবির আকার ${MAX_FILE_SIZE_MB}MB এর কম হতে হবে`,
    )
    .refine(
      (f) => ACCEPTED_TYPES.includes(f.type),
      "শুধু JPG, PNG অথবা WEBP ছবি গ্রহণযোগ্য",
    );

export const photosSchema = z.object({
  logo: imageFile().optional().nullable(),
  cover: imageFile("কভার ছবি আবশ্যক"),
  gallery: z.array(imageFile()).max(8, "সর্বোচ্চ ৮টি ছবি যোগ করা যাবে"),
});

// ----------------------------------------------------------------------------
// Step 6 — Account
// ----------------------------------------------------------------------------

export const accountSchema = z
  .object({
    loginEmail: z.string().trim().email("সঠিক ইমেইল দিন"),
    password: z
      .string()
      .min(8, "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে")
      .regex(/[A-Z]/, "কমপক্ষে একটি বড় হাতের অক্ষর থাকতে হবে")
      .regex(/[a-z]/, "কমপক্ষে একটি ছোট হাতের অক্ষর থাকতে হবে")
      .regex(/[0-9]/, "কমপক্ষে একটি সংখ্যা থাকতে হবে"),
    confirmPassword: z.string(),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: "চালিয়ে যেতে শর্তাবলীতে সম্মত হতে হবে" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "পাসওয়ার্ড মিলছে না",
    path: ["confirmPassword"],
  });

// ----------------------------------------------------------------------------
// Full combined schema
// ----------------------------------------------------------------------------

export const listingFormSchema = basicsSchema
  .and(locationContactSchema)
  .and(businessDetailsSchema)
  .and(featuresSchema)
  .and(photosSchema)
  .and(accountSchema);

export type ListingFormValues = z.infer<typeof listingFormSchema>;

// Field groups used to validate only the current step before advancing
export const STEP_FIELDS: Record<number, (keyof ListingFormValues)[]> = {
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
  5: ["loginEmail", "password", "confirmPassword", "agreeToTerms"],
  6: [],
};

export const DEFAULT_OPENING_HOURS = DAYS_OF_WEEK.map((day) => ({
  day,
  isClosed: day === "FRIDAY",
  openTime: "09:00",
  closeTime: "20:00",
}));

export const defaultListingValues: Partial<ListingFormValues> = {
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
  socialLinks: {
    facebook: "",
    instagram: "",
    youtube: "",
    linkedin: "",
    tiktok: "",
  },
  establishedYear: undefined,
  priceRange: "",
  areaServed: "",
  openingHours: DEFAULT_OPENING_HOURS,
  features: [],
  faqs: [],
  logo: null,
  cover: undefined as unknown as File,
  gallery: [],
  loginEmail: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: undefined as unknown as true,
};
