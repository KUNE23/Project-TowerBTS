import { z } from "zod";

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const dateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Tanggal tidak valid");

export const withDateRange = (schema) =>
  schema.refine(
    (value) => {
      if (!value.start_date || !value.end_date) {
        return true;
      }

      return new Date(value.start_date) <= new Date(value.end_date);
    },
    {
      message: "start_date tidak boleh lebih besar dari end_date",
      path: ["start_date"],
    },
  );
