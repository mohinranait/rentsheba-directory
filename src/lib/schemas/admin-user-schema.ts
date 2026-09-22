import { z } from "zod";

const ROLE_VALUES = ["USER", "MANAGER", "ADMIN"] as const;
const STATUS_VALUES = ["ACTIVE", "BLOCKED", "DELETED"] as const;

const MAX_IMAGE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const userImageFile = z
  .custom<File>((value) => value instanceof File, "Please choose an image file")
  .refine(
    (file) => file.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024,
    `Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB`,
  )
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Only JPG, PNG or WEBP images are allowed",
  );

export const adminUserFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
  email: z
    .string()
    .trim()
    .min(3, "Email is required")
    .max(120, "Email must be at most 120 characters")
    .toLowerCase()
    .email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .max(30, "Phone must be at most 30 characters")
    .optional()
    .or(z.literal("")),
  role: z.enum(ROLE_VALUES),
  status: z.enum(STATUS_VALUES),
  isVerified: z.boolean().optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  image: userImageFile.nullable().optional(),
});

export type AdminUserFormValues = z.infer<typeof adminUserFormSchema>;
