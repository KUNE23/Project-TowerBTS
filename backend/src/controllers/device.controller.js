import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { sendPaginated, sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination, getPaginationMeta } from "../utils/pagination.js";

const deviceSelect = {
  id: true,
  deviceCode: true,
  deviceName: true,
  status: true,
  lastSeen: true,
  createdAt: true,
  updatedAt: true,
};

export const listDevices = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const where = {
    ...(req.query.status && { status: req.query.status }),
    ...(req.query.search && {
      OR: [
        { deviceCode: { contains: req.query.search, mode: "insensitive" } },
        { deviceName: { contains: req.query.search, mode: "insensitive" } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.device.findMany({
      where,
      select: deviceSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.device.count({ where }),
  ]);

  sendPaginated(res, "Data berhasil diambil", data, getPaginationMeta(total, page, limit));
});

export const getDeviceById = asyncHandler(async (req, res) => {
  const device = await prisma.device.findUnique({
    where: { id: req.params.id },
    select: deviceSelect,
  });

  if (!device) {
    throw new AppError("Device tidak ditemukan", 404);
  }

  sendSuccess(res, "Device berhasil diambil", device);
});

export const createDevice = asyncHandler(async (req, res) => {
  const device = await prisma.device.create({
    data: {
      deviceCode: req.body.device_code,
      deviceName: req.body.device_name,
      status: req.body.status || "offline",
    },
    select: deviceSelect,
  });

  sendSuccess(res, "Device berhasil dibuat", device, 201);
});
