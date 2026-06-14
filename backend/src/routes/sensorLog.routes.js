import { Router } from "express";
import { createSensorLog, listSensorLogs } from "../controllers/sensorLog.controller.js";
import { authMiddleware, deviceApiKeyMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createSensorLogSchema, sensorLogListQuerySchema } from "../validations/sensorLog.validation.js";

const router = Router();

router.post("/", deviceApiKeyMiddleware, validate({ body: createSensorLogSchema }), createSensorLog);
router.get("/", authMiddleware, validate({ query: sensorLogListQuerySchema }), listSensorLogs);

export default router;
