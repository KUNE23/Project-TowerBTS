-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('technician', 'supervisor');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('online', 'offline');

-- CreateEnum
CREATE TYPE "SensorStatus" AS ENUM ('normal', 'warning', 'critical');

-- CreateEnum
CREATE TYPE "FanStatus" AS ENUM ('running', 'stopped');

-- CreateEnum
CREATE TYPE "CableStatus" AS ENUM ('connected', 'cut');

-- CreateEnum
CREATE TYPE "DoorStatus" AS ENUM ('closed', 'open');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('temperature', 'fan', 'cable', 'door');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('info', 'warning', 'critical');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('unresolved', 'resolved');

-- CreateEnum
CREATE TYPE "FileFormat" AS ENUM ('pdf');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'technician',
    "phone" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" SERIAL NOT NULL,
    "device_code" VARCHAR(50) NOT NULL,
    "device_name" VARCHAR(100) NOT NULL,
    "status" "DeviceStatus" NOT NULL DEFAULT 'offline',
    "last_seen" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_logs" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "temperature" DOUBLE PRECISION,
    "temperature_status" "SensorStatus" NOT NULL DEFAULT 'normal',
    "fan_status" "FanStatus" NOT NULL DEFAULT 'stopped',
    "fan_rpm" INTEGER NOT NULL DEFAULT 0,
    "cable_status" "CableStatus" NOT NULL DEFAULT 'connected',
    "door_status" "DoorStatus" NOT NULL DEFAULT 'closed',
    "overall_status" "SensorStatus" NOT NULL DEFAULT 'normal',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensor_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "sensor_log_id" INTEGER NOT NULL,
    "alert_type" "AlertType" NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'unresolved',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_reports" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "device_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "file_format" "FileFormat" NOT NULL DEFAULT 'pdf',
    "file_url" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "export_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "devices_device_code_key" ON "devices"("device_code");

-- AddForeignKey
ALTER TABLE "sensor_logs" ADD CONSTRAINT "sensor_logs_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_sensor_log_id_fkey" FOREIGN KEY ("sensor_log_id") REFERENCES "sensor_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_reports" ADD CONSTRAINT "export_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_reports" ADD CONSTRAINT "export_reports_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
