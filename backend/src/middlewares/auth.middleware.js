import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return next(new AppError("Token tidak tersedia", 401));
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return next(new AppError("User tidak valid", 401));
    }

    req.user = user;
    return next();
  } catch {
    return next(new AppError("Token tidak valid", 401));
  }
};

export const deviceApiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-device-api-key"];

  if (!apiKey || apiKey !== env.deviceApiKey) {
    return next(new AppError("Device API key tidak valid", 401));
  }

  return next();
};
