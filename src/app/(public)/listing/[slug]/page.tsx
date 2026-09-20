/* biome-ignore-all lint/security/noDangerouslySetInnerHtml: safely escaped JSON-LD output */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import config from "@/lib/config";
import { prisma } from "@/lib/prisma";
import {
  locationDisplay,
  PUBLIC_LISTING_DETAIL_SELECT,
  type PublicListingDetail,
  RELATED_LISTING_SELECT,
  toPublicListingDetail,
  toRelatedListingItem,
} from "@/lib/public-listing";
import { ListingStatus } from "../../../../../generated/prisma/enums";

import ListingDetails from "./components/ListingDetails";

const base = (config.app_url ?? "http://localhost:3000").replace(/\/+$/, "");
const siteName = "directory.";

// Serialize JSON-LD safely for embedding in a <script> tag: the data comes
// from the database, so escape characters that could break out of the tag.
const serializeLd = (data: unknown) =>
  JSON.stringify(data)
    .replace(/</g, "\u003c")
    .replace(/>/g, "\u003e")
    .replace(/&/g, "\u0026")
    .replace(/\u2028/g, "\u2028")
    .replace(/\u2029/g, "\u2029");

// Static generation on-demand (ISR): every listing is pre-rendered at build
// time and revalidated once an hour. New/updated listings are served fresh
// after the revalidation window with zero cold-start cost.
export const revalidate = 3600;
export const dynamicParams = true;

// Map the listing category to the most accurate schema.org type (fallback:
// LocalBusiness). Keeps every listing eligible for rich results.
const SCHEMA_TYPE_RULES: Array<[RegExp, string]> = [
  [/restaurant|cafe|café|food|bake|coffee|diner|kitchen|grill/i, "Restaurant"],
  [/salon|beauty|spa|nail|barber|parlour|tanning/i, "BeautySalon"],
  [
    /clinic|doctor|dental|hospital|physio|medical|pharmacy|diagnostic/i,
    "MedicalClinic",
  ],
  [/hotel|resort|lodge|hostel|inn|guest/i, "LodgingBusiness"],
  [/gym|fitness|yoga|wellness/i, "HealthClub"],
  [
    /school|tuition|academy|college|university|training|institute|coaching/i,
    "EducationalOrganization",
  ],
  [/store|shop|retail|mart|market|supermarket/i, "Store"],
  [/software|tech|developer|agency|studio/i, "ProfessionalService"],
  [/law|legal|lawyer/i, "LegalService"],
  [/bank|finance|insurance|account|financial/i, "FinancialService"],
  [/real\s?estate|property|housing|agent/i, "RealEstateAgent"],
  [/auto|car|garage|vehicle|motor|workshop/i, "AutoRepair"],
  [/tour|travel|ticket|booking|airline/i, "TravelAgency"],
  [/transport|logistics|courier|delivery/i, "MovingCompany"],
];

function schemaBusinessType(categoryName: string | null | undefined): string {
  if (categoryName) {
    for (const [rule, type] of SCHEMA_TYPE_RULES) {
      if (rule.test(categoryName)) return type;
    }
  }
  return "LocalBusiness";
}

function listingLocationNames(listing: {
  location?: {
    nameEn?: string | null;
    nameLocal?: string | null;
    parent?: { nameEn?: string | null; nameLocal?: string | null } | null;
  } | null;
}): string {
  const parts = [
    listing.location?.nameLocal,
    listing.location?.nameEn,
    listing.location?.parent?.nameLocal,
    listing.location?.parent?.nameEn,
  ].filter((part): part is string => Boolean(part));
  return parts.join(", ");
}

export async function generateStaticParams() {
  const listings = await prisma.listing.findMany({
    where: { verificationStatus: ListingStatus.APPROVED },
    select: { slug: true },
  });

  return listings.map((listing) => ({ slug: listing.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const listing = await prisma.listing.findFirst({
    where: { slug, verificationStatus: ListingStatus.APPROVED },
    select: {
      title: true,
      slug: true,
      tagline: true,
      shortDescription: true,
      description: true,
      metaTitle: true,
      metaDescription: true,
      canonicalUrl: true,
      noIndex: true,
      category: { select: { name: true } },
      location: {
        select: {
          nameEn: true,
          nameLocal: true,
          parent: { select: { nameEn: true, nameLocal: true } },
        },
      },
      thumbnail: { select: { secure_url: true, alt: true } },
    },
  });

  if (!listing) return {};

  const url = `${base}/listing/${listing.slug}`;
  const canonical = listing.canonicalUrl || url;

  const category = listing.category?.name;
  const location = listingLocationNames(listing);
  const locationQuery = location ? ` in ${location}` : "";
  const place = category ? `${category}${locationQuery}` : location;

  const title =
    listing.metaTitle ||
    [listing.title, place && `— ${place}`, `${siteName}`]
      .filter(Boolean)
      .join(" | ");

  const description =
    listing.metaDescription ||
    listing.shortDescription ||
    (listing.description
      ? `${listing.description.slice(0, 150).trim()}…`
      : "") ||
    listing.tagline ||
    "";

  const keywords = [
    listing.title,
    category,
    location,
    ...listing.title.split(/\s+/).filter((word) => word.length > 2),
    `${category ?? "business"} in Bangladesh`,
    "Bangladesh business directory",
  ].filter(Boolean);

  const images = listing.thumbnail?.secure_url
    ? [
      {
        url: listing.thumbnail.secure_url,
        alt: listing.thumbnail.alt ?? listing.title,
      },
    ]
    : undefined;

  return {
    metadataBase: new URL(base),
    title,
    description,
    keywords: [...new Set(keywords)] as string[],
    category: category ?? undefined,
    alternates: { canonical },
    robots: listing.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title,
      description,
      url,
      siteName: `${siteName}`,
      type: "website",
      locale: "en_BD",
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: images ? [images[0].url] : undefined,
    },
  };
}

async function getListing(slug: string) {
  const [listingRow, relatedRows] = await Promise.all([
    prisma.listing.findFirst({
      where: { slug, verificationStatus: ListingStatus.APPROVED },
      select: PUBLIC_LISTING_DETAIL_SELECT,
    }),
    prisma.listing.findMany({
      where: { verificationStatus: ListingStatus.APPROVED },
      orderBy: [
        { isFeatured: "desc" },
        { averageRating: "desc" },
        { publishedAt: "desc" },
      ],
      take: 6,
      select: RELATED_LISTING_SELECT,
    }),
  ]);

  if (!listingRow) return null;

  const listing = toPublicListingDetail(listingRow);

  let related = relatedRows
    .map(toRelatedListingItem)
    .filter((item) => item.slug !== listing.slug);

  if (listing.category) {
    const sameCategory = related.filter(
      (item) => item.category?.slug === listing.category?.slug,
    );
    const others = related.filter(
      (item) => item.category?.slug !== listing.category?.slug,
    );
    related = [...sameCategory, ...others].slice(0, 3);
  } else {
    related = related.slice(0, 3);
  }

  return { listing, related };
}

function buildJsonLd(listing: PublicListingDetail) {
  const url = `${base}/listing/${listing.slug}`;
  const canonical = listing.canonicalUrl || url;
  const locationName =
    listing.location?.parent?.nameLocal || listing.location?.parent?.nameEn;
  const locality = listing.location?.nameLocal || listing.location?.nameEn;

  const openingHoursSpecification = (listing.openingHours ?? [])
    .filter((row) => !row.isClosed && row.openTime && row.closeTime)
    .map((row) => ({
      "@type": "OpeningHoursSpecification" as const,
      dayOfWeek: [
        `https://schema.org/${String(row.day ?? "")
          .toLowerCase()
          .replace(/^./, (c) => c.toUpperCase())}`,
      ],
      opens: row.openTime,
      closes: row.closeTime,
    }));

  const socialLinks = listing.socialLinks
    ? Object.values(listing.socialLinks).filter((value): value is string =>
      Boolean(value),
    )
    : [];

  return {
    "@context": "https://schema.org",
    "@type": schemaBusinessType(listing.category?.name),
    "@id": canonical,
    name: listing.title,
    description:
      listing.shortDescription ||
      listing.tagline ||
      `${listing.title} in ${locationDisplay(listing.location)}.`,
    url: url,
    image:
      listing.thumbnail?.secure_url ?? listing.logo?.secure_url ?? undefined,
    sameAs: socialLinks.length ? socialLinks : undefined,
    telephone: listing.phone ?? undefined,
    email: listing.email ?? undefined,
    priceRange: listing.priceRange ?? undefined,
    foundingDate: listing.establishedYear
      ? String(listing.establishedYear)
      : undefined,
    areaServed: listing.areaServed ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.addressLine1 ?? undefined,
      addressLocality: locality ?? undefined,
      addressRegion: locationName ?? undefined,
      addressCountry: "BD",
    },
    geo:
      listing.latitude !== null && listing.longitude !== null
        ? {
          "@type": "GeoCoordinates",
          latitude: listing.latitude,
          longitude: listing.longitude,
        }
        : undefined,
    openingHoursSpecification: openingHoursSpecification.length
      ? openingHoursSpecification
      : undefined,
    aggregateRating:
      listing.reviewCount > 0
        ? {
          "@type": "AggregateRating",
          ratingValue: listing.averageRating.toFixed(1),
          reviewCount: listing.reviewCount,
        }
        : undefined,
  };
}

function buildBreadcrumbLd(listing: PublicListingDetail) {
  const url = `${base}/listing/${listing.slug}`;
  const items = [
    { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
  ];

  if (listing.category) {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: listing.category.name,
      item: `${base}/#categories`,
    });
  }

  items.push({
    "@type": "ListItem",
    position: items.length + 1,
    name: listing.title,
    item: url,
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const result = await getListing(slug);

  if (!result) notFound();

  const { listing, related } = result;

  const jsonLd = buildJsonLd(listing);
  const breadcrumbLd = buildBreadcrumbLd(listing);
  const faqLd = (listing.faqs ?? []).length
    ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: listing.faqs
        ?.filter((faq) => faq.question && faq.answer)
        .map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
    }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(breadcrumbLd) }}
      />
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeLd(faqLd) }}
        />
      ) : null}
      <ListingDetails listing={listing} related={related} />
    </>
  );
}
