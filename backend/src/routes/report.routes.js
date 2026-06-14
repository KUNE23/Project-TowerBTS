import { Router } from "express";
import { exportPdf, listReports } from "../controllers/report.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { exportPdfQuerySchema, reportListQuerySchema } from "../validations/report.validation.js";

const router = Router();

router.use(authMiddleware, requireRole("supervisor"));
router.get("/", validate({ query: reportListQuerySchema }), listReports);
router.get("/pdf", validate({ query: exportPdfQuerySchema }), exportPdf);

export default router;
