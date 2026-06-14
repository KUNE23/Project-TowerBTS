import { AppError } from "../utils/AppError.js";

export const validate = (schemas) => (req, res, next) => {
  const errors = [];

  for (const [key, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(req[key]);

    if (!result.success) {
      errors.push(
        ...result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      );
      continue;
    }

    req[key] = result.data;
  }

  if (errors.length > 0) {
    return next(new AppError("Validasi gagal", 400, errors));
  }

  return next();
};
