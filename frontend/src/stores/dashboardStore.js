import { computed, reactive } from "vue";
import { formatTime } from "../utils/formatters.js";
import * as dashboardService from "../services/dashboardService.js";

const state = reactive({
  device: {
    code: "BTS-DEMO-001",
    status: "online",
  },
  sensorSummary: {
    temperature: {
      value: 36.8,
      unit: "°C",
      status: "normal",
    },
    fan: {
      status: "running",
      rpm: 1800,
      rpmStatus: "stable",
    },
    cable: {
      status: "connected",
    },
    door: {
      status: "closed",
    },
    overallStatus: "normal",
    lastUpdated: "10:31:24",
  },
  sensorRows: [
    { id: 1, sensor: "Suhu Rak 1", value: "36.8°C", status: "normal", updatedAt: "10:31:24" },
    { id: 2, sensor: "Fan Exhaust A", value: "1800 RPM", status: "stable", updatedAt: "10:31:23" },
    { id: 3, sensor: "Power Cable Main", value: "Connect", status: "normal", updatedAt: "10:30:15" },
    { id: 4, sensor: "Main Door", value: "Tertutup", status: "safe", updatedAt: "10:25:00" },
  ],
  temperatureHistory: [
    { label: "10:00", value: 37.2 },
    { label: "10:05", value: 38.1 },
    { label: "10:10", value: 38.4 },
    { label: "10:15", value: 37.6 },
    { label: "10:20", value: 36.2 },
    { label: "10:25", value: 35.4 },
    { label: "10:30", value: 36.1 },
    { label: "10:35", value: 38.8 },
    { label: "10:40", value: 42.6 },
    { label: "10:45", value: 45.0 },
    { label: "10:50", value: 39.0 },
  ],
  rpmHistory: [
    { label: "10:00", value: 1450 },
    { label: "10:05", value: 1720 },
    { label: "10:10", value: 1980 },
    { label: "10:15", value: 1320 },
    { label: "10:20", value: 1800 },
    { label: "10:25", value: 2050 },
    { label: "10:30", value: 1420 },
    { label: "10:35", value: 1900 },
    { label: "10:40", value: 1600 },
  ],
  alerts: [
    {
      id: 1,
      type: "cable",
      title: "Kabel Putus",
      message: "Sensor Power Cable Main tidak merespons. Segera periksa koneksi fisik.",
      severity: "critical",
      createdAt: "10:30:15",
    },
    {
      id: 2,
      type: "door",
      title: "Pintu Terbuka",
      message: "Pintu utama terdeteksi terbuka lebih dari 5 menit.",
      severity: "warning",
      createdAt: "10:15:00",
    },
    {
      id: 3,
      type: "fan",
      title: "Fan Restarted",
      message: "Sistem berhasil merestart Fan Exhaust A secara otomatis.",
      severity: "info",
      createdAt: "09:45:00",
    },
  ],
  toasts: [],
  loading: false,
});

export const useDashboardStore = () => {
  const latestUpdate = computed(() => state.sensorSummary.lastUpdated || formatTime());

  const applySensorPayload = (payload = {}) => {
    state.sensorSummary = {
      ...state.sensorSummary,
      ...payload,
      lastUpdated: payload.lastUpdated || formatTime(),
    };
  };

  const addAlert = (alert) => {
    const nextAlert = {
      id: alert.id || Date.now(),
      type: alert.type || "info",
      title: alert.title || "Alert Baru",
      message: alert.message || "Alert baru diterima dari sistem.",
      severity: alert.severity || "info",
      createdAt: alert.createdAt || formatTime(),
    };

    state.alerts = [nextAlert, ...state.alerts].slice(0, 6);
    state.toasts = [nextAlert, ...state.toasts].slice(0, 3);

    window.setTimeout(() => {
      state.toasts = state.toasts.filter((item) => item.id !== nextAlert.id);
    }, 4200);
  };

  const loadDashboard = async () => {
    state.loading = true;

    try {
      const [latest, alerts] = await Promise.allSettled([
        dashboardService.getLatestSensorData(),
        dashboardService.getLatestAlerts(),
      ]);

      if (latest.status === "fulfilled" && latest.value?.data) {
        applySensorPayload(latest.value.data);
      }

      if (alerts.status === "fulfilled" && Array.isArray(alerts.value?.data)) {
        state.alerts = alerts.value.data;
      }
    } finally {
      state.loading = false;
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
