
import { ArrowRight, Globe2, Menu } from 'lucide-react'
import { Button } from '../ui/button'

const Header = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#dfe8e3] bg-[#f8faf9]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <a
          href="#top"
          className="flex items-center gap-2.5"
          aria-label="directory home"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-[#d3f36b] text-[#133f35]">
            <Globe2 className="size-5" />
          </span>
          <span className="text-xl font-bold tracking-[-0.04em]">
            directory<span className="text-[#4c796b]">.</span>
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-[#557068] md:flex">
          <a href="#explore" className="hover:text-[#133f35]">
            Explore
          </a>
          <a href="#categories" className="hover:text-[#133f35]">
            Categories
          </a>
          <a href="#pricing" className="hover:text-[#133f35]">
            Pricing
          </a>
          <a href="#how" className="hover:text-[#133f35]">
            How it works
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button className="hidden bg-transparent rounded-lg px-3 py-2 text-sm font-semibold text-[#46645a] hover:bg-white md:block">
            Log in
          </Button>
          <Button className="rounded-lg bg-[#133f35] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1d5548]">
            Add your listing <ArrowRight className="ml-1 inline size-4" />
          </Button>
          <Button className="grid size-10 place-items-center rounded-lg border border-[#dfe8e3] md:hidden">
            <Menu className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header