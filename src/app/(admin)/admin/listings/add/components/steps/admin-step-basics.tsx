"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ControlledField } from "@/components/ui/controlled-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AdminListingFormValues } from "@/lib/schemas/admin-listing-schema";
import { StepHeader } from "./admin-step-header";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
};

function buildCategoryOptions(categories: CategoryOption[]) {
  const childrenByParent = new Map<string, CategoryOption[]>();
  const roots: CategoryOption[] = [];

  for (const category of categories) {
    if (category.parentId) {
      const siblings = childrenByParent.get(category.parentId) ?? [];
      siblings.push(category);
      childrenByParent.set(category.parentId, siblings);
    } else {
      roots.push(category);
    }
  }

  const flattened: (CategoryOption & { depth: number })[] = [];

  const walk = (node: CategoryOption, depth: number) => {
    flattened.push({ ...node, depth });
    for (const child of childrenByParent.get(node.id) ?? []) {
      walk(child, depth + 1);
    }
  };

  for (const root of roots) {
    walk(root, 0);
  }

  return flattened;
}

export function AdminStepBasics() {
  const form = useFormContext<AdminListingFormValues>();
  const descriptionValue = form.watch("description") ?? "";
  const shortDescriptionValue = form.watch("shortDescription") ?? "";

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    fetch("/api/public/categories")
      .then((res) => res.json())
      .then((data) => {
        if (isActive && data.success) {
          setCategories(data.data);
        }
      })
      .catch(() => {
        // Leave the dropdown empty; the field error will guide the admin
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const categoryOptions = useMemo(
    () => buildCategoryOptions(categories),
    [categories],
  );

  return (
    <div className="space-y-6">
      <StepHeader
        title="Basic information"
        description="The name and summary visitors will see first."
      />

      <ControlledField
        control={form.control}
        name="title"
        label="Business name *"
        render={({ field, fieldState }) => (
          <Input
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
            placeholder="e.g. Green Leaf Coffee House"
          />
        )}
      />

      <ControlledField
        control={form.control}
        name="tagline"
        label="Tagline"
        description="Optional — shown under the headline on listing cards."
        render={({ field, fieldState }) => (
          <Input
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
            placeholder="One line about your business"
          />
        )}
      />

      <ControlledField
        control={form.control}
        name="categoryId"
        label="Category *"
        render={({ field, fieldState }) => {
          const selectedCategory = categoryOptions.find(
            (category) => category.id === field.value,
          );

          return (
            <Select
              value={field.value || ""}
              onValueChange={field.onChange}
              disabled={isLoading}
            >
              <SelectTrigger
                id={field.name}
                aria-invalid={fieldState.invalid}
                className="w-full"
              >
                <SelectValue
                  placeholder={
                    isLoading ? "Loading categories…" : "Choose a category"
                  }
                >
                  {selectedCategory?.name}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.depth > 0 && "— ".repeat(category.depth)}
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }}
      />

      <ControlledField
        control={form.control}
        name="shortDescription"
        label="Short description"
        description={`${shortDescriptionValue.length}/500 characters`}
        render={({ field, fieldState }) => (
          <Textarea
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
            rows={2}
            placeholder="One or two lines shown in search results and cards"
          />
        )}
      />

      <ControlledField
        control={form.control}
        name="description"
        label="Detailed description *"
        description={`${descriptionValue.length}/5000 characters, at least 50`}
        render={({ field, fieldState }) => (
          <Textarea
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
            rows={8}
            placeholder="Describe the business — services, why customers should choose it…"
          />
        )}
      />
    </div>
  );
}
