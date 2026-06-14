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
};

export const statusTone = {
  normal: "purple",
  stable: "purple",
  running: "purple",
  connected: "purple",
  closed: "purple",
  safe: "purple",
  warning: "yellow",
  critical: "red",
  online: "purple",
  info: "gray",
};

export const getStatusLabel = (status) => statusLabel[status] || status || "-";

export const getSeverityLabel = (severity) => severityLabel[severity] || severity || "Info";

export const getStatusTone = (status) => statusTone[status] || "gray";
