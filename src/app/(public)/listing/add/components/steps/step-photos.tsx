"use client";

import { Plus, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import type { ListingFormValues } from "@/lib/schemas/listing-schema";

export function StepPhotos() {
  const form = useFormContext<ListingFormValues>();
  const errors = form.formState.errors;
  const gallery = form.watch("gallery") ?? [];

  const addGalleryFiles = (files: FileList | null) => {
    if (!files) return;
    const next = [...gallery, ...Array.from(files)].slice(0, 8);
    form.setValue("gallery", next, { shouldValidate: true, shouldDirty: true });
  };

  const removeGalleryFile = (index: number) => {
    form.setValue(
      "gallery",
      gallery.filter((_, i) => i !== index),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">ছবি যোগ করুন</h2>
        <p className="mt-1 text-sm text-[#6B6656]">
          ভালো মানের ছবি লিস্টিংকে আরও আকর্ষণীয় করে তোলে। কভার ছবি আবশ্যক, বাকিগুলো ঐচ্ছিক।
        </p>
      </div>

      <ImageDropzone
        label="কভার ছবি *"
        hint="প্রস্তাবিত: 1600×600px, সর্বোচ্চ 5MB"
        aspect="wide"
        value={form.watch("cover")}
        onChange={(file) => form.setValue("cover", file as File, { shouldValidate: true, shouldDirty: true })}
        error={errors.cover?.message as string | undefined}
      />

      <ImageDropzone
        label="লোগো"
        hint="প্রস্তাবিত: বর্গাকার ছবি, সর্বোচ্চ 5MB"
        aspect="square"
        value={form.watch("logo")}
        onChange={(file) => form.setValue("logo", file, { shouldValidate: true, shouldDirty: true })}
        error={errors.logo?.message as string | undefined}
      />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-[#1A1A1A]">গ্যালারি ছবি ({gallery.length}/8)</p>
          <Button type="button" variant="outline" size="sm" disabled={gallery.length >= 8}>
            <label className="cursor-pointer">
              <Plus className="mr-1 h-4 w-4" /> ছবি যোগ করুন
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

        {gallery.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#C9C2B2] p-4 text-center text-sm text-[#8A8371]">
            এখনও কোনো গ্যালারি ছবি যোগ করা হয়নি
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {gallery.map((file, index) => (
              <div key={`${file.name}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border border-[#E3DDCF]">
                <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryFile(index)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="ছবি সরান"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {errors.gallery?.message && (
          <p className="mt-2 text-xs font-medium text-[#B45744]">{errors.gallery.message as string}</p>
        )}
      </div>
    </div>
  );
}
