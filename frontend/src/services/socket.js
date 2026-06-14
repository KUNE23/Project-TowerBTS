import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
  autoConnect: false,
  transports: ["websocket", "polling"],
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const onSensorNew = (handler) => {
  socket.on("sensor:new", handler);
  return () => socket.off("sensor:new", handler);
};

export const onAlertNew = (handler) => {
  socket.on("alert:new", handler);
  return () => socket.off("alert:new", handler);
};

export const onDeviceStatus = (handler) => {
  socket.on("device:status", handler);
  return () => socket.off("device:status", handler);
};

export default socket;
