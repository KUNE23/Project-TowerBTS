import { Router } from "express";
import { createDevice, getDeviceById, listDevices } from "../controllers/device.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createDeviceSchema, deviceIdParamSchema, deviceListQuerySchema } from "../validations/device.validation.js";

const router = Router();

router.use(authMiddleware);
router.get("/", validate({ query: deviceListQuerySchema }), listDevices);
router.get("/:id", validate({ params: deviceIdParamSchema }), getDeviceById);
router.post("/", requireRole("supervisor"), validate({ body: createDeviceSchema }), createDevice);

export default router;
