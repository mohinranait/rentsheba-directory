"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FolderPlus, ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ControlledField } from "@/components/ui/controlled-field";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  type CategoryFormValues,
  categoryFormSchema,
} from "@/lib/schemas/category-schema";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";
import type { CategoryNode, CategoryOption } from "./types";

type CategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: CategoryNode | null;
  defaultParentId: string;
  options: CategoryOption[];
  onSaved: (message: string) => void;
};

const defaultValues: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  parentId: "",
  isActive: true,
  image: null,
};

export function CategoryDialog({
  open,
  onOpenChange,
  editing,
  defaultParentId,
  options,
  onSaved,
}: CategoryDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });

  const nameValue = form.watch("name");
  const imageValue = form.watch("image");

  const imagePreview =
    imageValue instanceof File ? URL.createObjectURL(imageValue) : null;

  const existingImageUrl = editing?.image?.secure_url ?? null;

  useEffect(() => {
    if (!open) {
      return;
    }

    setSubmitError(null);
    setSlugTouched(!!editing?.slug);
    setRemoveImage(false);

    if (editing) {
      form.reset({
        name: editing.name,
        slug: editing.slug,
        description: editing.description ?? "",
        parentId: editing.parentId ?? "",
        isActive: editing.isActive,
        image: null,
      });
    } else {
      form.reset({
        ...defaultValues,
        parentId: defaultParentId,
      });
    }
  }, [open, editing, defaultParentId, form]);

  useEffect(() => {
    if (!slugTouched && nameValue.trim()) {
      form.setValue("slug", slugify(nameValue), { shouldValidate: false });
    }
  }, [nameValue, slugTouched, form]);

  const isChildForm = !editing && !!defaultParentId;
  const showExistingImage = !!existingImageUrl && !imageValue && !removeImage;

  async function onSubmit(values: CategoryFormValues) {
    setSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("slug", values.slug);

    if (values.description) {
      formData.append("description", values.description);
    }
    if (values.parentId) {
      formData.append("parentId", values.parentId);
    }
    if (values.image instanceof File) {
      formData.append("image", values.image);
    }
    formData.append("isActive", String(values.isActive ?? true));

    if (removeImage) {
      formData.append("removeImage", "true");
    }

    try {
      const res = await fetch(
        editing
          ? `/api/admin/categories/${editing.id}`
          : "/api/admin/categories",
        {
          method: editing ? "PATCH" : "POST",
          body: formData,
        },
      );

      const data = await res.json();

      if (!data.success) {
        setSubmitError(data.message ?? "Something went wrong");
        return;
      }

      onSaved(data.message);
      onOpenChange(false);
    } catch {
      setSubmitError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit category" : "New category"}
          </DialogTitle>

          <DialogDescription>
            {editing
              ? "Update the details below and save your changes."
              : isChildForm
                ? "Add a new sub-category under the selected parent."
                : "Create a new top-level category."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-h-[70vh] space-y-5 overflow-y-auto pr-1"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <ControlledField
              control={form.control}
              name="name"
              label="Name *"
              description="Shown across the site and in listings."
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. Restaurant & Food"
                />
              )}
            />

            <ControlledField
              control={form.control}
              name="slug"
              label="Slug"
              description="Used in URLs. Auto-generated from the name."
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="restaurant-delivery"
                  onChange={(event) => {
                    setSlugTouched(true);
                    field.onChange(event);
                  }}
                />
              )}
            />
          </div>

          <ControlledField
            control={form.control}
            name="parentId"
            label="Parent category"
            description="Pick a parent to nest this category under it."
            render={({ field, fieldState }) => {
              const selectedParent = options.find(
                (option) => option.id === field.value,
              );

              return (
                <Select
                  value={field.value || "root"}
                  onValueChange={(value) =>
                    field.onChange(value === "root" ? "" : value)
                  }
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                  >
                    <SelectValue>
                      {selectedParent?.name ?? "No parent (top level)"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent className="max-h-72">
                    <SelectItem value="root">No parent (top level)</SelectItem>

                    {options
                      .filter((option) => option.id !== editing?.id)
                      .map((option) => (
                        <SelectItem
                          key={option.id}
                          value={option.id}
                          className="font-normal"
                        >
                          {"-".repeat(option.depth * 1)}
                          {option.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              );
            }}
          />

          <ControlledField
            control={form.control}
            name="description"
            label="Description"
            description="A short summary of what belongs in this category."
            render={({ field, fieldState }) => (
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                rows={3}
                placeholder="Optional description…"
              />
            )}
          />

          <ControlledField
            control={form.control}
            name="image"
            label="Category image"
            description="Optional cover image — uploaded and stored securely."
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                {showExistingImage ? (
                  <div className="relative overflow-hidden rounded-lg border border-border">
                    {/* biome-ignore lint/performance/noImgElement: category media thumbnail */}
                    <img
                      src={existingImageUrl ?? ""}
                      alt=""
                      className="aspect-[16/6] w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setRemoveImage(true)}
                      className="absolute top-2 right-2 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-black/80"
                    >
                      <Trash2 className="size-3.5" />
                      Remove image
                    </button>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-input bg-muted/50 transition-colors hover:border-primary/50 hover:bg-muted",
                      fieldState.invalid && "border-destructive/60",
                    )}
                  >
                    <label
                      htmlFor="category-image-file"
                      className="flex w-full cursor-pointer items-center justify-center"
                    >
                      {imagePreview ? (
                        // biome-ignore lint/performance/noImgElement: selected file preview
                        <img
                          src={imagePreview}
                          alt=""
                          className="aspect-[16/6] w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[16/6] w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
                          <ImagePlus className="size-6" />
                          <span className="text-xs">
                            {removeImage
                              ? "Choose an image to keep (current will be replaced)"
                              : "Click to upload a category image"}
                          </span>
                        </div>
                      )}
                    </label>

                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => field.onChange(null)}
                        className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                        aria-label="Remove selected image"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}

                    <input
                      id="category-image-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        field.onChange(file);
                        if (file) {
                          setRemoveImage(false);
                        }
                        event.target.value = "";
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          />

          <ControlledField
            control={form.control}
            name="isActive"
            label="Active status"
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
                <span className="text-sm text-muted-foreground">
                  {field.value ? "Visible on the site" : "Hidden from the site"}
                </span>
              </div>
            )}
          />

          {submitError && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {submitError}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={submitting}
              className="bg-primary font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FolderPlus className="size-4" />
              )}
              {editing ? "Save changes" : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
