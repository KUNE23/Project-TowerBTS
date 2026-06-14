import { prisma } from "../config/prisma.js";
import { getIo } from "../sockets/index.js";
import { getAlertRules, getOverallStatus } from "../utils/sensorStatus.js";

export const sensorLogSelect = {
  id: true,
  temperature: true,
  temperatureStatus: true,
  fanStatus: true,
  fanRpm: true,
  cableStatus: true,
  doorStatus: true,
  overallStatus: true,
  createdAt: true,
  device: {
    select: {
      id: true,
      deviceCode: true,
      deviceName: true,
      status: true,
    },
  },
};

const buildLogInput = (body) => ({
  temperatureStatus: body.temperature_status,
  fanStatus: body.fan_status,
  cableStatus: body.cable_status,
  doorStatus: body.door_status,
});

export const createSensorLogWithAlerts = async (body) => {
  const io = getIo();
  const now = new Date();
  const overallStatus = getOverallStatus(buildLogInput(body));
  const device = await prisma.device.upsert({
    where: { deviceCode: body.device_code },
    create: {
      deviceCode: body.device_code,
      deviceName: body.device_name || body.device_code,
      status: "online",
      lastSeen: now,
    },
    update: {
      deviceName: body.device_name || undefined,
      status: "online",
      lastSeen: now,
    },
    select: {
      id: true,
      deviceCode: true,
      deviceName: true,
      status: true,
    },
  });

  const log = await prisma.sensorLog.create({
    data: {
      deviceId: device.id,
      temperature: body.temperature,
      temperatureStatus: body.temperature_status,
      fanStatus: body.fan_status,
      fanRpm: body.fan_rpm,
      cableStatus: body.cable_status,
      doorStatus: body.door_status,
      overallStatus,
    },
    select: sensorLogSelect,
  });

  const alerts = await syncAlerts(device.id, log, now);
  emitRealtime(io, device, log, alerts, now);

  return { log, alerts };
};

const syncAlerts = async (deviceId, log, now) => {
  const rules = getAlertRules(log);
  const activeTypes = rules.filter((rule) => rule.active).map((rule) => rule.type);
  const resolvedTypes = rules.filter((rule) => rule.resolved).map((rule) => rule.type);
  const unresolved = activeTypes.length
    ? await prisma.alert.findMany({
        where: { deviceId, status: "unresolved", alertType: { in: activeTypes } },
        select: { alertType: true },
      })
    : [];
  const unresolvedTypes = new Set(unresolved.map((alert) => alert.alertType));
  const alertsToCreate = rules.filter((rule) => rule.active && !unresolvedTypes.has(rule.type));
  const createdAlerts = await Promise.all(
    alertsToCreate.map((rule) =>
      prisma.alert.create({
        data: {
          deviceId,
          sensorLogId: log.id,
          alertType: rule.type,
          severity: rule.severity,
          message: rule.message,
        },
        select: {
          id: true,
          alertType: true,
          message: true,
          severity: true,
          status: true,
          createdAt: true,
          deviceId: true,
        },
      }),
    ),
  );

  if (resolvedTypes.length) {
    await prisma.alert.updateMany({
      where: { deviceId, status: "unresolved", alertType: { in: resolvedTypes } },
      data: { status: "resolved", resolvedAt: now },
    });
  }

  return { createdAlerts, resolvedTypes };
};

const emitRealtime = (io, device, log, alerts, now) => {
  io?.emit("sensor:new", {
    id: log.id,
    device,
    temperature: log.temperature,
    temperatureStatus: log.temperatureStatus,
    fanStatus: log.fanStatus,
    fanRpm: log.fanRpm,
    cableStatus: log.cableStatus,
    doorStatus: log.doorStatus,
    overallStatus: log.overallStatus,
    createdAt: log.createdAt,
  });
  io?.emit("device:status", { deviceId: device.id, status: "online", lastSeen: now });
  alerts.resolvedTypes.forEach((type) => io?.emit("alert:resolved", { deviceId: device.id, alertType: type, resolvedAt: now }));
  alerts.createdAlerts.forEach((alert) =>
    io?.emit("alert:new", {
      id: alert.id,
      deviceId: alert.deviceId,
      alertType: alert.alertType,
      message: alert.message,
      severity: alert.severity,
      status: alert.status,
      createdAt: alert.createdAt,
    }),
  );
};
