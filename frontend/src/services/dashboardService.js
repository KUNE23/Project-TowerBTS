import api from "./api.js";

export const getDashboardLatest = async () => {
  const { data } = await api.get("/dashboard/latest");
  return data;
};

export const getSensorLogs = async (params = {}) => {
  const { data } = await api.get("/sensor-logs", { params });
  return data;
};

export const getLatestAlerts = async () => {
  const { data } = await api.get("/alerts/latest");
  return data;
};

export const getLatestSensorData = getDashboardLatest;
export const getSensorHistory = getSensorLogs;

export const exportSensorReport = async (payload) => {
  const response = await api.get("/export-reports/pdf", {
    params: payload,
    responseType: "blob",
  });

  return response;
};
