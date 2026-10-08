import {
  Compass,
  Globe2,
  Home,
  MapPinOff,
  Navigation,
  PlusCircle,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import GridBackdrop from "@/components/GridBackdrop";

export default function NotFound() {
  const popularShortcuts = [
    { label: "🍽️ Restaurants & Food", href: "/search?category=restaurant" },
    { label: "🏥 Clinics & Medical", href: "/search?category=medical" },
    { label: "🚘 Vehicle & Rentals", href: "/search?category=rent" },
    { label: "📍 Dhaka Listings", href: "/search?q=Dhaka" },
    { label: "📍 Chattogram Listings", href: "/search?q=Chattogram" },
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#f8faf9] text-[#17251f]">
      <GridBackdrop />

      {/* Top Header Bar */}
      <header className="relative z-10 border-b border-[#dfe8e3] bg-white/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="Rentsheba Directory Home"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-[#d3f36b] text-[#133f35] shadow-xs">
              <Globe2 className="size-5" />
            </span>
            <span className="text-xl font-bold tracking-[-0.04em]">
              Rentsheba<span className="text-[#4c796b]">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#d6e4db] bg-white/80 px-3.5 py-2 text-xs font-semibold text-[#31594c] transition hover:bg-white hover:text-[#133f35]"
            >
              <Compass className="size-3.5 text-[#4b8b71]" />
              Browse Listings
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#133f35] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1c5548]"
            >
              <Home className="size-3.5" />
              Directory Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto my-auto flex w-full max-w-4xl flex-col items-center px-5 py-12 text-center lg:py-16">
        {/* Animated Radar / Compass Pin Badge */}
        <div className="relative mb-6">
          <div className="relative flex size-24 items-center justify-center rounded-3xl border border-white/80 bg-white/70 shadow-[0_20px_45px_rgba(21,63,53,0.14)] backdrop-blur-xl">
            {/* Concentric radar rings */}
            <span className="absolute size-24 animate-ping rounded-3xl bg-[#d3f36b]/30 opacity-75" />
            <span className="absolute size-28 rounded-3xl border border-[#c5ddcf]/60" />
            <div className="relative flex size-14 items-center justify-center rounded-2xl bg-[#133f35] text-[#d3f36b] shadow-inner">
              <MapPinOff className="size-7" />
            </div>
          </div>

          <span className="absolute -bottom-2 -right-3 inline-flex items-center gap-1 rounded-full border border-[#bedac9] bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#356f5d] shadow-sm">
            <Navigation className="size-2.5 text-[#e5a93b]" />
            OFF MAP
          </span>
        </div>

        {/* 404 Stylized Headline */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#bcd7c7] bg-white/80 px-3 py-1 text-xs font-semibold text-[#326958] backdrop-blur-sm">
          <Sparkles className="size-3 text-[#e5a93b]" /> Error 404 · Destination Not Found
        </div>

        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#153e34] sm:text-5xl lg:text-6xl">
          You&apos;re off the directory map
        </h1>

        <p className="mt-4 max-w-lg text-base leading-relaxed text-[#567369] sm:text-lg">
          The business, category, or service you are trying to reach doesn&apos;t
          exist at these coordinates. It may have been relocated, unlisted, or
          typed incorrectly.
        </p>

        {/* Directory Instant Search Box */}
        <div className="mt-8 w-full max-w-lg">
          <form
            action="/search"
            method="GET"
            className="flex flex-col gap-2 rounded-2xl border border-white/80 bg-white/85 p-2 shadow-[0_16px_36px_rgba(21,63,53,0.1)] backdrop-blur-xl sm:flex-row"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3">
              <Search className="size-5 shrink-0 text-[#7a998e]" />
              <input
                type="text"
                name="q"
                placeholder="Search businesses, doctors, restaurants..."
                className="w-full bg-transparent py-2.5 text-sm text-[#153e34] outline-none placeholder:text-[#95aca2]"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-[#133f35] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1a4d41]"
            >
              Find in Directory
            </button>
          </form>
        </div>

        {/* Category shortcuts with directory pins */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium text-[#728f83]">
            Or jump into:
          </span>
          {popularShortcuts.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-[#d3e3d8] bg-white/70 px-3 py-1 text-xs font-semibold text-[#366857] transition hover:border-[#a9cbba] hover:bg-white hover:text-[#133f35] hover:shadow-xs"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Action Button Navigation */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#d3f36b] px-6 py-3 text-sm font-bold text-[#153e34] shadow-sm transition hover:bg-[#c4e85d]"
          >
            <Home className="size-4" />
            Back to Home
          </Link>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-xl border border-[#cbdcd1] bg-white/85 px-6 py-3 text-sm font-bold text-[#234e40] shadow-xs transition hover:bg-white hover:border-[#adcbb8]"
          >
            <Compass className="size-4 text-[#4b8b71]" />
            Explore All Listings
          </Link>

          <Link
            href="/listing/add"
            className="inline-flex items-center gap-2 rounded-xl border border-transparent px-4 py-3 text-sm font-semibold text-[#487163] transition hover:text-[#153e34]"
          >
            <PlusCircle className="size-4" />
            Add Your Business
          </Link>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 border-t border-[#e2ece5]/80 bg-white/50 py-4 text-center text-xs text-[#7d948b] backdrop-blur-sm">
        <p>
          Lost? Call upon Bangladesh&apos;s trusted local network · ©{" "}
          {new Date().getFullYear()} Rentsheba Directory.
        </p>
      </footer>
    </div>
  );
}