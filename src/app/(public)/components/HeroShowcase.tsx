import { BadgeCheck, MapPin, Star } from "lucide-react";
import Link from "next/link";
import type {
  PublicListingItem,
  PublicListingResponse,
} from "@/app/api/public/listing/route";
import config from "@/lib/config";

// ---------------------------------------------------------------------------
// Home hero showcase
// ---------------------------------------------------------------------------
// Server component: renders the two admin-selected listings on the right side
// of the hero. Fetched through the same public API as everywhere else and
// CDN-cached for 60s, so the homepage stays fast. `HeroShowcaseFallback` is
// the skeleton shown while this component is streaming in.
// ---------------------------------------------------------------------------

const HERO_API = `${config.app_url ?? "http://localhost:3000"}/api/public/listing?hero=true&pageSize=2&sortBy=popular`;

const fetchHeroListings = async (): Promise<PublicListingItem[]> => {
  try {
    const response = await fetch(HERO_API, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return [];

    const json = (await response.json()) as PublicListingResponse;

    return json.data?.items ?? [];
  } catch (error) {
    console.error("Hero showcase fetch error:", error);
    return [];
  }
};

const getInitials = (title: string) =>
  title
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

const HeroAvatar = ({ item }: { item: PublicListingItem }) => {
  const image = item.thumbnail?.secure_url;

  if (image) {
    // eslint-disable-next-line @next/next/no-img-element -- small cloudinary thumb
    return (
      // biome-ignore lint/performance/noImgElement: small cloudinary thumb, next/image would stall hero LCP
      <img
        src={image}
        alt={item.thumbnail?.alt ?? item.title}
        className="size-full rounded-2xl object-cover"
      />
    );
  }

  return (
    <span className="grid size-full place-items-center rounded-2xl bg-[#edf5ef] text-sm font-bold text-[#2b6854]">
      {getInitials(item.title)}
    </span>
  );
};

const HeroShowcase = async () => {
  const listings = await fetchHeroListings();
  const [primary, secondary] = listings;

  return (
    <>
      {/* Decorative blur */}
      <div className="absolute right-8 top-5 h-72 w-72 rounded-[45%] bg-[#d3f36b]/45 blur-[2px]" />

      {/* Primary listing card */}
      {primary ? (
        <Link
          href={`/listing/${primary.slug}`}
          className="absolute right-16 top-14 block w-80 rounded-3xl border border-white/60 bg-white/55 p-5 shadow-[0_25px_60px_rgba(50,90,68,.2)] backdrop-blur-xl transition-transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-12 overflow-hidden rounded-2xl border border-white/60">
                <HeroAvatar item={primary} />
              </div>
              <div>
                <h3 className="line-clamp-1 font-bold text-[#254b3f]">
                  {primary.title}
                </h3>
                <p className="line-clamp-1 text-xs text-[#779188]">
                  {[primary.category?.name, primary.location?.nameLocal]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>
            {primary.isClaimed && (
              <BadgeCheck className="size-5 shrink-0 text-[#4b8b71]" />
            )}
          </div>

          <div className="mt-5 flex items-center gap-1 text-sm font-bold">
            <Star className="size-4 fill-[#e5b34f] text-[#e5b34f]" />
            {primary.averageRating.toFixed(1)}
            <span className="font-normal text-[#90a29b]">
              ({primary.reviewCount} reviews)
            </span>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-white/50 pt-4 text-xs text-[#6e877e]">
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {primary.location?.nameLocal ?? "Bangladesh"}
            </span>
            <span className="rounded-full border border-[#bfe0c9]/70 bg-[#edf7ef]/80 px-2 py-1 font-semibold text-[#4b8b71]">
              Popular
            </span>
          </div>
        </Link>
      ) : (
        <EmptyPrimaryCard />
      )}

      {/* Secondary listing card */}
      {secondary && (
        <Link
          href={`/listing/${secondary.slug}`}
          className="absolute bottom-4 left-8 rounded-2xl border border-white/60 bg-white/55 p-4 shadow-[0_18px_40px_rgba(50,90,68,.16)] backdrop-blur-xl transition-transform hover:-translate-y-1"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 shrink-0 overflow-hidden rounded-xl border border-white/60">
              <HeroAvatar item={secondary} />
            </div>
            <div className="min-w-0">
              <p className="line-clamp-1 text-sm font-bold text-[#254b3f]">
                {secondary.title}
              </p>
              <p className="line-clamp-1 text-xs text-[#84978f]">
                {secondary.category?.name ?? "Listed business"}
              </p>
            </div>
            <span className="ml-5 flex items-center gap-1 text-xs font-bold text-[#5b726a]">
              <Star className="size-3 fill-[#e5b34f] text-[#e5b34f]" />
              {secondary.averageRating.toFixed(1)}
            </span>
          </div>
        </Link>
      )}
    </>
  );
};

// Keeps the hero visually balanced until an admin selects listings
const EmptyPrimaryCard = () => (
  <div className="absolute right-16 top-14 w-80 rounded-3xl border border-white/60 bg-white/55 p-5 shadow-[0_25px_60px_rgba(50,90,68,.2)] backdrop-blur-xl">
    <div className="flex items-center gap-3">
      <div className="grid size-12 place-items-center rounded-2xl border border-white/60 bg-white/70 text-lg font-bold text-[#2b6854]">
        ★
      </div>
      <div>
        <h3 className="font-bold text-[#779188]">Featured business</h3>
        <p className="text-xs text-[#a7b8b0]">Waiting for an admin pick</p>
      </div>
    </div>
    <div className="mt-5 h-4 w-24 animate-pulse rounded bg-[#e4ede8]" />
  </div>
);

export const HeroShowcaseFallback = () => (
  <>
    <div className="absolute right-8 top-5 h-72 w-72 rounded-[45%] bg-[#d3f36b]/45 blur-[2px]" />
    <div className="absolute right-16 top-14 w-80 animate-pulse rounded-3xl border border-white/60 bg-white/60 p-5 shadow-[0_25px_60px_rgba(50,90,68,.2)] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-2xl bg-[#e4ede8]" />
        <div className="space-y-2">
          <div className="h-3 w-32 rounded bg-[#e4ede8]" />
          <div className="h-2.5 w-24 rounded bg-[#eef4f1]" />
        </div>
      </div>
      <div className="mt-5 h-3 w-20 rounded bg-[#e4ede8]" />
      <div className="mt-5 flex justify-between">
        <div className="h-3 w-28 rounded bg-[#e4ede8]" />
        <div className="h-5 w-16 rounded-full bg-[#e4ede8]" />
      </div>
    </div>
    <div className="absolute bottom-4 left-8 w-72 animate-pulse rounded-2xl border border-white/60 bg-white/60 p-4 shadow-[0_18px_40px_rgba(50,90,68,.16)] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-[#e4ede8]" />
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-[#e4ede8]" />
          <div className="h-2.5 w-20 rounded bg-[#eef4f1]" />
        </div>
      </div>
    </div>
  </>
);

export default HeroShowcase;
