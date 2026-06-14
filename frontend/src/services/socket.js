import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
  autoConnect: true,
});

socket.on("sensor:new", (payload) => {
  console.log("sensor:new", payload);
});

socket.on("alert:new", (payload) => {
  console.log("alert:new", payload);
});

export default socket;
