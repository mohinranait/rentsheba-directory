import { ArrowRight, Check } from 'lucide-react'
import { Button } from '../ui/button'

const SubscriptionSection = () => {
  return (
    <section id="pricing" className="bg-[#153f35] px-5 py-20 text-white lg:px-8">
    <div className="mx-auto max-w-7xl">
        <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#b8df9d]">
                Plans that grow with you
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-.045em] sm:text-4xl">
                Start free. Be found everywhere.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/65">
                Simple pricing for local businesses, independent professionals,
                and growing teams.
            </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-7">
                <p className="text-sm font-bold text-white/70">Free listing</p>
                <div className="mt-4 text-4xl font-bold">
                    ৳0{" "}
                    <span className="text-sm font-normal text-white/50">
                        forever
                    </span>
                </div>
                <p className="mt-3 text-sm text-white/60">
                    A simple start for getting online.
                </p>
                <ul className="mt-7 flex flex-col gap-3 text-sm text-white/75">
                    <li>
                        <Check className="mr-2 inline size-4 text-[#b8df9d]" />{" "}
                        Add 2 listings
                    </li>
                    <li>
                        <Check className="mr-2 inline size-4 text-[#b8df9d]" />{" "}
                        Basic business profile
                    </li>
                    <li>
                        <Check className="mr-2 inline size-4 text-[#b8df9d]" />{" "}
                        Search visibility
                    </li>
                </ul>
                <Button className="mt-8 w-full bg-transparent rounded-lg border border-white/25 py-3 text-sm font-bold text-white hover:bg-white/10">
                    Start for free
                </Button>
            </div>
            <div className="relative rounded-2xl bg-[#d3f36b] p-7 text-[#193d32]">
                <span className="absolute right-5 top-5 rounded-full bg-[#193d32] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#d3f36b]">
                    Best value
                </span>
                <p className="text-sm font-bold text-[#315d4c]">Pro yearly</p>
                <div className="mt-4 text-4xl font-bold">
                    ৳2,490{" "}
                    <span className="text-sm font-normal text-[#547667]">
                        / year
                    </span>
                </div>
                <p className="mt-3 text-sm text-[#557667]">
                    More visibility, more room to grow.
                </p>
                <ul className="mt-7 flex flex-col gap-3 text-sm text-[#315d4c]">
                    <li>
                        <Check className="mr-2 inline size-4" /> Add up to 5
                        listings
                    </li>
                    <li>
                        <Check className="mr-2 inline size-4" /> Featured
                        placement
                    </li>
                    <li>
                        <Check className="mr-2 inline size-4" /> Verified Pro
                        badge
                    </li>
                    <li>
                        <Check className="mr-2 inline size-4" /> SSLCommerz
                        payments
                    </li>
                </ul>
                <Button className="mt-8 w-full rounded-lg bg-[#133f35] py-3 text-sm font-bold text-white hover:bg-[#1d5548]">
                    Choose Pro yearly{" "}
                    <ArrowRight className="ml-1 inline size-4" />
                </Button>
            </div>
        </div>
    </div>
</section>

  )
}

export default SubscriptionSection