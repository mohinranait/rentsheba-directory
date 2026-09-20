

import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Share2,
  ShieldCheck,
  Star,
  Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ListingCard from "@/components/common/ListingCard";
import GridBackdrop from "@/components/GridBackdrop";
import { Button } from "@/components/ui/button";
import {
  locationDisplay,
  type PublicListingDetail,
  type RelatedListingItem,
} from "@/lib/public-listing";
import { cn } from "@/lib/utils";
import ListingFaqs from "./ListingFaqs";
import OpeningHours from "./OpeningHours";

type ListingDetailsProps = {
  listing: PublicListingDetail;
  related: RelatedListingItem[];
};

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


const formatDate = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const websiteLabel = (website?: string | null) =>
  website
    ? website
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .replace(/\/+$/, "")
    : "";

export default function ListingDetails({
  listing,
  related,
}: ListingDetailsProps) {
  // const [saved, setSaved] = useState(false);




  const title = listing.title;
  const category = listing.category;
  const location = locationDisplay(listing.location);
  const locationShort =
    listing.location?.nameLocal || listing.location?.nameEn || "";
  const ratingLabel =
    listing.reviewCount > 0
      ? `${listing.averageRating.toFixed(1)} (${listing.reviewCount} review${listing.reviewCount === 1 ? "" : "s"})`
      : "No reviews yet";


  const mapsQuery =
    listing.latitude !== null && listing.longitude !== null
      ? `${listing.latitude},${listing.longitude}`
      : [listing.addressLine1, locationShort].filter(Boolean).join(", ");
  const directionsHref = mapsQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
    : null;

  const whatsapp = listing.whatsapp
    ? `https://wa.me/${listing.whatsapp.replace(/[^\d]/g, "")}`
    : null;

  const headerBadges = [
    listing.isFeatured && "Editor\u2019s pick",
    listing.isClaimed && "Verified listing",
  ].filter((badge): badge is string => Boolean(badge));

  return (
    <div>
      <GridBackdrop />
      <section className="relative z-10  overflow-hidden border-b border-[#deebe1] bg-[#e8f2ec]/76">
        {" "}
        {/* Grid background */}{" "}
        {/* <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: ` linear-gradient(to right, rgba(74, 116, 96, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(74, 116, 96, 0.05) 1px, transparent 1px) `,
            backgroundSize: "56px 56px",
          }}
        />{" "} */}
        <div className="relative mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          {" "}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#5d8172]">
            {" "}
            <Link href="/#explore">Explore</Link> <span>/</span>{" "}
            <Link href="/#categories"> {category?.name ?? "Directory"} </Link>{" "}
            <span>/</span> <span>{locationShort || title}</span>{" "}
          </div>{" "}
          <div className="mt-7 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            {" "}
            <div>
              {" "}
              {headerBadges.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  {" "}
                  {headerBadges.map((badge) => (
                    <span
                      key={badge}
                      className={
                        badge === "Editor’s pick"
                          ? "rounded-full bg-white/75 px-3 py-1 text-xs font-bold text-[#4b7966]"
                          : "flex items-center gap-1 text-xs font-bold text-[#4b7966]"
                      }
                    >
                      {" "}
                      {badge === "Editor’s pick" ? (
                        badge
                      ) : (
                        <>
                          {" "}
                          <BadgeCheck className="size-4" />{" "}
                          {badge}{" "}
                        </>
                      )}{" "}
                    </span>
                  ))}{" "}
                </div>
              )}{" "}
              <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-[-.06em] text-[#153e34] sm:text-5xl lg:text-6xl">
                {" "}
                {title}{" "}
              </h1>{" "}
              <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#5d7b70]">
                {" "}
                {category && (
                  <span className="flex items-center gap-1.5">
                    {" "}
                    <Tag className="size-4" /> {category.name}{" "}
                  </span>
                )}{" "}
                {location && (
                  <span className="flex items-center gap-1.5">
                    {" "}
                    <MapPin className="size-4" /> {location}{" "}
                  </span>
                )}{" "}
                <span className="flex items-center gap-1.5 font-bold text-[#365f50]">
                  {" "}
                  <Star className="size-4 fill-[#e5b34f] text-[#e5b34f]" />{" "}
                  {ratingLabel}{" "}
                </span>{" "}
              </p>{" "}
            </div>{" "}
            <div className="flex flex-wrap gap-2">
              {" "}
              <Button className="flex items-center gap-2 rounded-xl border border-[#bfd6c7] bg-white/65 px-4 py-3 text-sm font-bold text-[#42695b]">
                {" "}
                <Share2 className="size-4" /> Share{" "}
              </Button>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </section>

      <section className="relative z-10 bg-white/50">
        <div className="mx-auto grid   max-w-7xl gap-8 px-5  py-12 lg:grid-cols-[minmax(0,1fr)_350px] lg:px-8 lg:py-16">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-3xl border border-[#e0e9e3] bg-white">
              <div
                className={cn(
                  "relative flex h-64 items-end justify-between overflow-hidden p-6 sm:h-80",
                  getTone(title),
                )}
              >
                {listing.thumbnail?.secure_url ? (
                  <>
                    <Image
                      src={listing.thumbnail.secure_url}
                      alt={listing.thumbnail.alt ?? `${title} cover photo`}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 1024px"
                      className="object-cover"
                    />
                    <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#0c2a21]/35 to-transparent" />
                  </>
                ) : null}
                <div className="relative z-10 rounded-2xl bg-white/70 px-4 py-3 backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-[.15em] text-[#52796a]">
                    {category?.name ?? "Listed business"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#254d40]">
                    {listing.tagline ||
                      listing.shortDescription?.slice(0, 80) ||
                      "A trusted business in Bangladesh"}
                  </p>
                </div>
                <span className="relative z-10 grid size-16 place-items-center rounded-2xl bg-white/75 text-xl font-bold text-[#2e6c57] shadow-sm">
                  {getInitials(title)}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#edf1ee] px-6 py-5">
                <div className="flex flex-wrap gap-4 text-sm text-[#6d857b]">

                  <span className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-[#4b8b71]" />{" "}
                    {listing.isClaimed ? "Claimed profile" : "Verified listing"}
                  </span>
                </div>
                <span className="rounded-full bg-[#edf7ef] px-3 py-1.5 text-xs font-bold text-[#4b8b71]">
                  {listing.isFeatured ? "Editor\u2019s pick" : "Active listing"}
                </span>
              </div>
            </div>

            <section className="mt-8 rounded-3xl border border-[#e0e9e3] bg-white p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
                About the business
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-.04em] text-[#173f34]">
                {listing.tagline || `${title} at a glance`}
              </h2>
              <p className="mt-5 max-w-3xl whitespace-pre-line text-[15px] leading-8 text-[#607970]">
                {listing.description}
              </p>
              <div className="mt-7 grid gap-4 border-t border-[#edf1ee] pt-6 sm:grid-cols-3">
                <InfoItem
                  icon={<CalendarDays className="size-4" />}
                  label="Established"
                  value={
                    listing.establishedYear
                      ? String(listing.establishedYear)
                      : "—"
                  }
                />
                <InfoItem
                  icon={<Tag className="size-4" />}
                  label="Category"
                  value={category?.name ?? "—"}
                />
                <InfoItem
                  icon={<Navigation className="size-4" />}
                  label="Area served"
                  value={listing.areaServed || locationShort || "—"}
                />
              </div>
            </section>

            <section className="mt-8 rounded-3xl border border-[#e0e9e3] bg-white p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
                Services &amp; amenities
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-.04em] text-[#173f34]">
                What you can expect
              </h2>
              {listing.features?.length ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {listing.features.map((feature) => (
                    <div
                      key={feature.name}
                      className="flex items-center gap-3 rounded-xl bg-[#f4f8f4] px-4 py-3 text-sm font-semibold text-[#527268]"
                    >
                      <Check className="size-4 text-[#4b8b71]" /> {feature.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm leading-7 text-[#71867e]">
                  Services and amenities are being added by the business owner.
                </p>
              )}
            </section>

            <section className="mt-8 rounded-3xl border border-[#e0e9e3] bg-white p-6 sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
                    Customer reviews
                  </p>
                  <h2 className="mt-3 text-2xl font-bold tracking-[-.04em] text-[#173f34]">
                    What people are saying
                  </h2>
                </div>
                <div className="text-right">
                  <p className="flex items-center justify-end gap-1 text-2xl font-bold text-[#254d40]">
                    <Star className="size-5 fill-[#e5b34f] text-[#e5b34f]" />{" "}
                    {listing.averageRating.toFixed(1)}
                  </p>
                  <p className="text-xs text-[#80958c]">
                    {listing.reviewCount > 0
                      ? `${listing.reviewCount} verified review${listing.reviewCount === 1 ? "" : "s"}`
                      : "No reviews yet"}
                  </p>
                </div>
              </div>
              <div className="mt-7 flex flex-col gap-5">
                {listing.reviewCount > 0 ? (
                  <div className="border-t border-[#edf1ee] pt-5 text-sm leading-7 text-[#657d74]">
                    This business has earned{" "}
                    <strong className="font-bold text-[#31594c]">
                      {listing.averageRating.toFixed(1)} out of 5
                    </strong>{" "}
                    from {listing.reviewCount} review
                    {listing.reviewCount === 1 ? "" : "s"} on directory.
                  </div>
                ) : (
                  <div className="border-t border-[#edf1ee] pt-5 text-sm leading-7 text-[#657d74]">
                    No customer reviews yet. Reviews from verified customers will
                    appear here.
                  </div>
                )}
              </div>
              {listing.reviewCount > 0 && (
                <Button className="mt-6 rounded-xl border border-[#cbded2] px-4 py-2.5 text-sm font-bold text-[#3e6d5b]">
                  Read all reviews
                </Button>
              )}
            </section>

            {listing.faqs?.length ? (
              <section className="mt-8 rounded-3xl border border-[#e0e9e3] bg-white p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
                  Frequently asked questions
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-[-.04em] text-[#173f34]">
                  Questions about {title}
                </h2>
                <div className="mt-6 divide-y divide-[#edf1ee]">
                  <ListingFaqs faqs={listing.faqs || []} />
                </div>
              </section>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-3xl border border-[#d9e6dd] bg-white p-6 shadow-[0_18px_45px_rgba(40,88,62,.08)]">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
                Contact this business
              </p>
              <h2 className="mt-3 text-xl font-bold tracking-[-.03em] text-[#173f34]">
                Planning a visit?
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#71867e]">
                Reach out directly for reservations, availability, or more
                information.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                {listing.phone && (
                  <a
                    href={`tel:${listing.phone.replace(/[^+\d]/g, "")}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#133f35] px-4 py-3.5 text-sm font-bold text-white"
                  >
                    <Phone className="size-4" /> Call business
                  </a>
                )}
                {listing.email && (
                  <a
                    href={`mailto:${listing.email}`}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#cbded2] px-4 py-3.5 text-sm font-bold text-[#3f6d5b]"
                  >
                    <Mail className="size-4" /> Send an email
                  </a>
                )}
                {whatsapp ? (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#cbded2] px-4 py-3.5 text-sm font-bold text-[#3f6d5b]"
                  >
                    <MessageCircle className="size-4" /> Send enquiry
                  </a>
                ) : listing.email ? (
                  <a
                    href={`mailto:${listing.email}?subject=Enquiry about ${encodeURIComponent(title)}`}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#cbded2] px-4 py-3.5 text-sm font-bold text-[#3f6d5b]"
                  >
                    <MessageCircle className="size-4" /> Send enquiry
                  </a>
                ) : (
                  <Button className="flex items-center justify-center gap-2 rounded-xl border border-[#cbded2] px-4 py-3.5 text-sm font-bold text-[#3f6d5b]">
                    <MessageCircle className="size-4" /> Send enquiry
                  </Button>
                )}
              </div>
              {(listing.addressLine1 ||
                location ||
                listing.latitude !== null) && (
                  <div className="mt-6 border-t border-[#edf1ee] pt-5">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-[#4b8b71]" />
                      <div>
                        <p className="text-sm font-semibold text-[#42665a]">
                          {[listing.addressLine1, location]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {directionsHref ? (
                          <Link
                            href={directionsHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center text-xs font-bold text-[#4b8b71]"
                          >
                            Get directions{" "}
                            <ArrowRight className="ml-1 inline size-3.5" />
                          </Link>
                        ) : (
                          <p className="mt-2 text-xs font-bold text-[#4b8b71]">
                            Get directions{" "}
                            <ArrowRight className="ml-1 inline size-3.5" />
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              {listing.website && (
                <div className="mt-5 flex items-start gap-3">
                  <Globe2 className="mt-0.5 size-4 shrink-0 text-[#4b8b71]" />
                  <div>
                    <p className="text-sm font-semibold text-[#42665a]">
                      {websiteLabel(listing.website)}
                    </p>
                    <p className="mt-1 text-xs text-[#8aa097]">
                      Official website
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-[#e1e9e3] bg-[#edf6ef] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#315f50]">
                <ShieldCheck className="size-4" /> Listing quality checked
              </div>
              <p className="mt-2 text-xs leading-6 text-[#69847a]">
                This profile has been reviewed by the directory team. Information
                is kept up to date by the business owner.
              </p>
              <p className="mt-3 text-[11px] text-[#8aa197]">
                Last updated: {formatDate(listing.updatedAt)}
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-[#e1e9e3] bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-[.15em] text-[#78988a]">
                Opening hours
              </p>
              <OpeningHours openingHours={listing?.openingHours} />

            </div>
          </aside>
        </div>
      </section>

      <section className="border-t z-10 relative border-[#e1e9e3] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
                You may also like
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-.045em] text-[#173f34]">
                More places in {locationShort || "Bangladesh"}
              </h2>
            </div>
            <Link href="/#explore" className="text-sm font-bold text-[#36705e]">
              Explore all listings <ArrowRight className="ml-1 inline size-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {related.map((item) => <ListingCard key={item.id} item={item} /> )}
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-xl bg-[#edf5ef] text-[#4b8b71]">
        {icon}
      </span>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-[#8aa097]">
          {label}
        </p>
        <p className="mt-1 text-sm font-bold text-[#42665a]">{value}</p>
      </div>
    </div>
  );
}
