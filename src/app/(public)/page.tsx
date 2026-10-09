import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import SubscriptionSection from "@/components/common/SubscriptionSection";
import GridBackdrop from "@/components/GridBackdrop";
import config from "@/lib/config";
import { getCachedSiteSettings } from "@/lib/settings";
import { getCachedSubscriptionPlans } from "@/lib/subscription-plans";
import CategoriesGrid, {
  CategoriesGridSkeleton,
} from "./components/CategoriesGrid";
import CreateListingSteps from "./components/CreateListingSteps";
import Explores from "./components/Explores";
import HeroSection from "./components/HeroSection";

const baseUrl = (config.app_url ?? "http://localhost:3000").replace(/\/+$/, "");

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
  const siteName = settings.siteName || "Rentsheba";
  const title =
    settings.metaTitle ||
    `${siteName} — ${settings.siteTagline || "Bangladesh's Trusted Local Business & Service Directory"}`;
  const description =
    settings.metaDescription ||
    settings.siteDescription ||
    "Explore trusted local businesses, professionals, and services across Bangladesh. Search verified restaurants, clinics, repair services, shops, and more with ratings, reviews, and contact details.";

  const keywords = settings.metaKeywords
    ? settings.metaKeywords.split(",").map((k) => k.trim())
    : [
        "Bangladesh business directory",
        "local business directory Dhaka",
        "services in Bangladesh",
        "find businesses in Dhaka",
        `${siteName} directory`,
        "trusted local services Bangladesh",
      ];

  const ogImages = settings.ogImage ? [{ url: settings.ogImage }] : undefined;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${baseUrl}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}`,
      siteName: `${siteName} Directory`,
      locale: "en_BD",
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages,
    },
  };
}

const EXPLORES_SKELETON = [0, 1, 2, 3, 4, 5];

const ExploresFallback = () => (
  <section className="relative border-y border-[#e2eae4]/70 bg-white/40 backdrop-blur-md">
    <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="h-4 w-40 animate-pulse rounded bg-[#dbe7e1]" />
      <div className="mt-3 h-9 w-64 animate-pulse rounded bg-[#dbe7e1]" />
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {EXPLORES_SKELETON.map((item) => (
          <div
            key={`explores-fallback-${item}`}
            className="h-64 animate-pulse rounded-2xl bg-[#eef4f1]"
          />
        ))}
      </div>
    </div>
  </section>
);

export default async function Home() {
  const [plans, settings] = await Promise.all([
    getCachedSubscriptionPlans(),
    getCachedSiteSettings(),
  ]);

  const siteName = settings.siteName || "Rentsheba";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: `${siteName} Directory`,
        description:
          settings.siteTagline ||
          "Bangladesh's trusted local business and service directory.",
        publisher: {
          "@id": `${baseUrl}/#organization`,
        },
        potentialAction: [
          {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${baseUrl}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        ],
        inLanguage: ["en-BD", "bn-BD"],
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: siteName,
        url: baseUrl,
        logo: settings.headerLogo || undefined,
        description:
          settings.siteDescription ||
          "Bangladesh's trusted local business and service directory.",
        contactPoint: {
          "@type": "ContactPoint",
          telephone: settings.helpline || settings.contactPhone || "+880 1700-000000",
          contactType: "customer service",
          email: settings.contactEmail || "support@rentsheba.com",
        },
      },
    ],
  };

  return (
    <div className="z-10">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <GridBackdrop />
      <HeroSection />

      <section id="categories" className="relative bg-white/50 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
                Browse by category
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-.045em] text-[#173f34] sm:text-4xl">
                Something for every need
              </h2>
            </div>
            <Link href="/search" className="text-sm font-bold text-[#36705e]">
              View all categories <ArrowRight className="ml-1 inline size-4" />
            </Link>
          </div>

          <div className="mt-10">
            <Suspense fallback={<CategoriesGridSkeleton />}>
              <CategoriesGrid />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Explores Section */}
      <Suspense fallback={<ExploresFallback />}>
        <Explores />
      </Suspense>

      <CreateListingSteps />
      <SubscriptionSection initialPlans={plans} />
    </div>
  );
}
