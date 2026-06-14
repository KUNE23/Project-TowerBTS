import { env } from "../config/env.js";

export const notFoundHandler = (req, res, next) => {
  const error = new Error("Endpoint tidak ditemukan");
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const prismaError = mapPrismaError(err);
  const statusCode = prismaError.statusCode || err.statusCode || 500;
  const response = {
    success: false,
    message: statusCode === 500 && env.nodeEnv === "production" ? "Terjadi kesalahan server" : prismaError.message || err.message,
    errors: err.errors || [],
  };

  if (env.nodeEnv !== "production" && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

const mapPrismaError = (err) => {
  if (err.code === "P2002") {
    return { statusCode: 409, message: "Data sudah digunakan" };
  }

  if (err.code === "P2025") {
    return { statusCode: 404, message: "Data tidak ditemukan" };
  }

  return {};
};
