export const formatTime = (value = new Date()) => {
  if (typeof value === "string") {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(value);
};

export const formatSensorValue = (value, unit = "") => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return `${value}${unit ? ` ${unit}` : ""}`;
};

export const compactNumber = (value) => {
  if (!Number.isFinite(Number(value))) {
    return value;
  }

  return new Intl.NumberFormat("id-ID").format(value);
};
