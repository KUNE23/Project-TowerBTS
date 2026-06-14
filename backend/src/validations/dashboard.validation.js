import { z } from "zod";
import { dateString, paginationSchema, withDateRange } from "./shared.validation.js";

export const dashboardLatestQuerySchema = z.object({
  device_id: z.coerce.number().int().positive().optional(),
});

export const dashboardHistoryQuerySchema = withDateRange(
  paginationSchema.extend({
    device_id: z.coerce.number().int().positive().optional(),
    start_date: dateString.optional(),
    end_date: dateString.optional(),
  }),
);
