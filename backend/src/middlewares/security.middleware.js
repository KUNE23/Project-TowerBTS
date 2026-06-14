import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { sanitizeInput } from "../utils/sanitize.js";

export const securityMiddleware = [
  helmet(),
  cors({
    origin(origin, callback) {
      if (!origin || origin === env.clientUrl) {
        return callback(null, true);
      }

      return callback(new AppError("Origin tidak diizinkan", 403));
    },
    credentials: true,
  }),
  express.json({ limit: "10kb" }),
  express.urlencoded({ extended: true, limit: "10kb" }),
  hpp(),
  compression(),
  cookieParser(),
  sanitizeInput,
];
