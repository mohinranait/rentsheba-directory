"use client";

import { useFormContext } from "react-hook-form";
import { Pencil, MapPin, Phone, Mail, Globe, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ListingFormValues } from "@/lib/schemas/listing-schema";

const DAY_LABELS_BN: Record<string, string> = {
  MONDAY: "সোম",
  TUESDAY: "মঙ্গল",
  WEDNESDAY: "বুধ",
  THURSDAY: "বৃহঃ",
  FRIDAY: "শুক্র",
  SATURDAY: "শনি",
  SUNDAY: "রবি",
};

interface SectionProps {
  title: string;
  stepIndex: number;
  onEdit: (index: number) => void;
  children: React.ReactNode;
}

function Section({ title, stepIndex, onEdit, children }: SectionProps) {
  return (
    <div className="rounded-xl border border-[#E3DDCF] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#8A8371]">{title}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(stepIndex)}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" /> সম্পাদনা
        </Button>
      </div>
      {children}
    </div>
  );
}

export function StepPreview({ onEdit }: { onEdit: (index: number) => void }) {
  const form = useFormContext<ListingFormValues>();
  const values = form.getValues();

  const coverUrl = values.cover ? URL.createObjectURL(values.cover) : null;
  const logoUrl = values.logo ? URL.createObjectURL(values.logo) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">পর্যালোচনা করুন</h2>
        <p className="mt-1 text-sm text-[#6B6656]">
          সব তথ্য এক নজরে দেখুন — কোনো সেকশন ঠিক করতে হলে সেখানকার &quot;সম্পাদনা&quot; বাটনে ক্লিক করুন।
        </p>
      </div>

      {/* Hero preview */}
      <div className="overflow-hidden rounded-xl border border-[#E3DDCF] bg-white">
        <div className="relative h-40 w-full bg-[#EFEAE0] sm:h-52">
          {coverUrl && <img src={coverUrl} alt="cover" className="h-full w-full object-cover" />}
        </div>
        <div className="flex items-start gap-4 p-5">
          {logoUrl ? (
            <img src={logoUrl} alt="logo" className="-mt-10 h-16 w-16 rounded-lg border-4 border-white object-cover shadow-sm" />
          ) : (
            <div className="-mt-10 h-16 w-16 rounded-lg border-4 border-white bg-[#C9C2B2] shadow-sm" />
          )}
          <div>
            <h3 className="text-lg font-semibold text-[#1A1A1A]">{values.name || "প্রতিষ্ঠানের নাম"}</h3>
            {values.tagline && <p className="text-sm text-[#6B6656]">{values.tagline}</p>}
          </div>
        </div>
      </div>

      <Section title="মূল তথ্য" stepIndex={0} onEdit={onEdit}>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-xs text-[#8A8371]">সংক্ষিপ্ত বিবরণ</dt>
            <dd className="text-[#1A1A1A]">{values.shortDescription || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#8A8371]">বিস্তারিত বিবরণ</dt>
            <dd className="whitespace-pre-wrap text-[#1A1A1A]">{values.description}</dd>
          </div>
        </dl>
      </Section>

      <Section title="অবস্থান ও যোগাযোগ" stepIndex={1} onEdit={onEdit}>
        <div className="space-y-2 text-sm text-[#1A1A1A]">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8A8371]" />
            {values.addressLine1}
            {values.addressLine2 ? `, ${values.addressLine2}` : ""} {values.postalCode}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0 text-[#8A8371]" /> {values.phone}
            {values.phoneAlt ? ` / ${values.phoneAlt}` : ""}
          </p>
          {values.email && (
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-[#8A8371]" /> {values.email}
            </p>
          )}
          {values.website && (
            <p className="flex items-center gap-2">
              <Globe className="h-4 w-4 shrink-0 text-[#8A8371]" /> {values.website}
            </p>
          )}
        </div>
      </Section>

      <Section title="ব্যবসার বিবরণ" stepIndex={2} onEdit={onEdit}>
        <div className="flex flex-wrap gap-2 text-sm">
          {values.establishedYear && <Badge variant="secondary">প্রতিষ্ঠা: {values.establishedYear}</Badge>}
          {values.priceRange && <Badge variant="secondary">{values.priceRange}</Badge>}
          {values.areaServed && <Badge variant="secondary">{values.areaServed}</Badge>}
        </div>
        <Separator className="my-3" />
        <div className="grid grid-cols-2 gap-1 text-xs text-[#6B6656] sm:grid-cols-4">
          {values.openingHours?.map((oh) => (
            <span key={oh.day}>
              {DAY_LABELS_BN[oh.day]}: {oh.isClosed ? "বন্ধ" : `${oh.openTime}–${oh.closeTime}`}
            </span>
          ))}
        </div>
      </Section>

      <Section title="সার্ভিস, সুবিধা ও FAQ" stepIndex={3} onEdit={onEdit}>
        <div className="flex flex-wrap gap-1.5">
          {values.features?.map((f, i) => (
            <Badge key={i} variant="outline">
              {f.name}
            </Badge>
          ))}
        </div>
        {values.faqs && values.faqs.length > 0 && (
          <p className="mt-3 text-xs text-[#8A8371]">{values.faqs.length}টি প্রশ্নোত্তর যোগ করা হয়েছে</p>
        )}
      </Section>

      <Section title="ছবি" stepIndex={4} onEdit={onEdit}>
        <div className="flex flex-wrap gap-2">
          {values.gallery?.map((file, i) => (
            <img
              key={i}
              src={URL.createObjectURL(file)}
              alt=""
              className="h-16 w-16 rounded-md border border-[#E3DDCF] object-cover"
            />
          ))}
          {(!values.gallery || values.gallery.length === 0) && (
            <p className="text-sm text-[#8A8371]">কোনো গ্যালারি ছবি নেই</p>
          )}
        </div>
      </Section>

      <Section title="অ্যাকাউন্ট" stepIndex={5} onEdit={onEdit}>
        <p className="flex items-center gap-2 text-sm text-[#1A1A1A]">
          <Star className="h-4 w-4 text-[#8A8371]" /> {values.loginEmail}
        </p>
        <p className="mt-1 text-xs text-[#8A8371]">পাসওয়ার্ড নিরাপদে সংরক্ষিত থাকবে</p>
      </Section>
    </div>
  );
}
