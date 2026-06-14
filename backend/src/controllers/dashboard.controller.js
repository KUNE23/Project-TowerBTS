import { prisma } from "../config/prisma.js";
import { sendPaginated, sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination, getPaginationMeta } from "../utils/pagination.js";

const tableFromLog = (log) => [
  { sensor: "Suhu Rak 1", value: `${log.temperature ?? "-"}°C`, status: log.temperatureStatus, updatedAt: log.createdAt },
  { sensor: "Fan Exhaust A", value: `${log.fanRpm} RPM`, status: log.fanStatus === "running" ? "stable" : "critical", updatedAt: log.createdAt },
  { sensor: "Power Cable Main", value: log.cableStatus === "connected" ? "Connect" : "Cut", status: log.cableStatus === "connected" ? "normal" : "critical", updatedAt: log.createdAt },
  { sensor: "Main Door", value: log.doorStatus === "closed" ? "Tertutup" : "Terbuka", status: log.doorStatus === "closed" ? "safe" : "warning", updatedAt: log.createdAt },
];

export const dashboardLatest = asyncHandler(async (req, res) => {
  const device = await prisma.device.findFirst({
    where: req.query.device_id ? { id: req.query.device_id } : undefined,
    select: {
      id: true,
      deviceCode: true,
      deviceName: true,
      status: true,
      lastSeen: true,
    },
    orderBy: { id: "asc" },
  });

  if (!device) {
    return sendSuccess(res, "Data dashboard berhasil diambil", {
      device: null,
      summary: null,
      charts: { temperature: [], fan_rpm: [] },
      sensor_table: [],
      alerts: [],
    });
  }

  const [latestLog, history, alerts] = await Promise.all([
    prisma.sensorLog.findFirst({
      where: { deviceId: device.id },
      select: {
        id: true,
        temperature: true,
        temperatureStatus: true,
        fanStatus: true,
        fanRpm: true,
        cableStatus: true,
        doorStatus: true,
        overallStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.sensorLog.findMany({
      where: { deviceId: device.id },
      select: {
        id: true,
        temperature: true,
        fanRpm: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.alert.findMany({
      where: { deviceId: device.id },
      select: {
        id: true,
        alertType: true,
        message: true,
        severity: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  sendSuccess(res, "Data dashboard berhasil diambil", {
    device,
    summary: latestLog,
    charts: {
      temperature: history.map((item) => ({ time: item.createdAt, value: item.temperature })).reverse(),
      fan_rpm: history.map((item) => ({ time: item.createdAt, value: item.fanRpm })).reverse(),
    },
    sensor_table: latestLog ? tableFromLog(latestLog) : [],
    alerts,
  });
});

export const dashboardHistory = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const where = {
    ...(req.query.device_id && { deviceId: req.query.device_id }),
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
      select: {
        id: true,
        temperature: true,
        temperatureStatus: true,
        fanStatus: true,
        fanRpm: true,
        cableStatus: true,
        doorStatus: true,
        overallStatus: true,
        createdAt: true,
        device: { select: { id: true, deviceCode: true, deviceName: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.sensorLog.count({ where }),
  ]);

  sendPaginated(res, "Data berhasil diambil", data, getPaginationMeta(total, page, limit));
});
