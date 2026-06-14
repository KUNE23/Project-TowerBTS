import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(100),
  password: z.string().min(8).max(72),
  role: z.enum(["technician", "supervisor"]).optional(),
  phone: z.string().max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(1).max(72),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1).max(72),
  newPassword: z.string().min(8).max(72),
});
