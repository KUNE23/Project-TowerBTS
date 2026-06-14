import { Router } from "express";
import { changePassword, getProfile, login, register, updateProfile } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { loginRateLimit } from "../middlewares/rateLimit.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { changePasswordSchema, loginSchema, registerSchema, updateProfileSchema } from "../validations/auth.validation.js";

const router = Router();

router.post("/register", validate({ body: registerSchema }), register);
router.post("/login", loginRateLimit, validate({ body: loginSchema }), login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, validate({ body: updateProfileSchema }), updateProfile);
router.put("/change-password", authMiddleware, validate({ body: changePasswordSchema }), changePassword);

export default router;
