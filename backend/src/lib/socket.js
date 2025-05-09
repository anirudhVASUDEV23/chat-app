import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
  },
});

const userSocketMap = {}; // { userId (string): socketId }

export function getReceiversSocketId(userId) {
  return userSocketMap[String(userId)]; // Always convert to string
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = String(socket.handshake.query.userId); // Ensure string
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log("Mapped userId to socket:", userId, socket.id);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
