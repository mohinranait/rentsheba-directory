"use client";

import { useState, useRef } from "react";
import {
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  Globe,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsImageUploaderProps {
  id: string;
  label: string;
  description?: string;
  value: string;
  onChange: (url: string) => void;
  altText?: string;
  variant?: "headerLogo" | "footerLogo" | "favicon" | "banner";
  accept?: string;
  siteName?: string;
  onNotification?: (type: "success" | "error", message: string) => void;
}

export function SettingsImageUploader({
  id,
  label,
  description,
  value,
  onChange,
  altText = "Site Asset",
  variant = "headerLogo",
  accept = "image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon",
  siteName = "Rentsheba",
  onNotification,
}: SettingsImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("alt", altText);

      const res = await fetch("/api/admin/settings/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to upload image to Cloudinary");
      }

      onChange(json.url);
      onNotification?.("success", `${label} uploaded to Cloudinary successfully!`);
    } catch (err: any) {
      onNotification?.("error", err.message || "Error uploading image to Cloudinary");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith("image/") || file.name.endsWith(".ico"))) {
      handleUploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const hasImage = Boolean(value && value.trim() !== "");

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor={id} className="text-sm font-semibold text-foreground">
            {label}
          </Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {hasImage && (
          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <LinkIcon className="size-3" />
            {showManualInput ? "Hide URL" : "Edit URL"}
          </button>
        )}
      </div>

      {/* Main Upload Box */}
      <div className="space-y-2">
        {hasImage ? (
          <div className="relative overflow-hidden rounded-xl border border-border bg-muted/20 p-2 transition-all">
            {/* Custom preview container based on variant */}
            <div className="flex items-center justify-center min-h-[110px] w-full rounded-lg bg-white/70 p-4 backdrop-blur-xs">
              {variant === "favicon" ? (
                <div className="flex flex-col items-center gap-3">
                  {/* Browser Tab Simulation */}
                  <div className="flex items-center gap-2 rounded-t-lg border border-border bg-slate-100 px-3 py-1.5 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={value}
                      alt={altText}
                      className="size-4 object-contain"
                    />
                    <span className="text-xs font-medium text-slate-700 max-w-[140px] truncate">
                      {siteName} — Directory
                    </span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={value}
                    alt={altText}
                    className="size-10 object-contain rounded-md border p-1 bg-white shadow-xs"
                  />
                </div>
              ) : variant === "banner" ? (
                <div className="relative aspect-[16/8] w-full max-w-lg overflow-hidden rounded-lg border bg-slate-900/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={value}
                    alt={altText}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                    1200 × 630 OG Preview
                  </span>
                </div>
              ) : (
                <div className="flex h-20 w-full items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={value}
                    alt={altText}
                    className="max-h-16 w-auto max-w-[240px] object-contain"
                  />
                </div>
              )}
            </div>

            {/* Floating Action Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="h-8 gap-1.5 bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
              >
                <Upload className="size-3.5" />
                Change
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onChange("")}
                disabled={uploading}
                className="h-8 gap-1.5 bg-destructive/80 text-white hover:bg-destructive"
              >
                <Trash2 className="size-3.5" />
                Remove
              </Button>
            </div>

            {/* Uploading Spinner Overlay */}
            {uploading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/50 backdrop-blur-xs">
                <Loader2 className="size-7 animate-spin text-white" />
                <span className="text-xs font-semibold text-white">
                  Uploading to Cloudinary...
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Empty Dropzone (matching category-dialog reference) */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-input bg-muted/40 p-6 transition-all hover:border-primary/60 hover:bg-muted/70",
              isDragging && "border-primary bg-primary/5",
              uploading && "pointer-events-none opacity-60",
            )}
          >
            {uploading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
                <Loader2 className="size-7 animate-spin text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  Uploading to Cloudinary & saving media...
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-3 text-center">
                <div className="grid size-11 place-items-center rounded-xl bg-background border shadow-2xs group-hover:border-primary/40 transition-colors">
                  <ImagePlus className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Click to upload or drag &amp; drop
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    PNG, JPG, WebP, SVG{variant === "favicon" ? ", ICO" : ""} (Max 5MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hidden native input */}
        <input
          id={id}
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={handleFileChange}
        />

        {/* Manual URL Input (Expandable) */}
        {(showManualInput || (!hasImage && showManualInput)) && (
          <div className="flex items-center gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Or paste Cloudinary / external image URL"
              className="text-xs h-8"
            />
            {value && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-8 shrink-0 place-items-center rounded-md border text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        )}

        {!hasImage && !showManualInput && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowManualInput(true)}
              className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Or enter image URL directly
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
