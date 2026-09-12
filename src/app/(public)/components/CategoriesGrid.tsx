import { ArrowRight } from 'lucide-react'

const categories = [
  ['Restaurants & Food', '2,480 listings', '🍽️'],
  ['Health & Wellness', '1,120 listings', '✚'],
  ['Home & Repair', '980 listings', '⌂'],
  ['Professional Services', '1,840 listings', '▣'],
  ['Shopping & Retail', '1,560 listings', '▱'],
  ['Education & Training', '720 listings', '▤'],
]


const CategoriesGrid = () => {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map(([name, count, icon]) => (
        <a
          href="#explore"
          key={name}
          className="group rounded-2xl border border-[#e1e9e3] bg-white p-5 transition hover:-translate-y-1 hover:border-[#b9d4c5] hover:shadow-[0_12px_30px_rgba(43,92,67,.08)]"
        >
          <div className="flex items-center justify-between">
            <span className="grid size-11 place-items-center rounded-xl bg-[#edf5ef] text-xl text-[#3b7b63]">
              {icon}
            </span>
            <ArrowRight className="size-4 text-[#b2c2bb] transition group-hover:translate-x-1 group-hover:text-[#4b8b71]" />
          </div>
          <h3 className="mt-6 font-bold text-[#254b3f]">{name}</h3>
          <p className="mt-1 text-sm text-[#81968d]">{count}</p>
        </a>
      ))}
    </div>
  )
}

export default CategoriesGrid