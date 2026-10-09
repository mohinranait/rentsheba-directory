import { z } from "zod";

const urlOrEmpty = z
  .string()
  .trim()
  .refine((val) => !val || /^https?:\/\//i.test(val), {
    message: "Must be a valid URL starting with http:// or https://",
  })
  .optional()
  .nullable();

const emailOrEmpty = z
  .string()
  .trim()
  .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: "Must be a valid email address",
  })
  .optional()
  .nullable();

export const siteSettingsSchema = z.object({
  // General & Branding
  siteName: z.string().trim().min(1, "Site name is required").max(100),
  siteTagline: z.string().trim().max(250).optional().nullable(),
  siteDescription: z.string().trim().max(1000).optional().nullable(),
  headerLogo: urlOrEmpty,
  footerLogo: urlOrEmpty,
  favicon: urlOrEmpty,
  copyrightText: z.string().trim().max(250).optional().nullable(),
  currencySymbol: z.string().trim().max(10).default("৳"),
  currencyCode: z.string().trim().max(10).default("BDT"),

  // Contact & Social
  contactEmail: emailOrEmpty,
  contactPhone: z.string().trim().max(50).optional().nullable(),
  helpline: z.string().trim().max(50).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  workingHours: z.string().trim().max(150).optional().nullable(),
  facebookUrl: urlOrEmpty,
  twitterUrl: urlOrEmpty,
  instagramUrl: urlOrEmpty,
  linkedinUrl: urlOrEmpty,
  youtubeUrl: urlOrEmpty,
  whatsappNumber: z.string().trim().max(50).optional().nullable(),

  // SEO & Analytics
  metaTitle: z.string().trim().max(150).optional().nullable(),
  metaDescription: z.string().trim().max(500).optional().nullable(),
  metaKeywords: z.string().trim().max(500).optional().nullable(),
  ogImage: urlOrEmpty,
  googleSiteVerification: z.string().trim().max(200).optional().nullable(),
  googleAnalyticsId: z.string().trim().max(100).optional().nullable(),
  headerScripts: z.string().trim().max(5000).optional().nullable(),
  footerScripts: z.string().trim().max(5000).optional().nullable(),

  // Email / SMTP
  smtpHost: z.string().trim().max(200).optional().nullable(),
  smtpPort: z.coerce.number().int().min(1).max(65535).optional().nullable(),
  smtpUser: z.string().trim().max(200).optional().nullable(),
  smtpPass: z.string().trim().max(200).optional().nullable(),
  smtpSecure: z.boolean().default(false).optional(),
  mailFromName: z.string().trim().max(100).optional().nullable(),
  mailFromEmail: emailOrEmpty,

  // Cloudinary / Media
  cloudinaryCloudName: z.string().trim().max(100).optional().nullable(),
  cloudinaryApiKey: z.string().trim().max(100).optional().nullable(),
  cloudinaryApiSecret: z.string().trim().max(200).optional().nullable(),
  cloudinaryFolder: z.string().trim().max(100).optional().nullable(),

  // Map & Directory System
  googleMapsApiKey: z.string().trim().max(200).optional().nullable(),
  mapProvider: z.string().trim().default("leaflet"),
  defaultLatitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  defaultLongitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  defaultZoom: z.coerce.number().int().min(1).max(20).optional().nullable(),
  maintenanceMode: z.boolean().default(false).optional(),
  requireListingApproval: z.boolean().default(false).optional(),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
