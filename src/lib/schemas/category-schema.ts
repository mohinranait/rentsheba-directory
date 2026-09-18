import { z } from "zod";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
  slug: z
    .string()
    .trim()
    .max(100, "Slug must be at most 100 characters")
    .refine(
      (value) => value === "" || SLUG_PATTERN.test(value),
      "Use lowercase letters, numbers and dashes only (e.g. restaurant-delivery)",
    ),
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  image: z
    .string()
    .trim()
    .url("Provide a valid image URL (https://...)")
    .optional()
    .or(z.literal("")),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
