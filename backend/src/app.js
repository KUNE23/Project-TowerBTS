import express from "express";
import morgan from "morgan";
import alertRoutes from "./routes/alert.routes.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import deviceRoutes from "./routes/device.routes.js";
import reportRoutes from "./routes/report.routes.js";
import sensorLogRoutes from "./routes/sensorLog.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { globalRateLimit } from "./middlewares/rateLimit.middleware.js";
import { securityMiddleware } from "./middlewares/security.middleware.js";

const app = express();

morgan.token("safe-url", (req) => req.originalUrl.split("?")[0]);

app.use(securityMiddleware);
app.use(globalRateLimit);
app.use(morgan(":method :safe-url :status :response-time ms"));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "BTSense API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/sensor-logs", sensorLogRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/export-reports", reportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
