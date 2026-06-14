import xss from "xss";

const sanitizeValue = (value, key = "") => {
  if (typeof value === "string") {
    if (key.toLowerCase().includes("password")) {
      return value;
    }

    return xss(value.trim(), {
      whiteList: {},
      stripIgnoreTag: true,
      stripIgnoreTagBody: ["script"],
    });
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, key));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([entryKey, entryValue]) => [entryKey, sanitizeValue(entryValue, entryKey)]));
  }

  return value;
};

export const sanitizeInput = (req, res, next) => {
  Object.defineProperty(req, "body", { value: sanitizeValue(req.body), writable: true });
  Object.defineProperty(req, "query", { value: sanitizeValue(req.query), writable: true });
  Object.defineProperty(req, "params", { value: sanitizeValue(req.params), writable: true });
  next();
};

export const sanitizeString = (value) => sanitizeValue(value);
