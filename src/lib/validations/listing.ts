import { z } from "zod";

export const listingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(1000, "Description must be less than 1000 characters"),
  category: z
    .string()
    .min(1, "Category is required"),
  listingType: z
    .enum(["share", "rent"], {
      errorMap: () => ({ message: "Listing type must be either 'share' or 'rent'" }),
    }),
  pricePerDay: z
    .number()
    .min(0, "Price must be at least 0")
    .max(1000000, "Price must be less than 1,000,000")
    .optional(),
  depositAmount: z
    .number()
    .min(0, "Deposit must be at least 0")
    .max(1000000, "Deposit must be less than 1,000,000")
    .optional(),
  creditCost: z
    .number()
    .int("Credits must be a whole number")
    .min(1, "Credit cost must be at least 1")
    .max(1000, "Credit cost must be less than 1000")
    .optional(),
  availableFrom: z
    .date()
    .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: "Available from date cannot be in the past",
    }),
  availableUntil: z
    .date()
    .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: "Available until date cannot be in the past",
    }),
}).refine(
  (data) => {
    if (data.listingType === "rent") {
      return data.pricePerDay !== undefined && data.pricePerDay > 0;
    }
    return true;
  },
  {
    message: "Price per day is required for rental listings",
    path: ["pricePerDay"],
  }
).refine(
  (data) => {
    if (data.listingType === "share") {
      return data.creditCost !== undefined && data.creditCost > 0;
    }
    return true;
  },
  {
    message: "Credit cost is required for share listings",
    path: ["creditCost"],
  }
).refine(
  (data) => {
    return data.availableUntil >= data.availableFrom;
  },
  {
    message: "Available until date must be after available from date",
    path: ["availableUntil"],
  }
);

export type ListingInput = z.infer<typeof listingSchema>;
