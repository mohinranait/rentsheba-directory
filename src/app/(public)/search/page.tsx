import { MapPin, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import type {
  PublicListingItem,
  PublicListingResponse,
} from "@/app/api/public/listing/route";
import ListingCard from "@/components/common/ListingCard";
import config from "@/lib/config";
import SearchPanel from "./components/search-panel";

// ---------------------------------------------------------------------------
// /search
// ---------------------------------------------------------------------------
// Server-rendered search results. The query lives in the URL (?q=…&location=…)
// so results are shareable and crawlable, and the SearchPanel below only ever
// re-writes the URL. Results stream in behind a Suspense skeleton, and the API
// uses cache: "no-store" so every search reflects the latest data.
// ---------------------------------------------------------------------------

type SearchParams = Promise<
  Partial<Record<string, string | string[] | undefined>>
>;

export const dynamic = "force-dynamic";

const terse = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
};

const PAGE_SIZE = 12;

const SKELETON_CARDS = [0, 1, 2, 3, 4, 5, 6, 7];

const getBaseUrl = () => config.app_url ?? "http://localhost:3000";

const fetchResults = async (query: string, locationId: string) => {
  const params = new URLSearchParams({
    pageSize: String(PAGE_SIZE),
    sortBy: "popular",
  });

  if (query) params.set("search", query);
  if (locationId) params.set("locationId", locationId);

  const response = await fetch(`${getBaseUrl()}/api/public/listing?${params}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) return null;

  const json = (await response.json()) as PublicListingResponse;

  return json.data;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const query = terse(sp.q);

  return {
    title: query
      ? `Search results for "${query}" — Local Business Directory`
      : "Search the directory — Local Business Directory",
    description: query
      ? `Find ${query} businesses, services and professionals in Bangladesh.`
      : "Search trusted local businesses, services and professionals across Bangladesh.",
    alternates: {
      canonical: `${getBaseUrl()}/search${query ? `?q=${encodeURIComponent(query)}` : ""}`,
    },
  };
}

const EmptyResults = ({
  query,
  hasLocation,
}: {
  query: string;
  hasLocation: boolean;
}) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#e6ede8] bg-white/60 px-6 py-16 text-center">
    <span className="grid size-14 place-items-center rounded-2xl bg-[#eef5ef]">
      <SearchX className="size-7 text-[#6b8a7d]" />
    </span>
    <h2 className="text-lg font-bold text-[#254b3f]">No results found</h2>
    <p className="max-w-sm text-sm text-[#6e877e]">
      {hasLocation
        ? `Nothing matched "${query}" in the selected area. Try different words or widen the location.`
        : `Nothing matched "${query}". Try different words, a wider category, or browse the full directory.`}
    </p>
    <Link
      href="/"
      className="mt-2 rounded-xl bg-[#1f4d3d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#173f34]"
    >
      Browse the directory
    </Link>
  </div>
);

const SearchResultsSkeleton = () => (
  <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {SKELETON_CARDS.map((key) => (
      <div
        key={key}
        className="animate-pulse overflow-hidden rounded-2xl border border-[#e6ede8] bg-[#fbfdfb]"
      >
        <div className="h-28 bg-[#eef3f0]" />
        <div className="space-y-3 p-5">
          <div className="h-4 w-3/4 rounded bg-[#e4ede8]" />
          <div className="h-3 w-1/2 rounded bg-[#eef4f1]" />
          <div className="flex justify-between pt-2">
            <div className="h-3 w-16 rounded bg-[#e4ede8]" />
            <div className="h-3 w-20 rounded bg-[#e4ede8]" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const SearchResults = async ({
  query,
  locationId,
  locationLabel,
}: {
  query: string;
  locationId: string;
  locationLabel: string;
}) => {
  const data = await fetchResults(query, locationId);
  const items = data?.items ?? [];
  const total = data?.meta?.total ?? items.length;

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#6e877e]">
          <span className="font-bold text-[#254b3f]">{total}</span> result
          {total === 1 ? "" : "s"}
          {query && (
            <>
              {" "}
              for &quot;<span className="font-semibold">{query}</span>&quot;
            </>
          )}
          {locationLabel && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#eaf3ee] px-2.5 py-1 text-xs font-semibold text-[#3f6a58]">
              <MapPin className="size-3" />
              {locationLabel}
            </span>
          )}
        </p>
        {(query || locationId) && (
          <Link
            href="/search"
            className="text-xs font-semibold text-[#4b8b71] hover:underline"
          >
            Clear filters
          </Link>
        )}
      </div>

      {items.length > 0 ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item: PublicListingItem) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="mt-5">
          <EmptyResults query={query} hasLocation={Boolean(locationId)} />
        </div>
      )}
    </>
  );
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const query = terse(sp.q);
  const locationId = terse(sp.location ?? sp.locationId);
  const locationLabel = terse(sp.locationName);

  return (
    <div className="mx-auto mb-20 max-w-7xl px-5 pt-12 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-[#153e34]">
        {query ? `Search: "${query}"` : "Search the directory"}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-[#6e877e]">
        Find trusted businesses, services, and professionals across Bangladesh.
      </p>

      <div className="mt-6 max-w-3xl">
        <SearchPanel />
      </div>

      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults
          query={query}
          locationId={locationId}
          locationLabel={locationLabel}
        />
      </Suspense>
    </div>
  );
}
