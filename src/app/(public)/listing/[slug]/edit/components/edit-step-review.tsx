"use client";

import { CheckCircle2, Globe, Mail, MapPin, Pencil, Phone } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { AdminListingFormValues } from "@/lib/schemas/admin-listing-schema";
import type { ExistingListingMedia } from "@/utils/admin-listing-detail";
import type { AdminListingRemovals } from "@/utils/admin-listing-form";
import { StepHeader } from "../../../../../(admin)/admin/listings/add/components/steps/admin-step-header";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

function Section({
  title,
  stepIndex,
  onEdit,
  children,
}: {
  title: string;
  stepIndex: number;
  onEdit: (index: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(stepIndex)}
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>
      </div>

      {children}
    </div>
  );
}

export function EditStepReview({
  onEdit,
  existingMedia,
  removals,
}: {
  onEdit: (index: number) => void;
  existingMedia: ExistingListingMedia;
  removals: AdminListingRemovals;
}) {
  const form = useFormContext<AdminListingFormValues>();
  const values = form.getValues();

  const coverUrl = values.cover ? URL.createObjectURL(values.cover) : null;
  const logoUrl = values.logo ? URL.createObjectURL(values.logo) : null;
  const existingCover =
    existingMedia.thumbnail && !removals.coverRemoved
      ? existingMedia.thumbnail.secure_url
      : null;
  const existingLogo =
    existingMedia.logo && !removals.logoRemoved
      ? existingMedia.logo.secure_url
      : null;
  const existingGallery = existingMedia.gallery.filter(
    (media) => !removals.galleryRemoved.includes(media.id),
  );

  return (
    <div className="space-y-6">
      <StepHeader
        title="Review & submit"
        description="Check your changes once more, then save. Approved listings keep their status — rejected ones go back for review."
      />

      {/* Hero preview */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="relative h-40 w-full bg-muted sm:h-52">
          {coverUrl ? (
            // biome-ignore lint/performance/noImgElement: object URL / existing media preview
            <img
              src={coverUrl}
              alt="cover"
              className="h-full w-full object-cover"
            />
          ) : existingCover ? (
            // biome-ignore lint/performance/noImgElement: object URL / existing media preview
            <img
              src={existingCover}
              alt="cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No cover image
            </div>
          )}
        </div>

        <div className="flex items-start gap-4 p-5">
          {logoUrl ? (
            // biome-ignore lint/performance/noImgElement: object URL / existing media preview
            <img
              src={logoUrl}
              alt="logo"
              className="-mt-10 h-16 w-16 rounded-lg border-4 border-background object-cover shadow-sm"
            />
          ) : existingLogo ? (
            // biome-ignore lint/performance/noImgElement: object URL / existing media preview
            <img
              src={existingLogo}
              alt="logo"
              className="-mt-10 h-16 w-16 rounded-lg border-4 border-background object-cover shadow-sm"
            />
          ) : (
            <div className="-mt-10 h-16 w-16 rounded-lg border-4 border-background bg-muted shadow-sm" />
          )}

          <div>
            <h3 className="text-lg font-semibold">
              {values.title || "Business name"}
            </h3>
            {values.tagline && (
              <p className="text-sm text-muted-foreground">{values.tagline}</p>
            )}
          </div>
        </div>
      </div>

      <Section title="Basic information" stepIndex={0} onEdit={onEdit}>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Short description</dt>
            <dd>{values.shortDescription || "—"}</dd>
          </div>

          <div>
            <dt className="text-xs text-muted-foreground">Description</dt>
            <dd className="whitespace-pre-wrap">{values.description}</dd>
          </div>
        </dl>
      </Section>

      <Section title="Location & contact" stepIndex={1} onEdit={onEdit}>
        <div className="space-y-2 text-sm">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            {values.addressLine1}
          </p>

          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
            {values.phone}
          </p>

          {values.email && (
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
              {values.email}
            </p>
          )}

          {values.website && (
            <p className="flex items-center gap-2">
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
              {values.website}
            </p>
          )}
        </div>
      </Section>

      <Section title="Business details" stepIndex={2} onEdit={onEdit}>
        <div className="flex flex-wrap gap-2 text-sm">
          {values.establishedYear && (
            <Badge variant="secondary">Est. {values.establishedYear}</Badge>
          )}

          {values.priceRange && (
            <Badge variant="secondary">{values.priceRange}</Badge>
          )}

          {values.areaServed && (
            <Badge variant="secondary">{values.areaServed}</Badge>
          )}
        </div>

        <Separator className="my-3" />

        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground sm:grid-cols-4">
          {values.openingHours?.map((oh) => (
            <span key={oh.day}>
              {DAY_LABELS[oh.day]}:{" "}
              {oh.isClosed ? "Closed" : `${oh.openTime}–${oh.closeTime}`}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Services & FAQ" stepIndex={3} onEdit={onEdit}>
        <div className="flex flex-wrap gap-1.5">
          {values.features?.map((feature) => (
            <Badge key={feature.name} variant="outline">
              {feature.name}
            </Badge>
          ))}
        </div>

        {values.faqs && values.faqs.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            {values.faqs.length} FAQ
            {values.faqs.length === 1 ? "" : "s"} added
          </p>
        )}
      </Section>

      <Section title="Photos" stepIndex={4} onEdit={onEdit}>
        <div className="flex flex-wrap gap-2">
          {values.gallery?.map((file) => (
            // biome-ignore lint/performance/noImgElement: object URL / existing media preview
            <img
              key={`${file.name}-${file.size}-${file.lastModified}`}
              src={URL.createObjectURL(file)}
              alt=""
              className="h-16 w-16 rounded-md border object-cover"
            />
          ))}

          {existingGallery.map((media) => (
            // biome-ignore lint/performance/noImgElement: object URL / existing media preview
            <img
              key={media.id}
              src={media.secure_url}
              alt={media.alt ?? ""}
              className="h-16 w-16 rounded-md border object-cover"
            />
          ))}

          {values.gallery?.length === 0 && existingGallery.length === 0 && (
            <p className="text-sm text-muted-foreground">No gallery images</p>
          )}
        </div>

        {!values.cover && !existingCover && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-destructive">
            <CheckCircle2 className="h-3.5 w-3.5" />A cover image is required.
          </p>
        )}
      </Section>
    </div>
  );
}
