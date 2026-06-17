export const severityLabel = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
};

export const statusLabel = {
  normal: "Normal",
  stable: "Stabil",
  running: "Running",
  connected: "Connect",
  closed: "Tertutup",
  safe: "Aman",
  warning: "Warning",
  critical: "Critical",
  open: "Terbuka",
  cut: "Putus",
  stopped: "Stopped",
  offline: "Offline",
};

export const statusTone = {
  normal: "green",
  stable: "green",
  running: "green",
  connected: "green",
  closed: "green",
  safe: "green",
  warning: "yellow",
  open: "yellow",
  critical: "red",
  cut: "red",
  stopped: "red",
  offline: "red",
  online: "green",
  info: "gray",
};

export const getStatusLabel = (status) => statusLabel[status] || status || "-";

export const getSeverityLabel = (severity) => severityLabel[severity] || severity || "Info";

export const getStatusTone = (status) => statusTone[status] || "gray";
