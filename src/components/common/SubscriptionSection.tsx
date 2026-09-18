import { ArrowRight, Check } from 'lucide-react'
import { Button } from '../ui/button'

const SubscriptionSection = () => {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-[#0e2a22] px-5 py-24 text-white lg:px-8"
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      <div className="absolute -right-24 top-0 h-80 w-80 rounded-[45%] bg-[#d3f36b]/10 blur-3xl" />
      <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-[45%] bg-[#4b8b71]/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
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
          <div className="rounded-2xl border border-white/15 bg-white/[.04] p-7 backdrop-blur-xl">
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
            <Button className="mt-8 w-full rounded-lg border border-white/25 bg-transparent py-3 text-sm font-bold text-white hover:bg-white/10">
              Start for free
            </Button>
          </div>
          <div className="relative rounded-2xl border border-white/25 bg-white/[.08] p-7 text-white shadow-[0_25px_60px_rgba(0,0,0,.25)] backdrop-blur-xl">
            <span className="absolute right-5 top-5 rounded-full bg-[#d3f36b] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#193d32]">
              Best value
            </span>
            <p className="text-sm font-bold text-[#b8df9d]">Pro yearly</p>
            <div className="mt-4 text-4xl font-bold">
              ৳2,490{" "}
              <span className="text-sm font-normal text-white/55">
                / year
              </span>
            </div>
            <p className="mt-3 text-sm text-white/65">
              More visibility, more room to grow.
            </p>
            <ul className="mt-7 flex flex-col gap-3 text-sm text-white/85">
              <li>
                <Check className="mr-2 inline size-4 text-[#d3f36b]" /> Add up to 5
                listings
              </li>
              <li>
                <Check className="mr-2 inline size-4 text-[#d3f36b]" /> Featured
                placement
              </li>
              <li>
                <Check className="mr-2 inline size-4 text-[#d3f36b]" /> Verified Pro
                badge
              </li>
              <li>
                <Check className="mr-2 inline size-4 text-[#d3f36b]" /> SSLCommerz
                payments
              </li>
            </ul>
            <Button className="mt-8 w-full rounded-lg bg-[#d3f36b] py-3 text-sm font-bold text-[#193d32] hover:bg-[#c4e85d]">
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