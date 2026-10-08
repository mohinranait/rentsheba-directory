import { Compass, Globe2, Sparkles } from "lucide-react";
import GridBackdrop from "@/components/GridBackdrop";

export default function Loading() {
  const SKELETON_ITEMS = [0, 1, 2];

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#f8faf9] text-[#17251f]">
      <GridBackdrop />

      {/* Subtle top placeholder bar */}
      <header className="relative z-10 border-b border-[#dfe8e3]/80 bg-white/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-[#d3f36b] text-[#133f35] shadow-xs animate-pulse">
              <Globe2 className="size-5" />
            </span>
            <span className="text-xl font-bold tracking-[-0.04em] text-[#153e34]">
              Rentsheba<span className="text-[#4c796b]">.</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-24 animate-pulse rounded-lg bg-[#e2ede6]" />
            <div className="h-8 w-28 animate-pulse rounded-lg bg-[#d5e7dc]" />
          </div>
        </div>
      </header>

      {/* Centered Loading Hub */}
      <main className="relative z-10 mx-auto my-auto flex w-full max-w-5xl flex-col items-center px-5 py-12">
        {/* Core Animated Indicator Card */}
        <div className="relative flex flex-col items-center rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_24px_50px_rgba(21,63,53,0.12)] backdrop-blur-xl sm:p-10">
          {/* Radar ripple rings */}
          <div className="relative mb-6 flex size-20 items-center justify-center">
            <span className="absolute size-20 animate-ping rounded-full bg-[#d3f36b]/40 opacity-75" />
            <span className="absolute size-24 animate-pulse rounded-full border border-[#c4ded0]/80" />
            <div className="relative grid size-16 place-items-center rounded-2xl bg-[#133f35] text-[#d3f36b] shadow-md">
              <Compass className="size-8 animate-spin [animation-duration:6s]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#bed8c9] bg-white/90 px-3 py-1 text-xs font-semibold text-[#326958]">
            <Sparkles className="size-3 text-[#4b8b71]" />
            Curating directory
          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#153e34] sm:text-3xl">
            Locating trusted businesses…
          </h2>

          <p className="mt-2 max-w-sm text-center text-sm text-[#617e73]">
            Connecting you to verified local services, doctors, restaurants, and
            rentals across Bangladesh.
          </p>

          {/* Indeterminate loading bar */}
          <div className="mt-6 h-1.5 w-64 overflow-hidden rounded-full bg-[#e3eee7]">
            <div className="h-full w-1/3 animate-[shimmer_1.4s_infinite_linear] rounded-full bg-gradient-to-r from-[#4b8b71] via-[#d3f36b] to-[#133f35]" />
          </div>
        </div>

        {/* Streaming Skeleton Preview Cards */}
        <div className="mt-12 hidden w-full grid-cols-1 gap-5 sm:grid sm:grid-cols-3">
          {SKELETON_ITEMS.map((item) => (
            <div
              key={`loading-card-${item}`}
              className="overflow-hidden rounded-2xl border border-[#e1eae3] bg-white/60 p-4 backdrop-blur-sm"
            >
              <div className="h-28 w-full animate-pulse rounded-xl bg-[#e8f1ec]" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-[#e8f1ec]" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-[#eef5f1]" />
              </div>
              <div className="mt-5 flex items-center justify-between">
                <div className="h-3 w-16 animate-pulse rounded bg-[#e8f1ec]" />
                <div className="h-3 w-20 animate-pulse rounded bg-[#e8f1ec]" />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 border-t border-[#e2ece5]/70 bg-white/40 py-3 text-center text-xs text-[#7d948b] backdrop-blur-xs">
        <p>Bangladesh&apos;s trusted local business directory</p>
      </footer>
    </div>
  );
}