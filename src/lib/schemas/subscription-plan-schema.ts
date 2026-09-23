import { z } from "zod";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const PLAN_TYPE_VALUES = ["FREE", "YEARLY"] as const;

export const subscriptionPlanFormSchema = z.object({
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
      "Use lowercase letters, numbers and dashes only (e.g. pro-yearly)",
    ),
  type: z.enum(PLAN_TYPE_VALUES, {
    errorMap: () => ({ message: "Select a plan type" }),
  }),
  price: z
    .number({ invalid_type_error: "Enter a valid price" })
    .min(0, "Price cannot be negative")
    .max(10_000_000, "Price must be 10,000,000 or less"),
  maxListings: z
    .number({ invalid_type_error: "Enter a valid number" })
    .int("Max listings must be a whole number")
    .min(0, "Max listings cannot be negative")
    .max(100_000, "Max listings must be 100,000 or less"),
  durationInDays: z
    .number({ invalid_type_error: "Enter a valid number" })
    .int("Duration must be a whole number of days")
    .min(0, "Duration cannot be negative")
    .max(3650, "Duration must be 3650 days or less"),
  description: z
    .string()
    .trim()
    .max(300, "Description must be at most 300 characters"),
  features: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Feature cannot be empty")
        .max(120, "Each feature must be at most 120 characters"),
    )
    .max(12, "You can add up to 12 features"),
  badge: z.string().trim().max(30, "Badge must be at most 30 characters"),
  isActive: z.boolean(),
});

export type SubscriptionPlanFormValues = z.infer<
  typeof subscriptionPlanFormSchema
>;
