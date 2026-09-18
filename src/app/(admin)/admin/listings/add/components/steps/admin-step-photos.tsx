"use client";

import { Plus, RefreshCw, Trash2, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { AdminListingFormValues } from "@/lib/schemas/admin-listing-schema";
import { cn } from "@/lib/utils";
import type { ExistingListingMedia } from "@/utils/admin-listing-detail";
import type { AdminListingRemovals } from "@/utils/admin-listing-form";
import { StepHeader } from "./admin-step-header";

function fileToURL(file: File) {
  return URL.createObjectURL(file);
}

export function AdminStepPhotos({
  existingMedia,
  removals,
  onRemovalChange,
}: {
  existingMedia: ExistingListingMedia;
  removals: AdminListingRemovals;
  onRemovalChange: (removals: AdminListingRemovals) => void;
}) {
  const form = useFormContext<AdminListingFormValues>();
  const errors = form.formState.errors;

  const cover = form.watch("cover") ?? null;
  const logo = form.watch("logo") ?? null;
  const newGallery = form.watch("gallery") ?? [];

  const existingCoverShown =
    !cover && existingMedia.thumbnail && !removals.coverRemoved;
  const existingLogoShown =
    !logo && existingMedia.logo && !removals.logoRemoved;
  const existingGallery = existingMedia.gallery.filter(
    (media) => !removals.galleryRemoved.includes(media.id),
  );

  const addGalleryFiles = (files: FileList | null) => {
    if (!files) return;
    const next = [...newGallery, ...Array.from(files)].slice(0, 8);
    form.setValue("gallery", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const removeGalleryFile = (index: number) => {
    form.setValue(
      "gallery",
      newGallery.filter((_, i) => i !== index),
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const handlePick = (key: "cover" | "logo") => (file: File | null) => {
    if (key === "cover") {
      form.setValue("cover", file ?? undefined, {
        shouldValidate: true,
        shouldDirty: true,
      });
      if (file) {
        onRemovalChange({ ...removals, coverRemoved: false });
      }
    } else {
      form.setValue("logo", file, { shouldValidate: true, shouldDirty: true });
      if (file) {
        onRemovalChange({ ...removals, logoRemoved: false });
      }
    }
  };

  const removeCover = () => {
    form.setValue("cover", undefined, {
      shouldValidate: true,
      shouldDirty: true,
    });
    onRemovalChange({ ...removals, coverRemoved: true });
  };

  const removeLogo = () => {
    form.setValue("logo", null, { shouldValidate: true, shouldDirty: true });
    onRemovalChange({ ...removals, logoRemoved: true });
  };

  const removeExistingCover = () =>
    onRemovalChange({ ...removals, coverRemoved: true });

  const removeExistingLogo = () =>
    onRemovalChange({ ...removals, logoRemoved: true });

  const removeExistingGallery = (id: string) =>
    onRemovalChange({
      ...removals,
      galleryRemoved: [...removals.galleryRemoved, id],
    });

  const totalGallery = existingGallery.length + newGallery.length;

  return (
    <div className="space-y-8">
      <StepHeader
        title="Photos"
        description="Good quality images make a listing far more attractive. Cover image is required for new listings."
      />

      <ImageSlot
        id="cover-input"
        label="Cover image *"
        hint="Recommended: 1600×600px, up to 5MB"
        aspect="wide"
        file={cover}
        existingUrl={
          existingCoverShown
            ? (existingMedia.thumbnail?.secure_url ?? null)
            : null
        }
        error={errors.cover?.message as string | undefined}
        onPick={handlePick("cover")}
        onRemoveNew={removeCover}
        onRemoveExisting={removeExistingCover}
      />

      <ImageSlot
        id="logo-input"
        label="Logo"
        hint="Recommended: square image, up to 5MB"
        aspect="square"
        file={logo}
        existingUrl={
          existingLogoShown ? (existingMedia.logo?.secure_url ?? null) : null
        }
        error={errors.logo?.message as string | undefined}
        onPick={handlePick("logo")}
        onRemoveNew={removeLogo}
        onRemoveExisting={removeExistingLogo}
      />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">
            Gallery images ({totalGallery}/8)
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={totalGallery >= 8}
          >
            <label className="flex cursor-pointer items-center">
              <Plus className="mr-1 h-4 w-4" />
              Add images
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => addGalleryFiles(e.target.files)}
              />
            </label>
          </Button>
        </div>

        {totalGallery === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            No gallery images yet.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {existingGallery.map((media) => (
              <div
                key={media.id}
                className="group relative aspect-square overflow-hidden rounded-lg border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.secure_url}
                  alt={media.alt ?? ""}
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeExistingGallery(media.id)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {newGallery.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="group relative aspect-square overflow-hidden rounded-lg border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeGalleryFile(index)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {errors.gallery?.message && (
          <p className="mt-2 text-xs font-medium text-destructive">
            {errors.gallery.message as string}
          </p>
        )}
      </div>
    </div>
  );
}

function ImageSlot({
  id,
  label,
  hint,
  aspect,
  file,
  existingUrl,
  error,
  onPick,
  onRemoveNew,
  onRemoveExisting,
}: {
  id: string;
  label: string;
  hint: string;
  aspect: "square" | "wide";
  file: File | null;
  existingUrl: string | null;
  error?: string;
  onPick: (file: File | null) => void;
  onRemoveNew: () => void;
  onRemoveExisting: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const preview = file ? fileToURL(file) : existingUrl;

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>

      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.[0]) {
            onPick(e.dataTransfer.files[0]);
          }
        }}
        className={cn(
          "relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors",
          aspect === "wide" ? "aspect-[16/6]" : "aspect-square w-32",
          isDragging ? "border-primary bg-muted" : "border-border bg-muted/30",
          error && "border-destructive",
        )}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={label}
              className="h-full w-full object-cover"
            />

            <div className="absolute right-2 top-2 flex gap-1.5">
              <button
                type="button"
                title="Replace"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                title="Remove"
                onClick={(e) => {
                  e.stopPropagation();
                  if (file) {
                    onRemoveNew();
                  } else {
                    onRemoveExisting();
                  }
                }}
                className="rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 px-4 text-center">
            <UploadCloud className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Click to upload or drag & drop
            </span>
          </div>
        )}

        <input
          id={id}
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onPick(e.target.files[0]);
            }
            e.target.value = "";
          }}
        />
      </label>

      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
