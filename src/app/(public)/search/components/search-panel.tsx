"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { LocationNode } from "@/app/api/locations/tree/route";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Search panel
// ---------------------------------------------------------------------------
// Client component used on the /search page. Keeps the query + location in the
// URL so results stay shareable, SEO-friendly and server-rendered; the panel
// just re-writes the URL and lets the server page re-fetch.
// ---------------------------------------------------------------------------

const SearchPanel = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [locationId, setLocationId] = useState(
    searchParams.get("location") ?? "",
  );
  const [divisions, setDivisions] = useState<LocationNode[]>([]);

  useEffect(() => {
    fetch("/api/locations/tree")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDivisions(data.data);
      })
      .catch(() => {
        // Search still works without the location filter
      });
  }, []);

  const submit = () => {
    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    if (locationId) params.set("location", locationId);

    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/60 bg-white/70 p-2 shadow-[0_18px_45px_rgba(36,79,59,.12)] backdrop-blur-xl sm:flex-row">
      <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
        <Search className="size-5 shrink-0 text-[#7d9b90]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
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
        onClick={submit}
        className="rounded-xl bg-[#d3f36b] px-5 py-3 text-sm font-bold text-[#193d32] hover:bg-[#c4e85d]"
      >
        Search directory
      </Button>
    </div>
  );
};

export default SearchPanel;
