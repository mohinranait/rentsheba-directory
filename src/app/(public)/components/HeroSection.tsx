import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { Suspense } from "react";
import HeroSearchField from "./HeroSearchField";
import HeroShowcase, { HeroShowcaseFallback } from "./HeroShowcase";


const HeroSection = () => {
  

  return (
    <section id="top" className="relative  bg-white/50">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.03fr_.97fr] lg:px-8 lg:py-28">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#bdd4c6]/70 bg-white/50 px-3 py-1.5 text-xs font-semibold text-[#36705e] backdrop-blur-md">
            <Sparkles className="size-3.5" /> Discover better, locally
          </div>
          <h1 className="max-w-2xl text-5xl font-bold leading-[1.02] tracking-[-0.07em] text-[#153e34] sm:text-6xl lg:text-7xl">
            Find the right <span className="text-[#4b8b71]">place</span> for
            everything.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#527067]">
            Explore trusted local businesses, professionals, and services across
            Bangladesh — all in one thoughtfully curated directory.
          </p>

         <HeroSearchField />

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#668279]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-[#4b8b71]" /> Verified
              businesses
            </span>
            <span className="flex items-center gap-1.5">
              <LockKeyhole className="size-4 text-[#4b8b71]" /> Safe & reliable
            </span>
            <span>12,000+ listings</span>
          </div>
        </div>

        <div className="relative hidden min-h-95 lg:block">
           <Suspense fallback={<HeroShowcaseFallback />}>
          <HeroShowcase />
        </Suspense>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
