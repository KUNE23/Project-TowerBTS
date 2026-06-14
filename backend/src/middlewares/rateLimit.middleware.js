import rateLimit from "express-rate-limit";

const rateLimitResponse = {
  success: false,
  message: "Terlalu banyak request, coba lagi nanti",
  errors: [],
};

export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse,
});

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse,
});
