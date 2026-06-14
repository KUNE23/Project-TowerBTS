import { AppError } from "../utils/AppError.js";

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError("Akses ditolak", 403));
  }

  return next();
};
