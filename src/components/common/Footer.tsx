import { Globe2 } from "lucide-react"
import { Button } from "../ui/button"


const Footer = () => {
  return (
    <footer className="z-10 relative bg-white/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-xs text-[#7c9289] sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex items-center gap-2 font-bold text-[#31594c]">
          <span className="grid size-6 place-items-center rounded-md bg-[#d3f36b]">
            <Globe2 className="size-3.5" />
          </span>{" "}
          directory.
        </div>
        <div className="flex flex-wrap gap-5">
          <a href="#top">About</a>
          <a href="#pricing">Pricing</a>
          <a href="#how">Help center</a>
          <a href="#top">Privacy</a>
          <Button className="font-semibold text-[#4b7464]">Admin preview</Button>
        </div>
        <span>© 2025 directory. Made for local.</span>
      </div>
    </footer>

  )
}

export default Footer