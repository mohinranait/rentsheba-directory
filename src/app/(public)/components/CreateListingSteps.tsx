import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CreateListingSteps = () => {
  return (
    <section id="how" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
            Simple by design
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-.045em] text-[#173f34] sm:text-4xl">
            Get discovered in three steps.
          </h2>
          <p className="mt-5 max-w-md leading-7 text-[#6f867d]">
            Whether you&apos;re looking for a trusted service or growing
            your business, directory makes the next step clear.
          </p>
          <Button className="mt-7 rounded-lg bg-[#133f35] px-5 py-3 text-sm font-bold text-white">
            List your business <ArrowRight className="ml-1 inline size-4" />
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [
              "01",
              "Create your profile",
              "Tell us what you do, where you are, and how people can reach you.",
            ],
            [
              "02",
              "Get verified",
              "Our team reviews every listing to keep the directory trustworthy.",
            ],
            [
              "03",
              "Grow your reach",
              "Show up when people search for exactly what you offer.",
            ],
          ].map(([n, t, d]) => (
            <div
              key={n}
              className="rounded-2xl border border-[#e1e9e3] bg-white p-5"
            >
              <span className="text-sm font-bold text-[#7aa08f]">
                {n}
              </span>
              <h3 className="mt-14 font-bold text-[#254b3f]">{t}</h3>
              <p className="mt-2 text-sm leading-6 text-[#81968d]">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CreateListingSteps