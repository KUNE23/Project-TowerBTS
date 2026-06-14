-- CreateIndex
CREATE INDEX "alerts_device_id_status_alert_type_idx" ON "alerts"("device_id", "status", "alert_type");

-- CreateIndex
CREATE INDEX "alerts_severity_created_at_idx" ON "alerts"("severity", "created_at");

-- CreateIndex
CREATE INDEX "devices_status_idx" ON "devices"("status");

-- CreateIndex
CREATE INDEX "export_reports_user_id_created_at_idx" ON "export_reports"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "export_reports_device_id_start_date_end_date_idx" ON "export_reports"("device_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "sensor_logs_device_id_created_at_idx" ON "sensor_logs"("device_id", "created_at");

-- CreateIndex
CREATE INDEX "sensor_logs_overall_status_idx" ON "sensor_logs"("overall_status");
