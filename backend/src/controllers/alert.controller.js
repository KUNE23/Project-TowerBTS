import { prisma } from "../config/prisma.js";
import { getIo } from "../sockets/index.js";
import { AppError } from "../utils/AppError.js";
import { sendPaginated, sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination, getPaginationMeta } from "../utils/pagination.js";

const alertSelect = {
  id: true,
  alertType: true,
  message: true,
  severity: true,
  status: true,
  createdAt: true,
  resolvedAt: true,
  device: {
    select: {
      id: true,
      deviceCode: true,
      deviceName: true,
    },
  },
  sensorLog: {
    select: {
      id: true,
      temperature: true,
      fanRpm: true,
      createdAt: true,
    },
  },
};

export const listAlerts = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const where = {
    ...(req.query.device_id && { deviceId: req.query.device_id }),
    ...(req.query.severity && { severity: req.query.severity }),
    ...(req.query.status && { status: req.query.status }),
    ...(req.query.alert_type && { alertType: req.query.alert_type }),
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
    prisma.alert.findMany({
      where,
      select: alertSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.alert.count({ where }),
  ]);

  sendPaginated(res, "Data berhasil diambil", data, getPaginationMeta(total, page, limit));
});

export const latestAlerts = asyncHandler(async (req, res) => {
  const data = await prisma.alert.findMany({
    select: alertSelect,
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  sendSuccess(res, "Alert terbaru berhasil diambil", data);
});

export const resolveAlert = asyncHandler(async (req, res) => {
  const existing = await prisma.alert.findUnique({
    where: { id: req.params.id },
    select: { id: true, alertType: true, deviceId: true, status: true },
  });

  if (!existing) {
    throw new AppError("Alert tidak ditemukan", 404);
  }

  const alert = await prisma.alert.update({
    where: { id: req.params.id },
    data: { status: "resolved", resolvedAt: new Date() },
    select: alertSelect,
  });

  getIo()?.emit("alert:resolved", {
    id: alert.id,
    deviceId: existing.deviceId,
    alertType: existing.alertType,
    resolvedAt: alert.resolvedAt,
  });

  sendSuccess(res, "Alert berhasil diselesaikan", alert);
});
