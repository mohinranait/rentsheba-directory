'use client'
import { BadgeCheck, LockKeyhole, MapPin, Search, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const locations = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Cox’s Bazar']
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('All locations')
  return (
    <section id="top" className="relative bg-white/50 overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.03fr_.97fr] lg:px-8 lg:py-28">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#bdd4c6]/70 bg-white/50 px-3 py-1.5 text-xs font-semibold text-[#36705e] backdrop-blur-md">
            <Sparkles className="size-3.5" /> Discover better, locally
          </div>
          <h1 className="max-w-2xl text-5xl font-bold leading-[1.02] tracking-[-0.07em] text-[#153e34] sm:text-6xl lg:text-7xl">
            Find the right <span className="text-[#4b8b71]">place</span> for
            everything.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#527067]">
            Explore trusted local businesses, professionals, and services
            across Bangladesh — all in one thoughtfully curated directory.
          </p>
          <div className="mt-9 flex max-w-2xl flex-col gap-2 rounded-2xl border border-white/60 bg-white/55 p-2 shadow-[0_18px_45px_rgba(36,79,59,.14)] backdrop-blur-xl sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
              <Search className="size-5 shrink-0 text-[#7d9b90]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[#9aafa7]"
              />
            </div>
            <div className="hidden w-px bg-[#e1eae4] sm:block" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border-t border-[#edf1ee] bg-transparent px-3 py-3 text-sm text-[#557068] outline-none sm:border-0"
            >
              <option>All locations</option>
              {locations.map((location) => (
                <option key={location}>{location}</option>
              ))}
            </select>
            <Button className="rounded-xl bg-[#d3f36b] px-5 py-3 text-sm font-bold text-[#193d32] hover:bg-[#c4e85d]">
              Search directory
            </Button>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#668279]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-[#4b8b71]" /> Verified
              businesses
            </span>
            <span className="flex items-center gap-1.5">
              <LockKeyhole className="size-4 text-[#4b8b71]" /> Safe &
              reliable
            </span>
            <span>12,000+ listings</span>
          </div>
        </div>
        <div className="relative hidden min-h-95 lg:block">
          <div className="absolute right-8 top-5 h-72 w-72 rounded-[45%] bg-[#d3f36b]/45 blur-[2px]" />
          <div className="absolute right-16 top-14 w-80 rounded-3xl border border-white/60 bg-white/55 p-5 shadow-[0_25px_60px_rgba(50,90,68,.2)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl border border-white/60 bg-white/70 text-lg font-bold text-[#2b6854]">
                  GL
                </div>
                <div>
                  <h3 className="font-bold">The Green Leaf</h3>
                  <p className="text-xs text-[#779188]">
                    Restaurant · Dhanmondi
                  </p>
                </div>
              </div>
              <BadgeCheck className="size-5 text-[#4b8b71]" />
            </div>
            <div className="mt-5 flex items-center gap-1 text-sm font-bold">
              <Star className="size-4 fill-[#e5b34f] text-[#e5b34f]" />{" "}
              4.9{" "}
              <span className="font-normal text-[#90a29b]">
                (128 reviews)
              </span>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-white/50 pt-4 text-xs text-[#6e877e]">
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" /> Dhanmondi, Dhaka
              </span>
              <span className="rounded-full border border-[#bfe0c9]/70 bg-[#edf7ef]/80 px-2 py-1 font-semibold text-[#4b8b71]">
                Open now
              </span>
            </div>
          </div>
          <div className="absolute bottom-4 left-8 rounded-2xl border border-white/60 bg-white/55 p-4 shadow-[0_18px_40px_rgba(50,90,68,.16)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl border border-white/60 bg-white/70 text-sm font-bold text-[#536686]">
                BC
              </div>
              <div>
                <p className="text-sm font-bold">Brightline Creative</p>
                <p className="text-xs text-[#84978f]">
                  Professional services
                </p>
              </div>
              <span className="ml-5 flex items-center gap-1 text-xs font-bold">
                <Star className="size-3 fill-[#e5b34f] text-[#e5b34f]" />{" "}
                5.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

  )
}

export default HeroSection