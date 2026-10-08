import { Globe2 } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="z-10 relative bg-white/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-xs text-[#7c9289] sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex items-center gap-2 font-bold text-[#31594c]">
          <span className="grid size-6 place-items-center rounded-md bg-[#d3f36b]">
            <Globe2 className="size-3.5" />
          </span>{" "}
          Rentsheba.
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-5">
          <a href="/#top" className="hover:text-[#173f34]">About</a>
          <a href="/#pricing" className="hover:text-[#173f34]">Pricing</a>
          <Link href="/contact" className="hover:text-[#173f34]">Contact Us</Link>
          <a href="/#how" className="hover:text-[#173f34]">Help center</a>
          <a href="/#top" className="hover:text-[#173f34]">Privacy</a>
        </nav>
        <span>© {new Date().getFullYear()} Rentsheba Directory. All rights reserved.</span>
      </div>
    </footer>

  )
}

export default Footer