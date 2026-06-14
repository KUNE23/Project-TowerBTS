import { Router } from "express";
import { dashboardHistory, dashboardLatest } from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { dashboardHistoryQuerySchema, dashboardLatestQuerySchema } from "../validations/dashboard.validation.js";

const router = Router();

router.use(authMiddleware);
router.get("/latest", validate({ query: dashboardLatestQuerySchema }), dashboardLatest);
router.get("/history", validate({ query: dashboardHistoryQuerySchema }), dashboardHistory);

export default router;
