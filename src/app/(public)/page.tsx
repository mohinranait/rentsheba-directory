'use client'


import { ArrowRight,  ChevronLeft, ChevronRight } from 'lucide-react'
import ListingCard from '@/components/common/ListingCard'
import SubscriptionSection from '@/components/common/SubscriptionSection'
import { Button } from '@/components/ui/button'
import CategoriesGrid from './components/CategoriesGrid'
import CreateListingSteps from './components/CreateListingSteps'
import HeroSection from './components/HeroSection'

const listings = [
  { name: 'The Green Leaf Kitchen', cat: 'Restaurant · Dhanmondi', city: 'Dhaka', rating: '4.9', reviews: '128', tag: 'Editor’s pick', initials: 'GL', tone: 'bg-[#e7f0eb]' },
  { name: 'Nirvana Wellness Studio', cat: 'Health & Wellness · Gulshan', city: 'Dhaka', rating: '4.8', reviews: '86', tag: 'Top rated', initials: 'NW', tone: 'bg-[#f1e9dc]' },
  { name: 'Brightline Creative Co.', cat: 'Professional Services · Banani', city: 'Dhaka', rating: '5.0', reviews: '42', tag: 'Verified', initials: 'BC', tone: 'bg-[#e3eaf3]' },
]

export default function Home() {


  return (
    <>



      <HeroSection />

      <section id="categories" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
              Browse by category
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-.045em] text-[#173f34] sm:text-4xl">
              Something for every need
            </h2>
          </div>
          <a href="#explore" className="text-sm font-bold text-[#36705e]">
            View all categories <ArrowRight className="ml-1 inline size-4" />
          </a>
        </div>
        <CategoriesGrid />
      </section>

      <section id="explore" className="border-y border-[#e2eae4] bg-white">
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
            <div className="flex items-center gap-2">
              <Button className="grid size-9 place-items-center rounded-full border border-[#dfe8e3] text-[#789087]">
                <ChevronLeft className="size-4" />
              </Button>
              <Button className="grid size-9 place-items-center rounded-full border border-[#dfe8e3] text-[#789087]">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {listings.length ? (
              listings.map((item) => <ListingCard   key={item.name} item={item} />)
            ) : (
              <div className="col-span-3 rounded-2xl border border-dashed border-[#cbdcd1] p-10 text-center text-sm text-[#6d887d]">
                No listings match your search yet. Try another location or
                keyword.
              </div>
            )}
          </div>
        </div>
      </section>

     <CreateListingSteps />


      <SubscriptionSection />


    </>
  )
}
