'use client'

import {  ArrowRight, BadgeCheck, CalendarDays, Check, ChevronDown, Clock3, Globe2, Heart, Mail, MapPin, MessageCircle, Navigation, Phone, Share2, ShieldCheck, Star, Tag, Users } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function ListingDetails() {
  const [saved, setSaved] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'The Green Leaf Kitchen',
    description: 'The Green Leaf Kitchen is a contemporary restaurant in Dhanmondi serving fresh, seasonal Bangladeshi and international comfort food.',
    url: 'https://directory.example/listing/the-green-leaf-kitchen-dhanmondi',
    telephone: '+880 1712-345678',
    email: 'hello@greenleaf.example',
    address: { '@type': 'PostalAddress', streetAddress: 'House 14, Road 7A, Dhanmondi, Dhaka 1209', addressLocality: 'Dhaka', addressCountry: 'BD' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: 128 },
    foundingDate: '2018', priceRange: '$$',
  }

  return (
   <>
   
   
    <section className="border-b border-[#deebe1] bg-[#e8f2ec]">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#5d8172]">
                <Link href="/#explore">Explore</Link>
                <span>/</span>
                <Link href="/#categories">Restaurant &amp; Food</Link>
                <span>/</span>
                <span>Dhanmondi</span>
            </div>
            <div className="mt-7 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-bold text-[#4b7966]">
                            Editor&apos;s pick
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold text-[#4b7966]">
                            <BadgeCheck className="size-4" /> Verified listing
                        </span>
                    </div>
                    <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-[-.06em] text-[#153e34] sm:text-5xl lg:text-6xl">
                        The Green Leaf Kitchen
                    </h1>
                    <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#5d7b70]">
                        <span className="flex items-center gap-1.5">
                            <Tag className="size-4" /> Restaurant &amp; Food
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MapPin className="size-4" /> Dhanmondi, Dhaka
                        </span>
                        <span className="flex items-center gap-1.5 font-bold text-[#365f50]">
                            <Star className="size-4 fill-[#e5b34f] text-[#e5b34f]" />{" "}
                            4.9 (128 reviews)
                        </span>
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={() => setSaved(!saved)}
                        className="flex items-center gap-2 rounded-xl border border-[#bfd6c7] bg-white/65 px-4 py-3 text-sm font-bold text-[#42695b]"
                    >
                        <Heart
                            className={`size-4 ${saved ? "fill-[#4b8b71] text-[#4b8b71]" : ""}`}
                        />{" "}
                        {saved ? "Saved" : "Save listing"}
                    </Button>
                    <Button className="flex items-center gap-2 rounded-xl border border-[#bfd6c7] bg-white/65 px-4 py-3 text-sm font-bold text-[#42695b]">
                        <Share2 className="size-4" /> Share
                    </Button>
                </div>
            </div>
        </div>
    </section>
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_350px] lg:px-8 lg:py-16">
        <div className="min-w-0">
            <div className="overflow-hidden rounded-3xl border border-[#e0e9e3] bg-white">
                <div className="flex h-64 items-end justify-between bg-[linear-gradient(120deg,#d7e8da,#f1e8d5_56%,#d8e2ee)] p-6 sm:h-80">
                    <div className="rounded-2xl bg-white/70 px-4 py-3 backdrop-blur">
                        <p className="text-xs font-bold uppercase tracking-[.15em] text-[#52796a]">
                            Restaurant &amp; Food
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#254d40]">
                            A considered table in the heart of Dhanmondi
                        </p>
                    </div>
                    <span className="grid size-16 place-items-center rounded-2xl bg-white/75 text-xl font-bold text-[#2e6c57] shadow-sm">
                        GL
                    </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#edf1ee] px-6 py-5">
                    <div className="flex flex-wrap gap-4 text-sm text-[#6d857b]">
                        <span className="flex items-center gap-2">
                            <Clock3 className="size-4 text-[#4b8b71]" /> Open
                            today until 10:30 PM
                        </span>
                        <span className="flex items-center gap-2">
                            <ShieldCheck className="size-4 text-[#4b8b71]" />{" "}
                            Claimed profile
                        </span>
                    </div>
                    <span className="rounded-full bg-[#edf7ef] px-3 py-1.5 text-xs font-bold text-[#4b8b71]">
                        Usually responds quickly
                    </span>
                </div>
            </div>
            <section className="mt-8 rounded-3xl border border-[#e0e9e3] bg-white p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
                    About the business
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-[-.04em] text-[#173f34]">
                    Good food, thoughtfully made.
                </h2>
                <p className="mt-5 max-w-3xl text-[15px] leading-8 text-[#607970]">
                    The Green Leaf Kitchen is a contemporary restaurant in
                    Dhanmondi serving fresh, seasonal Bangladeshi and
                    international comfort food. Our kitchen brings together
                    familiar flavours, thoughtful ingredients, and warm
                    hospitality for everyday lunches, family dinners,
                    celebrations, and private events.
                </p>
                <div className="mt-7 grid gap-4 border-t border-[#edf1ee] pt-6 sm:grid-cols-3">
                    <InfoItem
                        icon={<CalendarDays className="size-4" />}
                        label="Established"
                        value="2018"
                    />
                    <InfoItem
                        icon={<Users className="size-4" />}
                        label="Best for"
                        value="Families & groups"
                    />
                    <InfoItem
                        icon={<Navigation className="size-4" />}
                        label="Area served"
                        value="Dhanmondi & nearby"
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
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {[
                        "Dine-in",
                        "Takeaway",
                        "Home delivery",
                        "Private events",
                        "Birthday reservations",
                        "Corporate lunch",
                        "Vegetarian options",
                        "Catering",
                    ].map((service) => (
                        <div
                            key={service}
                            className="flex items-center gap-3 rounded-xl bg-[#f4f8f4] px-4 py-3 text-sm font-semibold text-[#527268]"
                        >
                            <Check className="size-4 text-[#4b8b71]" />{" "}
                            {service}
                        </div>
                    ))}
                </div>
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
                            4.9
                        </p>
                        <p className="text-xs text-[#80958c]">
                            128 verified reviews
                        </p>
                    </div>
                </div>
                <div className="mt-7 flex flex-col gap-5">
                    {[
                        {
                            name: "Farhan R.",
                            date: "2 weeks ago",
                            text: "A calm, beautiful spot for dinner. The food was fresh, portions were generous, and the team was genuinely welcoming.",
                            rating: "5.0",
                        },
                        {
                            name: "Nusrat A.",
                            date: "1 month ago",
                            text: "The family brunch menu is excellent. Loved the seasonal salad and the attention to detail throughout the meal.",
                            rating: "4.8",
                        },
                        {
                            name: "Sabbir H.",
                            date: "2 months ago",
                            text: "We booked the private room for a small team dinner. Smooth service, easy communication, and very good food.",
                            rating: "5.0",
                        },
                    ].map((review) => (
                        <article
                            key={review.name}
                            className="border-t border-[#edf1ee] pt-5"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-bold text-[#31594c]">
                                        {review.name}
                                    </h3>
                                    <p className="mt-1 text-xs text-[#8aa097]">
                                        {review.date} · Verified visit
                                    </p>
                                </div>
                                <span className="flex items-center gap-1 text-xs font-bold text-[#537366]">
                                    <Star className="size-3.5 fill-[#e5b34f] text-[#e5b34f]" />{" "}
                                    {review.rating}
                                </span>
                            </div>
                            <p className="mt-3 text-sm leading-7 text-[#657d74]">
                                {review.text}
                            </p>
                        </article>
                    ))}
                </div>
                <Button className="mt-6 rounded-xl border border-[#cbded2] px-4 py-2.5 text-sm font-bold text-[#3e6d5b]">
                    Read all reviews
                </Button>
            </section>
            <section className="mt-8 rounded-3xl border border-[#e0e9e3] bg-white p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
                    Frequently asked questions
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-[-.04em] text-[#173f34]">
                    Questions about The Green Leaf Kitchen
                </h2>
                <div className="mt-6 divide-y divide-[#edf1ee]">
                    {[
                        [
                            "Does The Green Leaf Kitchen take reservations?",
                            "Yes. Reservations are recommended for dinner, weekends, and private events. You can call the team or send an enquiry from this page.",
                        ],
                        [
                            "Does the restaurant offer delivery in Dhanmondi?",
                            "Yes. Delivery is available across Dhanmondi and nearby areas. Availability and delivery fees may vary by time and distance.",
                        ],
                        [
                            "Are vegetarian options available?",
                            "Yes. The menu includes several vegetarian dishes, and the kitchen can help with common dietary preferences when notified in advance.",
                        ],
                        [
                            "Can I book the venue for a private event?",
                            "Yes. The team supports birthdays, corporate lunches, and intimate celebrations. Contact the restaurant for menu and availability details.",
                        ],
                    ].map(([question, answer], index) => (
                        <div
                            key={question}
                            className="py-4 first:pt-0 last:pb-0"
                        >
                            <Button
                                onClick={() =>
                                    setOpenFaq(openFaq === index ? null : index)
                                }
                                className="flex w-full items-center justify-between gap-4 text-left text-sm font-bold text-[#31594c]"
                            >
                                <span>{question}</span>
                                <ChevronDown
                                    className={`size-4 shrink-0 text-[#719286] transition ${openFaq === index ? "rotate-180" : ""}`}
                                />
                            </Button>
                            {openFaq === index && (
                                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#71867e]">
                                    {answer}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </section>
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
                    <a
                        href="tel:+8801712345678"
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#133f35] px-4 py-3.5 text-sm font-bold text-white"
                    >
                        <Phone className="size-4" /> Call business
                    </a>
                    <a
                        href="mailto:hello@greenleaf.example"
                        className="flex items-center justify-center gap-2 rounded-xl border border-[#cbded2] px-4 py-3.5 text-sm font-bold text-[#3f6d5b]"
                    >
                        <Mail className="size-4" /> Send an email
                    </a>
                    <Button className="flex items-center justify-center gap-2 rounded-xl border border-[#cbded2] px-4 py-3.5 text-sm font-bold text-[#3f6d5b]">
                        <MessageCircle className="size-4" /> Send enquiry
                    </Button>
                </div>
                <div className="mt-6 border-t border-[#edf1ee] pt-5">
                    <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-[#4b8b71]" />
                        <div>
                            <p className="text-sm font-semibold text-[#42665a]">
                                House 14, Road 7A, Dhanmondi, Dhaka 1209
                            </p>
                            <Button className="mt-2 text-xs font-bold text-[#4b8b71]">
                                Get directions{" "}
                                <ArrowRight className="ml-1 inline size-3.5" />
                            </Button>
                        </div>
                    </div>
                    <div className="mt-5 flex items-start gap-3">
                        <Globe2 className="mt-0.5 size-4 shrink-0 text-[#4b8b71]" />
                        <div>
                            <p className="text-sm font-semibold text-[#42665a]">
                                greenleafkitchen.example
                            </p>
                            <p className="mt-1 text-xs text-[#8aa097]">
                                Official website
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-5 rounded-2xl border border-[#e1e9e3] bg-[#edf6ef] p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-[#315f50]">
                    <ShieldCheck className="size-4" /> Listing quality checked
                </div>
                <p className="mt-2 text-xs leading-6 text-[#69847a]">
                    This profile has been reviewed by the directory team.
                    Information was last updated by the business owner.
                </p>
                <p className="mt-3 text-[11px] text-[#8aa197]">
                    Last updated: 12 September 2026
                </p>
            </div>
            <div className="mt-5 rounded-2xl border border-[#e1e9e3] bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[.15em] text-[#78988a]">
                    Opening hours
                </p>
                <div className="mt-4 flex flex-col gap-3">
                    {[
                        ["Monday", "11:00 AM – 10:30 PM"],
                        ["Tuesday", "11:00 AM – 10:30 PM"],
                        ["Wednesday", "11:00 AM – 10:30 PM"],
                        ["Thursday", "11:00 AM – 10:30 PM"],
                        ["Friday", "12:00 PM – 11:00 PM"],
                        ["Saturday", "12:00 PM – 11:00 PM"],
                        ["Sunday", "11:00 AM – 10:30 PM"],
                    ].map(([day, time]) => (
                        <div
                            key={day}
                            className="flex justify-between gap-3 text-xs"
                        >
                            <span
                                className={
                                    day === "Monday"
                                        ? "font-bold text-[#31594c]"
                                        : "text-[#758b82]"
                                }
                            >
                                {day}
                            </span>
                            <span className="text-right text-[#58776a]">
                                {time}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    </div>
    <section className="border-t border-[#e1e9e3] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
                        You may also like
                    </p>
                    <h2 className="mt-3 text-3xl font-bold tracking-[-.045em] text-[#173f34]">
                        More places in Dhaka
                    </h2>
                </div>
                <Link
                    href="/#explore"
                    className="text-sm font-bold text-[#36705e]"
                >
                    Explore all listings{" "}
                    <ArrowRight className="ml-1 inline size-4" />
                </Link>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
                {[
                    "Nirvana Wellness Studio",
                    "Brightline Creative Co.",
                    "Dhanmondi Book House",
                ].map((name, index) => (
                    <Link
                        key={name}
                        href={`/listing/${index === 0 ? "nirvana-wellness-studio-gulshan" : index === 1 ? "brightline-creative-co-banani" : "dhanmondi-book-house"}`}
                        className="group rounded-2xl border border-[#e1e9e3] bg-[#fbfdfb] p-5 transition hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(43,92,67,.08)]"
                    >
                        <div className="flex items-center justify-between">
                            <span className="grid size-11 place-items-center rounded-xl bg-[#edf5ef] text-sm font-bold text-[#3b7b63]">
                                {name
                                    .split(" ")
                                    .map((word) => word[0])
                                    .slice(0, 2)
                                    .join("")}
                            </span>
                            <BadgeCheck className="size-5 text-[#4b8b71]" />
                        </div>
                        <h3 className="mt-5 font-bold text-[#254b3f]">
                            {name}
                        </h3>
                        <p className="mt-1 text-xs text-[#82968d]">
                            Professional services · Dhaka
                        </p>
                        <p className="mt-5 flex items-center gap-1 text-xs font-bold text-[#56786a]">
                            <Star className="size-3.5 fill-[#e5b34f] text-[#e5b34f]" />{" "}
                            {index === 2 ? "4.7" : index === 0 ? "4.8" : "5.0"}{" "}
                            <span className="font-normal text-[#91a29c]">
                                · Dhaka
                            </span>
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    </section>

</>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { 
  return <div className="flex items-center gap-3">
    <span className="grid size-9 place-items-center rounded-xl bg-[#edf5ef] text-[#4b8b71]">{icon}</span>
    <div>
      <p className="text-[11px] uppercase tracking-wider text-[#8aa097]">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#42665a]">{value}</p>
    </div>
  </div>
 }
