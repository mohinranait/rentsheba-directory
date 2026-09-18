import { BadgeCheck, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { PublicListingItem } from "@/app/api/public/listing/route";

const FALLBACK_TONES = [
  "bg-[#e7f0eb]",
  "bg-[#f1e9dc]",
  "bg-[#e3eaf3]",
  "bg-[#f6e7e2]",
  "bg-[#e7ecf0]",
];

const getInitials = (title: string) =>
  title
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

const getTone = (title: string) => {
  const hash = title
    .split("")
    .reduce((sum, char) => sum + (char.charCodeAt(0) ?? 0), 0);
  return FALLBACK_TONES[hash % FALLBACK_TONES.length];
};

const getTag = (item: PublicListingItem) => {
  if (item.isFeatured) return "Featured";
  if (item.isClaimed || item.averageRating >= 4.5) return "Verified";
  return null;
};

const ListingCard = ({ item }: { item: PublicListingItem }) => {
  const locationName = item.location?.nameLocal || item.location?.nameEn || "";
  const subtitle = [item.category?.name, locationName]
    .filter(Boolean)
    .join(" · ");
  const tag = getTag(item);

  return (
    <Link
      href={`/listing/${item.slug}`}
      prefetch
      className="group overflow-hidden rounded-2xl border border-[#e1e9e3] bg-[#fbfdfb]"
    >
      <div className="relative flex h-28 items-end justify-end p-4">
        {item.thumbnail?.secure_url ? (
          <>
            <Image
              src={item.thumbnail.secure_url}
              alt={item.thumbnail.alt ?? `${item.title} listing thumbnail`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c2a21]/25 to-transparent" />
          </>
        ) : (
          <span className={`absolute inset-0 ${getTone(item.title)}`} />
        )}
        {tag && (
          <span className="relative z-10 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-[#4a7465]">
            {tag}
          </span>
        )}
        {!item.thumbnail?.secure_url && (
          <span className="relative z-10 grid size-12 place-items-center rounded-xl bg-white/70 text-sm font-bold text-[#456b5e]">
            {getInitials(item.title)}
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-[#254b3f]">{item.title}</h3>
            {subtitle && (
              <p className="mt-1 text-xs text-[#82968d]">{subtitle}</p>
            )}
          </div>
          {item.isClaimed && (
            <BadgeCheck className="size-5 shrink-0 text-[#4b8b71]" />
          )}
        </div>
        <div className="mt-5 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-bold">
            <Star className="size-3.5 fill-[#e5b34f] text-[#e5b34f]" />{" "}
            {item.averageRating.toFixed(1)}{" "}
            <span className="font-normal text-[#91a29c]">
              ({item.reviewCount})
            </span>
          </span>
          {locationName && (
            <span className="flex items-center gap-1 text-[#7d9289]">
              <MapPin className="size-3.5" /> {locationName}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
