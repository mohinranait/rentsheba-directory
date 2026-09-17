"use client";

import { ImagePlus, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  value: File | null | undefined;
  onChange: (file: File | null) => void;
  label: string;
  hint?: string;
  aspect?: "square" | "wide";
  error?: string;
}

export function ImageDropzone({ value, onChange, label, hint, aspect = "wide", error }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const previewUrl = value ? URL.createObjectURL(value) : null;

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (files && files[0]) onChange(files[0]);
    },
    [onChange]
  );

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-[#1A1A1A]">{label}</p>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors",
          aspect === "wide" ? "aspect-[16/6]" : "aspect-square w-32",
          isDragging ? "border-[#1F4D3D] bg-[#EFEAE0]" : "border-[#C9C2B2] bg-[#FBF9F4]",
          error && "border-[#B45744]"
        )}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              aria-label="ছবি সরান"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 px-4 text-center">
            <ImagePlus className="h-6 w-6 text-[#8A8371]" />
            <span className="text-xs text-[#8A8371]">ছবি দিতে ক্লিক করুন অথবা ড্র্যাগ করুন</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {hint && !error && <p className="text-xs text-[#8A8371]">{hint}</p>}
      {error && <p className="text-xs font-medium text-[#B45744]">{error}</p>}
    </div>
  );
}
