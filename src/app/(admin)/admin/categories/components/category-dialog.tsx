"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FolderPlus, Loader2 } from "lucide-react";
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
  image: "",
  parentId: "",
  isActive: true,
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

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });

  const nameValue = form.watch("name");

  useEffect(() => {
    if (!open) {
      return;
    }

    setSubmitError(null);
    setSlugTouched(!!editing?.slug);

    if (editing) {
      form.reset({
        name: editing.name,
        slug: editing.slug,
        description: editing.description ?? "",
        image: editing.image ?? "",
        parentId: editing.parentId ?? "",
        isActive: editing.isActive,
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

  async function onSubmit(values: CategoryFormValues) {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(
        editing
          ? `/api/admin/categories/${editing.id}`
          : "/api/admin/categories",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            parentId: values.parentId || undefined,
          }),
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
            render={({ field, fieldState }) => (
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
                  <SelectValue placeholder="Select a parent category" />
                </SelectTrigger>

                <SelectContent className="max-h-72">
                  <SelectItem value="root">No parent (top level)</SelectItem>

                  {options.map((option) => (
                    <SelectItem
                      key={option.id}
                      value={option.id}
                      className="font-normal"
                    >
                      {"\u00A0".repeat(option.depth * 2)}
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
            label="Image URL"
            description="Optional cover image for the category."
            render={({ field, fieldState }) => (
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="https://…"
              />
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
