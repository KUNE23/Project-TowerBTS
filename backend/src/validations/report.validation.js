import { z } from "zod";
import { dateString, paginationSchema, withDateRange } from "./shared.validation.js";

export const reportListQuerySchema = withDateRange(
  paginationSchema.extend({
    device_id: z.coerce.number().int().positive().optional(),
    start_date: dateString.optional(),
    end_date: dateString.optional(),
  }),
);

export const exportPdfQuerySchema = withDateRange(
  z
    .object({
      device_id: z.coerce.number().int().positive(),
      start_date: dateString,
      end_date: dateString,
      type: z.enum(["all", "temperature", "fan", "cable", "door"]).default("all"),
    })
    .refine(
      (value) => {
        const start = new Date(value.start_date);
        const end = new Date(value.end_date);
        const days = (end.getTime() - start.getTime()) / 86400000;
        return days <= 31;
      },
      {
        message: "Rentang tanggal maksimal 31 hari",
        path: ["end_date"],
      },
    ),
);
