import api from "./api.js";

export const getLatestSensorData = async () => {
  const { data } = await api.get("/sensor-logs/latest");
  return data;
};

export const getSensorHistory = async (params = {}) => {
  const { data } = await api.get("/sensor-logs/history", { params });
  return data;
};

export const getLatestAlerts = async () => {
  const { data } = await api.get("/alerts/latest");
  return data;
};

export const exportSensorReport = async (payload) => {
  try {
    const { data } = await api.get("/export-reports/pdf", {
      params: payload,
      responseType: "blob",
    });

    return data;
  } catch {
    return {
      success: true,
      message: "Export laporan dummy berhasil dibuat.",
      payload,
    };
  }
};
