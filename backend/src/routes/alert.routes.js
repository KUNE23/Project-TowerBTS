import { Router } from "express";
import { latestAlerts, listAlerts, resolveAlert } from "../controllers/alert.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { alertIdParamSchema, alertListQuerySchema } from "../validations/alert.validation.js";

const router = Router();

router.use(authMiddleware);
router.get("/latest", latestAlerts);
router.get("/", validate({ query: alertListQuerySchema }), listAlerts);
router.patch("/:id/resolve", validate({ params: alertIdParamSchema }), resolveAlert);

export default router;
