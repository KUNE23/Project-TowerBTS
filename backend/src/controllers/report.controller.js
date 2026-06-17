import PDFDocument from "pdfkit";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { sendPaginated } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination, getPaginationMeta } from "../utils/pagination.js";

const formatDateTime = (date) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Asia/Jakarta",
  }).format(date);

const drawTable = (doc, { headers, rows, columnWidths }) => {
  const startX = doc.page.margins.left;
  const rowHeight = 24;
  const tableWidth = columnWidths.reduce((total, width) => total + width, 0);

  const drawRow = (cells, options = {}) => {
    if (doc.y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
    }

    const y = doc.y;
    let x = startX;

    doc
      .lineWidth(0.5)
      .strokeColor("#d1d5db")
      .rect(startX, y, tableWidth, rowHeight)
      .stroke();

    cells.forEach((cell, index) => {
      const width = columnWidths[index];

      if (index > 0) {
        doc.moveTo(x, y).lineTo(x, y + rowHeight).stroke();
      }

      doc
        .font(options.bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(options.fontSize || 8)
        .fillColor("#111827")
        .text(String(cell ?? "-"), x + 4, y + 7, {
          width: width - 8,
          height: rowHeight - 8,
          ellipsis: true,
        });

      x += width;
    });

    doc.y = y + rowHeight;
  };

  drawRow(headers, { bold: true, fontSize: 8 });
  rows.forEach((row) => drawRow(row));
};

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

  doc.font("Helvetica-Bold").fontSize(18).text("BTSense Sensor Report", { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(12).text("Dashboard Monitoring Sensor Tower BTS", { align: "center" });
  doc.moveDown();

  doc.font("Helvetica-Bold").fontSize(11).text("Informasi Laporan");
  doc.font("Helvetica").fontSize(10);
  doc.text(`Device      : ${device?.deviceCode || "-"} - ${device?.deviceName || "-"}`);
  doc.text(`Periode     : ${req.query.start_date} sampai ${req.query.end_date}`);
  doc.text(`Jenis Data  : ${req.query.type}`);
  doc.moveDown();

  doc.font("Helvetica-Bold").fontSize(13).text("Sensor Logs");
  doc.moveDown(0.4);
  drawTable(doc, {
    headers: ["Waktu", "Temp", "Temp Status", "Fan", "RPM", "Cable", "Door", "Overall"],
    columnWidths: [92, 42, 70, 58, 42, 58, 50, 58],
    rows: logs.slice(0, 60).map((log) => [
      formatDateTime(log.createdAt),
      log.temperature ?? "-",
      log.temperatureStatus,
      log.fanStatus,
      log.fanRpm,
      log.cableStatus,
      log.doorStatus,
      log.overallStatus,
    ]),
  });

  doc.moveDown();

  doc.font("Helvetica-Bold").fontSize(13).text("Alerts");
  doc.moveDown(0.4);
  drawTable(doc, {
    headers: ["Waktu", "Severity", "Type", "Status", "Message"],
    columnWidths: [100, 60, 60, 70, 180],
    rows: alerts.slice(0, 40).map((alert) => [
      formatDateTime(alert.createdAt),
      alert.severity,
      alert.alertType,
      alert.status,
      alert.message,
    ]),
  });

  doc.end();
});
