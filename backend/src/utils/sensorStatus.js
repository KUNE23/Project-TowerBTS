export const getOverallStatus = ({ temperatureStatus, fanStatus, cableStatus, doorStatus }) => {
  if (temperatureStatus === "critical" || fanStatus === "stopped" || cableStatus === "cut") {
    return "critical";
  }

  if (temperatureStatus === "warning" || doorStatus === "open") {
    return "warning";
  }

  return "normal";
};

export const getAlertRules = (log) => [
  {
    type: "temperature",
    active: log.temperatureStatus === "warning" || log.temperatureStatus === "critical",
    severity: log.temperatureStatus === "critical" ? "critical" : "warning",
    message: `Suhu rak berada pada status ${log.temperatureStatus}.`,
    resolved: log.temperatureStatus === "normal",
  },
  {
    type: "fan",
    active: log.fanStatus === "stopped",
    severity: "critical",
    message: "Fan berhenti berjalan. Segera periksa sistem pendingin.",
    resolved: log.fanStatus === "running",
  },
  {
    type: "cable",
    active: log.cableStatus === "cut",
    severity: "critical",
    message: "Kabel utama terdeteksi putus atau tidak tersambung.",
    resolved: log.cableStatus === "connected",
  },
  {
    type: "door",
    active: log.doorStatus === "open",
    severity: "warning",
    message: "Pintu utama terdeteksi terbuka.",
    resolved: log.doorStatus === "closed",
  },
];
