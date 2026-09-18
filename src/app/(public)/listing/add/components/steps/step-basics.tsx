"use client";

import { useEffect, useState } from "react";
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
import type { ListingFormValues } from "@/lib/schemas/listing-schema";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
};

// Turn the flat category list into a hierarchy-friendly (parent → child) order
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

export function StepBasics() {
  const form = useFormContext<ListingFormValues>();
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
        // Leave the dropdown empty; the field error will guide the user
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const categoryOptions = buildCategoryOptions(categories);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">মূল তথ্য</h2>
        <p className="mt-1 text-sm text-[#6B6656]">
          আপনার প্রতিষ্ঠানের নাম ও সংক্ষিপ্ত পরিচিতি দিন — এটিই ভিজিটররা প্রথমে দেখবে।
        </p>
      </div>

      <ControlledField
        control={form.control}
        name="title"
        label="প্রতিষ্ঠানের নাম *"
        render={({ field, fieldState }) => (
          <Input
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
            placeholder="যেমন: গ্রিন লিফ কফি হাউস"
          />
        )}
      />

      <ControlledField
        control={form.control}
        name="tagline"
        label="ট্যাগলাইন"
        description="ঐচ্ছিক — লিস্টিং কার্ডে হেডলাইনের নিচে দেখা যাবে।"
        render={({ field, fieldState }) => (
          <Input
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
            placeholder="এক লাইনে আপনার ব্যবসার পরিচয়"
          />
        )}
      />


      <ControlledField
        control={form.control}
        name="categoryId"
        label="ক্যাটাগরি *"
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
                    isLoading
                      ? "ক্যাটাগরি লোড হচ্ছে..."
                      : "একটি ক্যাটাগরি বাছাই করুন"
                  }
                >
                  {selectedCategory?.name}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                  >
                    {category.depth > 0 &&
                      "— ".repeat(category.depth)}
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
        label="সংক্ষিপ্ত বিবরণ"
        description={`${shortDescriptionValue.length}/500 অক্ষর`}
        render={({ field, fieldState }) => (
          <Textarea
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
            rows={2}
            placeholder="সার্চ রেজাল্ট ও কার্ডে দেখানোর জন্য এক-দুই লাইনের বিবরণ"
          />
        )}
      />

      <ControlledField
        control={form.control}
        name="description"
        label="বিস্তারিত বিবরণ *"
        description={`${descriptionValue.length}/5000 অক্ষর, কমপক্ষে ৫০ অক্ষর`}
        render={({ field, fieldState }) => (
          <Textarea
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
            rows={7}
            placeholder="আপনার প্রতিষ্ঠান সম্পর্কে বিস্তারিত লিখুন — কী সেবা দেন, কেন গ্রাহকরা আপনাকে বেছে নেবেন..."
          />
        )}
      />
    </div>
  );
}
