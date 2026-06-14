import { z } from "zod";
import { dateString, idParamSchema, paginationSchema, withDateRange } from "./shared.validation.js";

export const alertIdParamSchema = idParamSchema;

export const alertListQuerySchema = withDateRange(
  paginationSchema.extend({
    device_id: z.coerce.number().int().positive().optional(),
    severity: z.enum(["info", "warning", "critical"]).optional(),
    status: z.enum(["unresolved", "resolved"]).optional(),
    alert_type: z.enum(["temperature", "fan", "cable", "door"]).optional(),
    start_date: dateString.optional(),
    end_date: dateString.optional(),
  }),
);
