import { ArrowRight } from "lucide-react";
import { Suspense } from "react";

import SubscriptionSection from "@/components/common/SubscriptionSection";
import GridBackdrop from "@/components/GridBackdrop";
import CategoriesGrid from "./components/CategoriesGrid";
import CreateListingSteps from "./components/CreateListingSteps";
import Explores from "./components/Explores";
import HeroSection from "./components/HeroSection";

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

export default function Home() {
  return (
    <div className=" z-10">
      <GridBackdrop />
      <HeroSection />
      <section id="categories" className="relative bg-white/50 py-20 ">
        <div className=" mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
                Browse by category
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-.045em] text-[#173f34] sm:text-4xl">
                Something for every need
              </h2>
            </div>
            <a href="#explore" className="text-sm font-bold text-[#36705e]">
              View all categories <ArrowRight className="ml-1 inline size-4" />
            </a>
          </div>
          <CategoriesGrid />
        </div>
      </section>

      <Suspense fallback={<ExploresFallback />}>
        <Explores />
      </Suspense>

      <CreateListingSteps />

      <SubscriptionSection />
    </div>
  );
}
