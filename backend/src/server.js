import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { env } from "./config/env.js";
import { setupSocket } from "./sockets/index.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.clientUrl,
    credentials: true,
  },
});

setupSocket(io);

server.listen(env.port, () => {
  console.log(`BTSense API running on port ${env.port}`);
});
