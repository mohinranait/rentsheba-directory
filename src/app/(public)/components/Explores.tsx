import ListingCard from "@/components/common/ListingCard";
import { getCachedExploreListings } from "@/lib/server-public-listings";

const Explores = async () => {
  const listings = await getCachedExploreListings(6);

  return (
    <section
      id="explore"
      className="relative border-y border-[#e2eae4]/70 bg-white/40 backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
              Curated for you
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-.045em] text-[#173f34] sm:text-4xl">
              Popular near you
            </h2>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {listings.length ? (
            listings.map((item) => <ListingCard key={item.id} item={item} />)
          ) : (
            <div className="col-span-3 rounded-2xl border border-dashed border-[#cbdcd1] bg-white/40 p-10 text-center text-sm text-[#6d887d] backdrop-blur-sm">
              No listings match your search yet. Try another location or
              keyword.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Explores;
