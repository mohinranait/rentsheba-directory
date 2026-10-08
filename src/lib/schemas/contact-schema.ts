import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .max(120, "Email is too long"),
  phone: z
    .string()
    .trim()
    .max(25, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  subject: z
    .string()
    .trim()
    .max(150, "Subject is too long")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(3000, "Message is too long (maximum 3000 characters)"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
