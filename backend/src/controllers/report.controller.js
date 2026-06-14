import PDFDocument from "pdfkit";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { sendPaginated } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination, getPaginationMeta } from "../utils/pagination.js";

export const listReports = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const where = {
    ...(req.query.device_id && { deviceId: req.query.device_id }),
    ...(req.query.start_date || req.query.end_date
      ? {
          startDate: {
            ...(req.query.start_date && { gte: new Date(req.query.start_date) }),
          },
          endDate: {
            ...(req.query.end_date && { lte: new Date(req.query.end_date) }),
          },
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.exportReport.findMany({
      where,
      select: {
        id: true,
        startDate: true,
        endDate: true,
        fileFormat: true,
        fileUrl: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true, role: true } },
        device: { select: { id: true, deviceCode: true, deviceName: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.exportReport.count({ where }),
  ]);

  sendPaginated(res, "Data berhasil diambil", data, getPaginationMeta(total, page, limit));
});

export const exportPdf = asyncHandler(async (req, res) => {
  const start = new Date(req.query.start_date);
  const end = new Date(req.query.end_date);
  end.setHours(23, 59, 59, 999);
  const where = {
    deviceId: req.query.device_id,
    createdAt: { gte: start, lte: end },
  };

  const [device, logs, alerts] = await Promise.all([
    prisma.device.findUnique({
      where: { id: req.query.device_id },
      select: { id: true, deviceCode: true, deviceName: true },
    }),
    prisma.sensorLog.findMany({
      where,
      select: {
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
      take: 1000,
    }),
    prisma.alert.findMany({
      where,
      select: {
        alertType: true,
        severity: true,
        status: true,
        message: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  if (!device) {
    throw new AppError("Device tidak ditemukan", 404);
  }

  await prisma.exportReport.create({
    data: {
      userId: req.user.id,
      deviceId: req.query.device_id,
      startDate: start,
      endDate: end,
      fileFormat: "pdf",
    },
    select: { id: true },
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="btsense-report-${device?.deviceCode || "device"}.pdf"`);

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  doc.pipe(res);
  doc.fontSize(18).text("BTSense Sensor Report");
  doc.moveDown();
  doc.fontSize(11).text(`Device: ${device?.deviceCode || "-"} - ${device?.deviceName || "-"}`);
  doc.text(`Periode: ${req.query.start_date} sampai ${req.query.end_date}`);
  doc.text(`Jenis data: ${req.query.type}`);
  doc.moveDown();
  doc.fontSize(13).text("Sensor Logs");
  logs.slice(0, 60).forEach((log) => {
    doc.fontSize(9).text(`${log.createdAt.toISOString()} | Temp ${log.temperature ?? "-"} | Fan ${log.fanStatus}/${log.fanRpm} | Cable ${log.cableStatus} | Door ${log.doorStatus} | ${log.overallStatus}`);
  });
  doc.moveDown();
  doc.fontSize(13).text("Alerts");
  alerts.slice(0, 40).forEach((alert) => {
    doc.fontSize(9).text(`${alert.createdAt.toISOString()} | ${alert.severity} | ${alert.alertType} | ${alert.status} | ${alert.message}`);
  });
  doc.end();
});
