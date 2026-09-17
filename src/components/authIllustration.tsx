
import {
  Check,
  Heart,
  LucideIcon,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";

type AuthIllustrationProps = {
  eyebrow: string;
  heading: string;
  body: string;
  features?: {
    icon: LucideIcon;
    title: string;
    description: string;
  }[]
};

export function AuthIllustration({
  eyebrow,
  heading,
  body,
  features
}: AuthIllustrationProps) {
  return (
    <section className="relative hidden min-h-[680px] overflow-hidden bg-primary/[0.035] lg:block">
      {/* Soft background shapes */}
      <div className="absolute -left-24 -top-24 size-80 rounded-full bg-primary/[0.08] blur-3xl" />

      <div className="absolute -bottom-32 -right-24 size-96 rounded-full bg-primary/[0.08] blur-3xl" />

      {/* Dot pattern */}
      <div
        className="absolute right-12 top-24 size-28 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--primary)) 1.5px, transparent 1.5px)",
          backgroundSize: "14px 14px",
        }}
      />

      <div className="relative z-10 flex h-full min-h-[680px] flex-col p-8 xl:p-10">
        {/* ================================================================
            BRAND
        ================================================================= */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Check className="size-6" strokeWidth={2.5} />
          </div>

          <div>
            <p className="text-base font-bold tracking-tight text-foreground">
              Rentsheba
            </p>

            <p className="text-xs text-muted-foreground">
              আপনার বিশ্বস্ত ডিরেক্টরি
            </p>
          </div>
        </div>

        {/* ================================================================
            CONTENT
        ================================================================= */}
        <div className="mt-12 max-w-[480px] xl:mt-14">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/[0.06] px-3.5 py-2 text-xs font-medium text-primary">
            <span className="size-1.5 rounded-full bg-primary" />

            {eyebrow}
          </div>

          <h2 className="mt-5 text-3xl font-bold leading-[1.25] tracking-tight text-foreground xl:text-[38px]">
            {heading}
          </h2>

          <p className="mt-4 max-w-[440px] text-sm leading-7 text-muted-foreground">
            {body}
          </p>
        </div>

        {/* ================================================================
            FEATURES
        ================================================================= */}
        <div className="mt-7 space-y-2.5">
         {features?.map((feature) => (
            <Feature
              key={feature.title}
              icon={<feature.icon className="size-5" />}
              title={feature.title}
              description={feature.description}
            />
          ))}
         

        
        </div>

        {/* ================================================================
            BOTTOM VISUAL
        ================================================================= */}
        <div className="relative mt-auto pt-8">
          <DirectoryScene />
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Feature
// ---------------------------------------------------------------------------

function Feature({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-background text-primary shadow-sm">
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Directory scene
// ---------------------------------------------------------------------------

function DirectoryScene() {
  return (
    <div className="relative mx-auto h-[235px] w-full max-w-[490px]">
      {/* ================================================================
          BACKGROUND CITY
      ================================================================= */}
      <div className="absolute inset-x-0 bottom-0 h-[155px] overflow-hidden rounded-t-[80px] bg-primary/[0.035]">
        {/* buildings */}
        <Building
          className="absolute bottom-0 left-[8%] h-[70px] w-[45px]"
        />

        <Building
          className="absolute bottom-0 left-[20%] h-[105px] w-[55px]"
        />

        <Building
          className="absolute bottom-0 left-[34%] h-[80px] w-[48px]"
        />

        <Building
          className="absolute bottom-0 left-[47%] h-31.25 w-14.5"
          featured
        />

        <Building
          className="absolute bottom-0 left-[62%] h-[92px] w-[52px]"
        />

        <Building
          className="absolute bottom-0 left-[76%] h-[115px] w-[55px]"
        />

        {/* Ground */}
        <div className="absolute inset-x-0 bottom-0 h-7 bg-primary/[0.08]" />

        {/* Trees */}
        <div className="absolute bottom-5 left-[3%]">
          <Tree />
        </div>

        <div className="absolute bottom-5 right-[4%]">
          <Tree />
        </div>

        <div className="absolute bottom-5 left-[70%]">
          <Tree />
        </div>
      </div>

      {/* ================================================================
          MAIN LISTING CARD
      ================================================================= */}



      {/* ================================================================
          SEARCH CARD
      ================================================================= */}
      <div className="absolute left-[2%] top-4 z-30 flex w-[180px] items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 shadow-lg shadow-primary/10">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Search className="size-4" />
        </div>

        <div className="flex-1">
          <div className="h-1.5 w-16 rounded-full bg-foreground/10" />

          <div className="mt-1.5 h-1.5 w-11 rounded-full bg-muted" />
        </div>
      </div>

      {/* ================================================================
          VERIFIED FLOATING CARD
      ================================================================= */}
      <div className="absolute right-[2%] top-1 z-30 flex items-center gap-2 rounded-xl border border-primary/10 bg-background px-3 py-2 shadow-lg shadow-primary/10">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
          <ShieldCheck className="size-4" />
        </div>

        <div>
          <p className="text-[9px] font-semibold text-foreground">
            যাচাইকৃত
          </p>

          <p className="text-[8px] text-muted-foreground">
            নিরাপদ লিস্টিং
          </p>
        </div>
      </div>

      {/* ================================================================
          MAP PIN
      ================================================================= */}
      <div className="absolute bottom-[110px] left-[51%] z-30">
        <div className="relative">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <MapPin className="size-5" fill="currentColor" />
          </div>

          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/20" />
        </div>
      </div>

      {/* ================================================================
          SAVED FLOATING CARD
      ================================================================= */}
      <div className="absolute -bottom-1 left-[8%] z-40 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 shadow-lg">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Heart className="size-3.5" fill="currentColor" />
        </div>

        <div>
          <p className="text-[9px] font-semibold text-foreground">
            পছন্দে সংরক্ষিত
          </p>

          <p className="text-[8px] text-muted-foreground">
            আপনার তালিকায় যোগ হয়েছে
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Building
// ---------------------------------------------------------------------------

function Building({
  className,
  featured = false,
}: {
  className: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-t-lg border border-primary/10 bg-background/80 p-1.5 ${className}`}
    >
      <div
        className={`grid h-full grid-cols-2 gap-1 ${featured ? "opacity-80" : "opacity-50"
          }`}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <span
            key={index}
            className="rounded-[2px] bg-primary/[0.12]"
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tree
// ---------------------------------------------------------------------------

function Tree() {
  return (
    <div className="relative h-20 w-12">
      <div className="absolute bottom-0 left-1/2 h-8 w-1.5 -translate-x-1/2 rounded-full bg-primary/20" />

      <div className="absolute left-1/2 top-0 size-12 -translate-x-1/2 rounded-full bg-primary/[0.12]" />

      <div className="absolute left-1/2 top-2 size-8 -translate-x-1/2 rounded-full bg-primary/[0.16]" />
    </div>
  );
}

