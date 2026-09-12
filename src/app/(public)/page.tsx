'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, BadgeCheck, Check, ChevronLeft, ChevronRight,  Globe2,  LockKeyhole, MapPin, Menu, Search, ShieldCheck, Sparkles, Star,  } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const categories = [
  ['Restaurants & Food', '2,480 listings', '🍽️'],
  ['Health & Wellness', '1,120 listings', '✚'],
  ['Home & Repair', '980 listings', '⌂'],
  ['Professional Services', '1,840 listings', '▣'],
  ['Shopping & Retail', '1,560 listings', '▱'],
  ['Education & Training', '720 listings', '▤'],
]

const locations = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Cox’s Bazar']
const listings = [
  { name: 'The Green Leaf Kitchen', cat: 'Restaurant · Dhanmondi', city: 'Dhaka', rating: '4.9', reviews: '128', tag: 'Editor’s pick', initials: 'GL', tone: 'bg-[#e7f0eb]' },
  { name: 'Nirvana Wellness Studio', cat: 'Health & Wellness · Gulshan', city: 'Dhaka', rating: '4.8', reviews: '86', tag: 'Top rated', initials: 'NW', tone: 'bg-[#f1e9dc]' },
  { name: 'Brightline Creative Co.', cat: 'Professional Services · Banani', city: 'Dhaka', rating: '5.0', reviews: '42', tag: 'Verified', initials: 'BC', tone: 'bg-[#e3eaf3]' },
]

export default function Home() {

  const [query, setQuery] = useState('')
  const [city, setCity] = useState('All locations')


  const filtered = useMemo(() => listings.filter((item) => {
    const matchesQuery = !query || `${item.name} ${item.cat}`.toLowerCase().includes(query.toLowerCase())
    const matchesCity = city === 'All locations' || item.city === city
    return matchesQuery && matchesCity
  }), [query, city])


  return (
    <main className="min-h-screen bg-[#f8faf9] text-[#17251f]">
      <div className="bg-[#133f35] px-4 py-2 text-center text-xs font-medium text-white/85">Bangladesh&apos;s trusted local business directory · List your business for free</div>
      <header className="sticky top-0 z-30 border-b border-[#dfe8e3] bg-[#f8faf9]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <a href="#top" className="flex items-center gap-2.5" aria-label="directory home">
            <span className="grid size-9 place-items-center rounded-xl bg-[#d3f36b] text-[#133f35]"><Globe2 className="size-5" /></span>
            <span className="text-xl font-bold tracking-[-0.04em]">directory<span className="text-[#4c796b]">.</span></span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#557068] md:flex">
            <a href="#explore" className="hover:text-[#133f35]">Explore</a><a href="#categories" className="hover:text-[#133f35]">Categories</a><a href="#pricing" className="hover:text-[#133f35]">Pricing</a><a href="#how" className="hover:text-[#133f35]">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              className="hidden bg-transparent rounded-lg px-3 py-2 text-sm font-semibold text-[#46645a] hover:bg-white md:block">Log in</Button><Button className="rounded-lg bg-[#133f35] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1d5548]">Add your listing <ArrowRight className="ml-1 inline size-4" /></Button><Button className="grid size-10 place-items-center rounded-lg border border-[#dfe8e3] md:hidden"><Menu className="size-5" /></Button></div>
        </div>
      </header>

      <section id="top" className="relative overflow-hidden bg-[#e8f2ec]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.03fr_.97fr] lg:px-8 lg:py-24">
          <div><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#bdd4c6] bg-white/60 px-3 py-1.5 text-xs font-semibold text-[#36705e]"><Sparkles className="size-3.5" /> Discover better, locally</div><h1 className="max-w-2xl text-5xl font-bold leading-[1.02] tracking-[-0.07em] text-[#153e34] sm:text-6xl lg:text-7xl">Find the right <span className="text-[#4b8b71]">place</span> for everything.</h1><p className="mt-6 max-w-lg text-lg leading-8 text-[#527067]">Explore trusted local businesses, professionals, and services across Bangladesh — all in one thoughtfully curated directory.</p>
            <div className="mt-9 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-[0_18px_45px_rgba(36,79,59,.12)] sm:flex-row"><div className="flex min-w-0 flex-1 items-center gap-3 px-3"><Search className="size-5 shrink-0 text-[#7d9b90]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="What are you looking for?" className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[#9aafa7]" /></div><div className="hidden w-px bg-[#e1eae4] sm:block" /><select value={city} onChange={(e) => setCity(e.target.value)} className="border-t border-[#edf1ee] bg-transparent px-3 py-3 text-sm text-[#557068] outline-none sm:border-0"><option>All locations</option>{locations.map((location) => <option key={location}>{location}</option>)}</select><Button  className="rounded-xl bg-[#d3f36b] px-5 py-3 text-sm font-bold text-[#193d32] hover:bg-[#c4e85d]">Search directory</Button></div>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#668279]"><span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-[#4b8b71]" /> Verified businesses</span><span className="flex items-center gap-1.5"><LockKeyhole className="size-4 text-[#4b8b71]" /> Safe & reliable</span><span>12,000+ listings</span></div>
          </div>
          <div className="relative hidden min-h-95 lg:block"><div className="absolute right-8 top-5 h-72 w-72 rounded-[45%] bg-[#d3f36b]/60 blur-[1px]" /><div className="absolute right-16 top-14 w-80 rounded-3xl border border-white/80 bg-white p-5 shadow-[0_25px_60px_rgba(50,90,68,.18)]"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-2xl bg-[#dfeee4] text-lg font-bold text-[#2b6854]">GL</div><div><h3 className="font-bold">The Green Leaf</h3><p className="text-xs text-[#779188]">Restaurant · Dhanmondi</p></div></div><BadgeCheck className="size-5 text-[#4b8b71]" /></div><div className="mt-5 flex items-center gap-1 text-sm font-bold"><Star className="size-4 fill-[#e5b34f] text-[#e5b34f]" /> 4.9 <span className="font-normal text-[#90a29b]">(128 reviews)</span></div><div className="mt-5 flex items-center justify-between border-t border-[#edf1ee] pt-4 text-xs text-[#6e877e]"><span className="flex items-center gap-1"><MapPin className="size-3.5" /> Dhanmondi, Dhaka</span><span className="rounded-full bg-[#edf7ef] px-2 py-1 font-semibold text-[#4b8b71]">Open now</span></div></div><div className="absolute bottom-4 left-8 rounded-2xl border border-white bg-white p-4 shadow-[0_18px_40px_rgba(50,90,68,.13)]"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#e9ecf4] text-sm font-bold text-[#536686]">BC</div><div><p className="text-sm font-bold">Brightline Creative</p><p className="text-xs text-[#84978f]">Professional services</p></div><span className="ml-5 flex items-center gap-1 text-xs font-bold"><Star className="size-3 fill-[#e5b34f] text-[#e5b34f]" /> 5.0</span></div></div></div>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">Browse by category</p><h2 className="mt-3 text-3xl font-bold tracking-[-.045em] text-[#173f34] sm:text-4xl">Something for every need</h2></div><a href="#explore" className="text-sm font-bold text-[#36705e]">View all categories <ArrowRight className="ml-1 inline size-4" /></a></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map(([name, count, icon]) => <a href="#explore" key={name} className="group rounded-2xl border border-[#e1e9e3] bg-white p-5 transition hover:-translate-y-1 hover:border-[#b9d4c5] hover:shadow-[0_12px_30px_rgba(43,92,67,.08)]"><div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-xl bg-[#edf5ef] text-xl text-[#3b7b63]">{icon}</span><ArrowRight className="size-4 text-[#b2c2bb] transition group-hover:translate-x-1 group-hover:text-[#4b8b71]" /></div><h3 className="mt-6 font-bold text-[#254b3f]">{name}</h3><p className="mt-1 text-sm text-[#81968d]">{count}</p></a>)}</div></section>

      <section id="explore" className="border-y border-[#e2eae4] bg-white"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">Curated for you</p><h2 className="mt-3 text-3xl font-bold tracking-[-.045em] text-[#173f34] sm:text-4xl">Popular near you</h2></div><div className="flex items-center gap-2"><Button className="grid size-9 place-items-center rounded-full border border-[#dfe8e3] text-[#789087]"><ChevronLeft className="size-4" /></Button><Button className="grid size-9 place-items-center rounded-full border border-[#dfe8e3] text-[#789087]"><ChevronRight className="size-4" /></Button></div></div><div className="mt-8 grid gap-5 md:grid-cols-3">{filtered.length ? filtered.map((item) => <Link 
      href={`/listing/asdf`}
       key={item.name} 
      
        className="overflow-hidden rounded-2xl border border-[#e1e9e3] bg-[#fbfdfb]"
        ><div className={`flex h-28 items-end justify-between p-4 ${item.tone}`}><span className="rounded-full bg-white/75 px-2.5 py-1 text-[11px] font-bold text-[#4a7465]">{item.tag}</span><span className="grid size-12 place-items-center rounded-xl bg-white/70 text-sm font-bold text-[#456b5e]">{item.initials}</span></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-[#254b3f]">{item.name}</h3><p className="mt-1 text-xs text-[#82968d]">{item.cat}</p></div><BadgeCheck className="size-5 shrink-0 text-[#4b8b71]" /></div><div className="mt-5 flex items-center justify-between text-xs"><span className="flex items-center gap-1 font-bold"><Star className="size-3.5 fill-[#e5b34f] text-[#e5b34f]" /> {item.rating} <span className="font-normal text-[#91a29c]">({item.reviews})</span></span><span className="flex items-center gap-1 text-[#7d9289]"><MapPin className="size-3.5" /> {item.city}</span></div></div></Link>) : <div className="col-span-3 rounded-2xl border border-dashed border-[#cbdcd1] p-10 text-center text-sm text-[#6d887d]">No listings match your search yet. Try another location or keyword.</div>}</div></div></section>

      <section id="how" className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">Simple by design</p><h2 className="mt-3 text-3xl font-bold tracking-[-.045em] text-[#173f34] sm:text-4xl">Get discovered in three steps.</h2><p className="mt-5 max-w-md leading-7 text-[#6f867d]">Whether you&apos;re looking for a trusted service or growing your business, directory makes the next step clear.</p><Button  className="mt-7 rounded-lg bg-[#133f35] px-5 py-3 text-sm font-bold text-white">List your business <ArrowRight className="ml-1 inline size-4" /></Button></div><div className="grid gap-4 sm:grid-cols-3">{[['01', 'Create your profile', 'Tell us what you do, where you are, and how people can reach you.'], ['02', 'Get verified', 'Our team reviews every listing to keep the directory trustworthy.'], ['03', 'Grow your reach', 'Show up when people search for exactly what you offer.']].map(([n, t, d]) => <div key={n} className="rounded-2xl border border-[#e1e9e3] bg-white p-5"><span className="text-sm font-bold text-[#7aa08f]">{n}</span><h3 className="mt-14 font-bold text-[#254b3f]">{t}</h3><p className="mt-2 text-sm leading-6 text-[#81968d]">{d}</p></div>)}</div></div></section>

      <section id="pricing" className="bg-[#153f35] px-5 py-20 text-white lg:px-8"><div className="mx-auto max-w-7xl"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#b8df9d]">Plans that grow with you</p><h2 className="mt-3 text-3xl font-bold tracking-[-.045em] sm:text-4xl">Start free. Be found everywhere.</h2><p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/65">Simple pricing for local businesses, independent professionals, and growing teams.</p></div><div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2"><div className="rounded-2xl border border-white/15 bg-white/5 p-7"><p className="text-sm font-bold text-white/70">Free listing</p><div className="mt-4 text-4xl font-bold">৳0 <span className="text-sm font-normal text-white/50">forever</span></div><p className="mt-3 text-sm text-white/60">A simple start for getting online.</p><ul className="mt-7 flex flex-col gap-3 text-sm text-white/75"><li><Check className="mr-2 inline size-4 text-[#b8df9d]" /> Add 2 listings</li><li><Check className="mr-2 inline size-4 text-[#b8df9d]" /> Basic business profile</li><li><Check className="mr-2 inline size-4 text-[#b8df9d]" /> Search visibility</li></ul><Button className="mt-8 w-full bg-transparent rounded-lg border border-white/25 py-3 text-sm font-bold text-white hover:bg-white/10">Start for free</Button></div><div className="relative rounded-2xl bg-[#d3f36b] p-7 text-[#193d32]"><span className="absolute right-5 top-5 rounded-full bg-[#193d32] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#d3f36b]">Best value</span><p className="text-sm font-bold text-[#315d4c]">Pro yearly</p><div className="mt-4 text-4xl font-bold">৳2,490 <span className="text-sm font-normal text-[#547667]">/ year</span></div><p className="mt-3 text-sm text-[#557667]">More visibility, more room to grow.</p><ul className="mt-7 flex flex-col gap-3 text-sm text-[#315d4c]"><li><Check className="mr-2 inline size-4" /> Add up to 5 listings</li><li><Check className="mr-2 inline size-4" /> Featured placement</li><li><Check className="mr-2 inline size-4" /> Verified Pro badge</li><li><Check className="mr-2 inline size-4" /> SSLCommerz payments</li></ul><Button className="mt-8 w-full rounded-lg bg-[#133f35] py-3 text-sm font-bold text-white hover:bg-[#1d5548]">Choose Pro yearly <ArrowRight className="ml-1 inline size-4" /></Button></div></div></div></section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-xs text-[#7c9289] sm:flex-row sm:items-center sm:justify-between lg:px-8"><div className="flex items-center gap-2 font-bold text-[#31594c]"><span className="grid size-6 place-items-center rounded-md bg-[#d3f36b]"><Globe2 className="size-3.5" /></span> directory.</div><div className="flex flex-wrap gap-5"><a href="#top">About</a><a href="#pricing">Pricing</a><a href="#how">Help center</a><a href="#top">Privacy</a><Button className="font-semibold text-[#4b7464]">Admin preview</Button></div><span>© 2025 directory. Made for local.</span></footer>


    </main>
  )
}
