import { z } from "zod";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const MAX_IMAGE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const categoryImageFile = z
  .custom<File>((value) => value instanceof File, "Please choose an image file")
  .refine(
    (file) => file.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024,
    `Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB`,
  )
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Only JPG, PNG or WEBP images are allowed",
  );

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
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
  image: categoryImageFile.nullable().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
