import { BadgeCheck, MapPin, Star } from 'lucide-react'
import Link from 'next/link'

const ListingCard = ({ item }: { item: any }) => {
  return (
    <Link
      href={`/listing/asdf`}
    
      className="overflow-hidden rounded-2xl border border-[#e1e9e3] bg-[#fbfdfb]"
    >
      <div
        className={`flex h-28 items-end justify-between p-4 ${item.tone}`}
      >
        <span className="rounded-full bg-white/75 px-2.5 py-1 text-[11px] font-bold text-[#4a7465]">
          {item.tag}
        </span>
        <span className="grid size-12 place-items-center rounded-xl bg-white/70 text-sm font-bold text-[#456b5e]">
          {item.initials}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-[#254b3f]">
              {item.name}
            </h3>
            <p className="mt-1 text-xs text-[#82968d]">
              {item.cat}
            </p>
          </div>
          <BadgeCheck className="size-5 shrink-0 text-[#4b8b71]" />
        </div>
        <div className="mt-5 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-bold">
            <Star className="size-3.5 fill-[#e5b34f] text-[#e5b34f]" />{" "}
            {item.rating}{" "}
            <span className="font-normal text-[#91a29c]">
              ({item.reviews})
            </span>
          </span>
          <span className="flex items-center gap-1 text-[#7d9289]">
            <MapPin className="size-3.5" /> {item.city}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default ListingCard