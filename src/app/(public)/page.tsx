import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import SubscriptionSection from "@/components/common/SubscriptionSection";
import GridBackdrop from "@/components/GridBackdrop";
import config from "@/lib/config";
import { getCachedSubscriptionPlans } from "@/lib/subscription-plans";
import CategoriesGrid, {
  CategoriesGridSkeleton,
} from "./components/CategoriesGrid";
import CreateListingSteps from "./components/CreateListingSteps";
import Explores from "./components/Explores";
import HeroSection from "./components/HeroSection";

const baseUrl = (config.app_url ?? "http://localhost:3000").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Rentsheba — Bangladesh's Trusted Local Business & Service Directory",
  description:
    "Explore trusted local businesses, professionals, and services across Bangladesh. Search verified restaurants, clinics, repair services, shops, and more with ratings, reviews, and contact details.",
  keywords: [
    "Bangladesh business directory",
    "local business directory Dhaka",
    "services in Bangladesh",
    "find businesses in Dhaka",
    "Rentsheba directory",
    "trusted local services Bangladesh",
    "local businesses Chittagong",
    "local businesses Sylhet",
  ],
  alternates: {
    canonical: `${baseUrl}`,
  },
  openGraph: {
    title: "Rentsheba — Bangladesh's Trusted Local Business & Service Directory",
    description:
      "Explore trusted local businesses, professionals, and services across Bangladesh with verified ratings and direct contacts.",
    url: `${baseUrl}`,
    siteName: "Rentsheba Directory",
    locale: "en_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rentsheba — Bangladesh's Trusted Local Business & Service Directory",
    description:
      "Explore trusted local businesses, professionals, and services across Bangladesh.",
  },
};

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
  const plans = await getCachedSubscriptionPlans();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "Rentsheba Directory",
        description:
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
        name: "Rentsheba",
        url: baseUrl,
        description:
          "Bangladesh's trusted local business and service directory.",
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
          <Suspense fallback={<CategoriesGridSkeleton />}>
            <CategoriesGrid />
          </Suspense>
        </div>
      </section>

      <Suspense fallback={<ExploresFallback />}>
        <Explores />
      </Suspense>

      <CreateListingSteps />

      <SubscriptionSection initialPlans={plans} />
    </div>
  );
}
