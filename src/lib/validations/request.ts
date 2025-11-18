import { z } from "zod";

export const requestSchema = z.object({
  startDate: z
    .date()
    .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: "Start date cannot be in the past",
    }),
  endDate: z
    .date()
    .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: "End date cannot be in the past",
    }),
}).refine(
  (data) => {
    return data.endDate >= data.startDate;
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export const handoverCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .length(4, "Handover code must be exactly 4 digits")
    .regex(/^[0-9]{4}$/, "Handover code must be 4 digits"),
});

export const returnCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .length(4, "Return code must be exactly 4 digits")
    .regex(/^[0-9]{4}$/, "Return code must be 4 digits"),
});

export type RequestInput = z.infer<typeof requestSchema>;
export type HandoverCodeInput = z.infer<typeof handoverCodeSchema>;
export type ReturnCodeInput = z.infer<typeof returnCodeSchema>;
