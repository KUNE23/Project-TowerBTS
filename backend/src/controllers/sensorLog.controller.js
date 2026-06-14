import { prisma } from "../config/prisma.js";
import { createSensorLogWithAlerts, sensorLogSelect } from "../services/sensorLog.service.js";
import { sendPaginated, sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination, getPaginationMeta } from "../utils/pagination.js";

export const listSensorLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const where = {
    ...(req.query.device_id && { deviceId: req.query.device_id }),
    ...(req.query.status && { overallStatus: req.query.status }),
    ...(req.query.start_date || req.query.end_date
      ? {
          createdAt: {
            ...(req.query.start_date && { gte: new Date(req.query.start_date) }),
            ...(req.query.end_date && { lte: new Date(req.query.end_date) }),
          },
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.sensorLog.findMany({
      where,
      select: sensorLogSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.sensorLog.count({ where }),
  ]);

  sendPaginated(res, "Data berhasil diambil", data, getPaginationMeta(total, page, limit));
});

export const createSensorLog = asyncHandler(async (req, res) => {
  const result = await createSensorLogWithAlerts(req.body);
  sendSuccess(res, "Sensor log berhasil dibuat", { log: result.log, alerts: result.alerts.createdAlerts }, 201);
});
