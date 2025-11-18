import { z } from "zod";

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Full name can only contain letters, spaces, hyphens, and apostrophes"),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .max(200, "Address must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  avatarUrl: z
    .string()
    .trim()
    .url("Invalid URL format")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;
