"use client";

import {
  ArrowUpRight,
  Loader2,
  Search,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { LocationNode } from "@/app/api/locations/tree/route";
import { Button } from '@/components/ui/button';


type Suggestion = {
  id: string;
  title: string;
  slug: string;
  isFeatured: boolean;
  averageRating: number;
  thumbnail: { secure_url: string; alt: string | null } | null;
  category: { name: string } | null;
  location: { nameLocal: string } | null;
};

const HeroSearchField = () => {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [locationId, setLocationId] = useState<string>("");

  const [divisions, setDivisions] = useState<LocationNode[]>([]);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const searchBoxRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  // Load the location hierarchy once so the dropdown reflects the real data
  useEffect(() => {
    fetch("/api/locations/tree")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDivisions(data.data);
      })
      .catch(() => {
        // Leave just "All locations"; the search still works without a filter
      });
  }, []);

  // Live suggestions while the visitor types
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    const value = query.trim();

    if (value.length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      setSuggestionsLoading(false);
      return;
    }

    setSuggestionsLoading(true);

    debounceTimer.current = setTimeout(() => {
      fetch(`/api/public/listing/suggestions?q=${encodeURIComponent(value)}`)
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(data.data ?? []);
          setSuggestionsOpen(true);
        })
        .catch(() => {
          setSuggestions([]);
        })
        .finally(() => setSuggestionsLoading(false));
    }, 250);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  // Close the suggestion dropdown on outside clicks / Escape
  useEffect(() => {
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setSuggestionsOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSuggestionsOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const goToSearch = () => {
    setSuggestionsOpen(false);

    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    if (locationId) params.set("location", locationId);

    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const hasSuggestions = suggestions.length > 0;

  return (
    <div ref={searchBoxRef} className="relative mt-9 max-w-2xl">
      <div className="flex flex-col gap-2 rounded-2xl border border-white/60 bg-white/55 p-2 shadow-[0_18px_45px_rgba(36,79,59,.14)] backdrop-blur-xl sm:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
          <Search className="size-5 shrink-0 text-[#7d9b90]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") goToSearch();
            }}
            placeholder="What are you looking for?"
            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[#9aafa7]"
          />
        </div>
        <div className="hidden w-px bg-[#e1eae4] sm:block" />
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="border-t border-[#edf1ee] bg-transparent px-3 py-3 text-sm text-[#557068] outline-none sm:border-0"
        >
          <option value="">All locations</option>
          {divisions.map((division) => (
            <option key={division.id} value={division.id}>
              {division.nameEn}
            </option>
          ))}
        </select>
        <Button
          onClick={goToSearch}
          className="rounded-xl bg-[#d3f36b] px-5 py-3 text-sm font-bold text-[#193d32] hover:bg-[#c4e85d]"
        >
          Search directory
        </Button>
      </div>

      {/* Live search suggestions */}
      {(suggestionsOpen || suggestionsLoading) &&
        query.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-[#e3eae4] bg-white/95 shadow-[0_18px_45px_rgba(36,79,59,.16)] backdrop-blur-xl">
            {suggestionsLoading ? (
              <div className="flex items-center gap-3 px-4 py-4 text-sm text-[#7d9289]">
                <Loader2 className="size-4 animate-spin text-[#4b8b71]" />
                Searching…
              </div>
            ) : hasSuggestions ? (
              <ul className="max-h-80 divide-y divide-[#eef2ef] overflow-y-auto">
                {suggestions.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => router.push(`/listing/${item.slug}`)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f3f8f5]"
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-semibold text-[#254b3f]">
                              {item.title}
                            </span>
                            {item.isFeatured && (
                              <Star className="size-3 fill-[#e5b34f] text-[#e5b34f]" />
                            )}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-[#84968e]">
                            {[
                              item.category?.name,
                              item.location?.nameLocal,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#5b726a]">
                        <Star className="size-3 fill-[#e5b34f] text-[#e5b34f]" />{" "}
                        {item.averageRating.toFixed(1)}
                      </span>
                      <ArrowUpRight className="size-4 shrink-0 text-[#b2c2bb]" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <button
                type="button"
                onClick={goToSearch}
                className="flex w-full items-center justify-between px-4 py-4 text-left text-sm text-[#6e877e] transition-colors hover:bg-[#f3f8f5]"
              >
                No direct matches — see all results for &quot;
                {query.trim()}&quot;
                <ArrowUpRight className="size-4 text-[#4b8b71]" />
              </button>
            )}
          </div>
        )}
    </div>
  )
}

export default HeroSearchField