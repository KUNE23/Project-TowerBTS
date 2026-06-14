import { z } from "zod";
import { idParamSchema, paginationSchema } from "./shared.validation.js";

export const deviceIdParamSchema = idParamSchema;

export const createDeviceSchema = z.object({
  device_code: z.string().min(2).max(50),
  device_name: z.string().min(2).max(100),
  status: z.enum(["online", "offline"]).optional(),
});

export const deviceListQuerySchema = paginationSchema.extend({
  search: z.string().max(100).optional(),
  status: z.enum(["online", "offline"]).optional(),
});
