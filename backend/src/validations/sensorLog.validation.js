import { z } from "zod";
import { dateString, paginationSchema, withDateRange } from "./shared.validation.js";

export const createSensorLogSchema = z.object({
  device_code: z.string().min(2).max(50),
  device_name: z.string().min(2).max(100).optional(),
  temperature: z.coerce.number().min(-50).max(120).optional().nullable(),
  temperature_status: z.enum(["normal", "warning", "critical"]).default("normal"),
  fan_status: z.enum(["running", "stopped"]).default("stopped"),
  fan_rpm: z.coerce.number().int().min(0).max(20000).default(0),
  cable_status: z.enum(["connected", "cut"]).default("connected"),
  door_status: z.enum(["closed", "open"]).default("closed"),
});

export const sensorLogListQuerySchema = withDateRange(
  paginationSchema.extend({
    device_id: z.coerce.number().int().positive().optional(),
    status: z.enum(["normal", "warning", "critical"]).optional(),
    start_date: dateString.optional(),
    end_date: dateString.optional(),
  }),
);
