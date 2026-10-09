import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export interface SiteSettingsData {
  id: string;
  // General & Branding
  siteName: string;
  siteTagline: string | null;
  siteDescription: string | null;
  headerLogo: string | null;
  footerLogo: string | null;
  favicon: string | null;
  copyrightText: string | null;
  currencySymbol: string;
  currencyCode: string;

  // Contact & Social
  contactEmail: string | null;
  contactPhone: string | null;
  helpline: string | null;
  address: string | null;
  workingHours: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  youtubeUrl: string | null;
  whatsappNumber: string | null;

  // SEO & Analytics
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImage: string | null;
  googleSiteVerification: string | null;
  googleAnalyticsId: string | null;
  headerScripts: string | null;
  footerScripts: string | null;

  // Email / SMTP
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPass: string | null;
  smtpSecure: boolean | null;
  mailFromName: string | null;
  mailFromEmail: string | null;

  // Cloudinary / Media
  cloudinaryCloudName: string | null;
  cloudinaryApiKey: string | null;
  cloudinaryApiSecret: string | null;
  cloudinaryFolder: string | null;

  // Map & Directory System
  googleMapsApiKey: string | null;
  mapProvider: string | null;
  defaultLatitude: number | null;
  defaultLongitude: number | null;
  defaultZoom: number | null;
  maintenanceMode: boolean;
  requireListingApproval: boolean;

  customJson?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export const DEFAULT_SETTINGS: SiteSettingsData = {
  id: "default",
  siteName: "Rentsheba",
  siteTagline: "Bangladesh's Trusted Local Business & Service Directory",
  siteDescription:
    "Explore trusted businesses in Dhaka and across Bangladesh. Find restaurants, salons, clinics, schools, and professional services with verified reviews and contact details.",
  headerLogo: null,
  footerLogo: null,
  favicon: null,
  copyrightText: "© {year} Rentsheba Directory. All rights reserved.",
  currencySymbol: "৳",
  currencyCode: "BDT",

  contactEmail: "support@rentsheba.com",
  contactPhone: "+880 1700-000000",
  helpline: "16263",
  address: "Level 4, Gulshan-2, Dhaka-1212, Bangladesh",
  workingHours: "Sunday - Thursday: 9:00 AM - 6:00 PM",
  facebookUrl: "https://facebook.com/rentsheba",
  twitterUrl: "https://twitter.com/rentsheba",
  instagramUrl: "https://instagram.com/rentsheba",
  linkedinUrl: "https://linkedin.com/company/rentsheba",
  youtubeUrl: "https://youtube.com/@rentsheba",
  whatsappNumber: "+8801700000000",

  metaTitle: "Rentsheba — Bangladesh's Trusted Local Business & Service Directory",
  metaDescription:
    "Explore trusted businesses in Dhaka and across Bangladesh. Find restaurants, salons, clinics, schools, and professional services with verified reviews and contact details.",
  metaKeywords:
    "Bangladesh business directory, local businesses Dhaka, restaurants in Dhaka, find businesses Bangladesh, Rentsheba, verified local businesses",
  ogImage: null,
  googleSiteVerification: null,
  googleAnalyticsId: null,
  headerScripts: null,
  footerScripts: null,

  smtpHost: null,
  smtpPort: 587,
  smtpUser: null,
  smtpPass: null,
  smtpSecure: false,
  mailFromName: "Rentsheba Directory",
  mailFromEmail: "noreply@rentsheba.com",

  cloudinaryCloudName: null,
  cloudinaryApiKey: null,
  cloudinaryApiSecret: null,
  cloudinaryFolder: "rentsheba",

  googleMapsApiKey: null,
  mapProvider: "leaflet",
  defaultLatitude: 23.8103,
  defaultLongitude: 90.4125,
  defaultZoom: 13,
  maintenanceMode: false,
  requireListingApproval: false,
  customJson: null,
};

/**
 * Fetch raw settings directly from database or create default record if non-existent.
 */
export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    let settings = await prisma.siteSetting.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.siteSetting.create({
        data: {
          id: "default",
          siteName: DEFAULT_SETTINGS.siteName,
          siteTagline: DEFAULT_SETTINGS.siteTagline,
          siteDescription: DEFAULT_SETTINGS.siteDescription,
          copyrightText: DEFAULT_SETTINGS.copyrightText,
          currencySymbol: DEFAULT_SETTINGS.currencySymbol,
          currencyCode: DEFAULT_SETTINGS.currencyCode,
          contactEmail: DEFAULT_SETTINGS.contactEmail,
          contactPhone: DEFAULT_SETTINGS.contactPhone,
          helpline: DEFAULT_SETTINGS.helpline,
          address: DEFAULT_SETTINGS.address,
          workingHours: DEFAULT_SETTINGS.workingHours,
          facebookUrl: DEFAULT_SETTINGS.facebookUrl,
          twitterUrl: DEFAULT_SETTINGS.twitterUrl,
          instagramUrl: DEFAULT_SETTINGS.instagramUrl,
          linkedinUrl: DEFAULT_SETTINGS.linkedinUrl,
          youtubeUrl: DEFAULT_SETTINGS.youtubeUrl,
          whatsappNumber: DEFAULT_SETTINGS.whatsappNumber,
          metaTitle: DEFAULT_SETTINGS.metaTitle,
          metaDescription: DEFAULT_SETTINGS.metaDescription,
          metaKeywords: DEFAULT_SETTINGS.metaKeywords,
          smtpPort: DEFAULT_SETTINGS.smtpPort,
          smtpSecure: DEFAULT_SETTINGS.smtpSecure,
          mailFromName: DEFAULT_SETTINGS.mailFromName,
          mailFromEmail: DEFAULT_SETTINGS.mailFromEmail,
          cloudinaryFolder: DEFAULT_SETTINGS.cloudinaryFolder,
          mapProvider: DEFAULT_SETTINGS.mapProvider,
          defaultLatitude: DEFAULT_SETTINGS.defaultLatitude,
          defaultLongitude: DEFAULT_SETTINGS.defaultLongitude,
          defaultZoom: DEFAULT_SETTINGS.defaultZoom,
        },
      });
    }

    return {
      ...DEFAULT_SETTINGS,
      ...settings,
    };
  } catch (err) {
    console.error("Failed to load site settings from database, using defaults:", err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Cached getter for high performance across public pages.
 */
export const getCachedSiteSettings = unstable_cache(
  async (): Promise<SiteSettingsData> => {
    return getSiteSettings();
  },
  ["site-settings-global"],
  {
    revalidate: 3600, // 1 hour
    tags: ["site-settings"],
  },
);

/**
 * Returns public-safe settings (strips sensitive credentials like SMTP password, Cloudinary API secret).
 */
export async function getPublicSiteSettings() {
  const settings = await getCachedSiteSettings();
  const {
    smtpPass,
    cloudinaryApiSecret,
    ...publicSettings
  } = settings;

  return publicSettings;
}
