import { computed, reactive } from "vue";
import { compactNumber, formatTime } from "../utils/formatters.js";
import * as dashboardService from "../services/dashboardService.js";

const state = reactive({
  device: {
    id: null,
    code: "-",
    status: "offline",
  },
  sensorSummary: {
    temperature: {
      value: null,
      unit: "°C",
      status: "-",
    },
    fan: {
      status: "-",
      rpm: null,
      rpmStatus: "-",
    },
    cable: {
      status: "-",
    },
    door: {
      status: "-",
    },
    overallStatus: "-",
    lastUpdated: "-",
  },
  sensorRows: [],
  temperatureHistory: [],
  rpmHistory: [],
  alerts: [],
  toasts: [],
  loading: false,
  refreshing: false,
  error: "",
  hasLoaded: false,
});

const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== "");

const normalizeStatus = (value, fallback = "-") => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value).trim().toLowerCase();
};

const normalizeTime = (value) => {
  if (!value) {
    return formatTime();
  }

  if (typeof value === "string") {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? value : formatTime(new Date(timestamp));
  }

  return formatTime(value);
};

const asArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.logs)) {
    return value.logs;
  }

  if (Array.isArray(value?.sensorLogs)) {
    return value.sensorLogs;
  }

  if (Array.isArray(value?.data?.data)) {
    return value.data.data;
  }

  if (Array.isArray(value?.data?.logs)) {
    return value.data.logs;
  }

  return [];
};

const unwrapPayload = (payload) => payload?.data ?? payload ?? {};

const pickLatestLog = (payload) => {
  const body = unwrapPayload(payload);

  return (
    body.latestLog ||
    body.sensorLog ||
    body.summary ||
    body.latestSensorLog ||
    body.latest ||
    body.log ||
    asArray(body)[0] ||
    null
  );
};

const pickDevice = (payload, log = {}) => {
  const body = unwrapPayload(payload);
  const device = body.device || body.latestDevice || body.deviceLatest || log.device || {};

  return {
    id: firstDefined(device.id, log.device_id, log.deviceId, null),
    code: firstDefined(device.code, device.deviceCode, device.device_code, device.deviceName, device.name, device.id, log.device_code, log.deviceId, "-"),
    status: normalizeStatus(firstDefined(device.status, log.device_status), "online"),
  };
};

const normalizeSensorLog = (log = {}) => {
  const temperature = firstDefined(log.temperature, log.temperature_value, log.temp, log.suhu);
  const fanRpm = firstDefined(log.fan_rpm, log.fanRPM, log.rpm, log.fan?.rpm);
  const updatedAt = firstDefined(log.updated_at, log.updatedAt, log.created_at, log.createdAt, log.timestamp, log.time);
  const temperatureStatus = normalizeStatus(
    firstDefined(log.temperature_status, log.temperatureStatus, log.temp_status, log.status_temperature),
    normalizeStatus(log.status, "normal"),
  );
  const fanStatus = normalizeStatus(firstDefined(log.fan_status, log.fanStatus, log.fan?.status), "-");
  const fanRpmStatus = normalizeStatus(firstDefined(log.fan_rpm_status, log.fanRpmStatus, log.rpm_status), fanStatus);
  const cableStatus = normalizeStatus(firstDefined(log.cable_status, log.cableStatus, log.cable?.status), "-");
  const doorStatus = normalizeStatus(firstDefined(log.door_status, log.doorStatus, log.door?.status), "-");
  const overallStatus = normalizeStatus(
    firstDefined(log.overall_status, log.overallStatus, log.system_status, log.status),
    temperatureStatus,
  );

  return {
    id: firstDefined(log.id, log._id, updatedAt, Date.now()),
    temperature,
    temperatureStatus,
    fanStatus,
    fanRpm,
    fanRpmStatus,
    cableStatus,
    doorStatus,
    overallStatus,
    updatedAt: normalizeTime(updatedAt),
  };
};

const normalizeAlert = (alert = {}) => ({
  id: firstDefined(alert.id, alert._id, alert.created_at, alert.createdAt, Date.now()),
  type: firstDefined(alert.type, alert.category, "info"),
  title: firstDefined(alert.title, alert.name, "Alert Terbaru"),
  message: firstDefined(alert.message, alert.description, alert.detail, "Alert diterima dari sistem."),
  severity: normalizeStatus(firstDefined(alert.severity, alert.level, alert.status), "info"),
  createdAt: normalizeTime(firstDefined(alert.created_at, alert.createdAt, alert.timestamp)),
});

const formatTemperature = (value) => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return `${value}°C`;
};

const buildRows = (logs) =>
  logs.map((log, index) => {
    const item = normalizeSensorLog(log);

    return {
      ...item,
      id: item.id || index,
      temperatureLabel: formatTemperature(item.temperature),
      fanRpmLabel: item.fanRpm === undefined || item.fanRpm === null || item.fanRpm === "" ? "-" : `${compactNumber(item.fanRpm)} RPM`,
    };
  });

const applyLatestLog = (log, sourcePayload) => {
  if (!log) {
    return;
  }

  const item = normalizeSensorLog(log);
  state.device = pickDevice(sourcePayload, log);
  state.sensorSummary = {
    temperature: {
      value: item.temperature,
      unit: "°C",
      status: item.temperatureStatus,
    },
    fan: {
      status: item.fanStatus,
      rpm: item.fanRpm,
      rpmStatus: item.fanRpmStatus,
    },
    cable: {
      status: item.cableStatus,
    },
    door: {
      status: item.doorStatus,
    },
    overallStatus: item.overallStatus,
    lastUpdated: item.updatedAt,
  };
};

const applyLogs = (logs) => {
  state.sensorRows = buildRows(logs).slice(0, 10);
  const chartRows = [...state.sensorRows].reverse();

  state.temperatureHistory = chartRows
    .filter((row) => Number.isFinite(Number(row.temperature)))
    .map((row) => ({ label: row.updatedAt, value: Number(row.temperature) }));

  state.rpmHistory = chartRows
    .filter((row) => Number.isFinite(Number(row.fanRpm)))
    .map((row) => ({ label: row.updatedAt, value: Number(row.fanRpm) }));
};

const getErrorMessage = (error) => {
  if (error?.response?.status === 401) {
    const hasToken = Boolean(localStorage.getItem("token"));
    return hasToken
      ? "Akses ditolak. Token login tidak valid atau sudah kedaluwarsa."
      : "Endpoint dashboard membutuhkan login. Silakan login agar token Authorization dikirim.";
  }

  if (error?.code === "ERR_NETWORK") {
    return "Backend tidak bisa diakses. Pastikan server API berjalan di VITE_API_URL.";
  }

  return error?.message || "Gagal mengambil data dashboard.";
};

export const useDashboardStore = () => {
  const latestUpdate = computed(() => state.sensorSummary.lastUpdated || "-");

  const applySensorPayload = (payload = {}) => {
    const log = pickLatestLog(payload) || payload;
    applyLatestLog(log, payload);
  };

  const addAlert = (alert) => {
    const nextAlert = normalizeAlert(alert);

    state.alerts = [nextAlert, ...state.alerts.filter((item) => item.id !== nextAlert.id)].slice(0, 6);
    state.toasts = [nextAlert, ...state.toasts].slice(0, 3);

    window.setTimeout(() => {
      state.toasts = state.toasts.filter((item) => item.id !== nextAlert.id);
    }, 4200);
  };

  const loadDashboard = async () => {
    state.loading = !state.hasLoaded;
    state.refreshing = state.hasLoaded;
    state.error = "";

    try {
      let latestPayload = null;
      let logsPayload = null;

      try {
        latestPayload = await dashboardService.getDashboardLatest();
      } catch (error) {
        latestPayload = null;
      }

      try {
        logsPayload = await dashboardService.getSensorLogs({ page: 1, limit: 10 });
      } catch (error) {
        if (!latestPayload) {
          throw error;
        }
      }

      const logs = asArray(unwrapPayload(logsPayload));
      if (logs.length > 0) {
        applyLogs(logs);
      }

      const latestLog = pickLatestLog(latestPayload) || logs[0];
      applyLatestLog(latestLog, latestPayload || logsPayload);

      try {
        const alertsPayload = await dashboardService.getLatestAlerts();
        const alerts = asArray(unwrapPayload(alertsPayload));

        if (alerts.length > 0) {
          state.alerts = alerts.map(normalizeAlert).slice(0, 6);
        } else if (alertsPayload && !Array.isArray(alertsPayload)) {
          const alert = pickLatestLog(alertsPayload);
          state.alerts = alert ? [normalizeAlert(alert)] : [];
        }
      } catch {
        state.alerts = [];
      }

      state.hasLoaded = true;
    } catch (error) {
      state.error = getErrorMessage(error);
      state.hasLoaded = true;
    } finally {
      state.loading = false;
      state.refreshing = false;
    }
  };

  return {
    state,
    latestUpdate,
    loadDashboard,
    applySensorPayload,
    addAlert,
  };
};
