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

export function getReceiversSocketId(userId) {
  return userSocketMap[userId];
}

//used to store online users
const userSocketMap = {}; //userId,socketId

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id; //adding userId and socketId to the map
  }

  //used to send message to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server }; // Export both io and app

/*
 Only socket-based requests made using socket.emit(...) from the client are listened to by socket.on(...) on the server.

fetch(), axios.post(), or form submissions → go to Express routes

socket.emit(...) → go to Socket.IO listeners

| Term     | Scope                        | Used For                                |
| -------- | ---------------------------- | --------------------------------------- |
| `io`     | Entire server                | Broadcasting, managing all sockets      |
| `socket` | Individual client connection | Communicating with one connected client |


 */

/*
             io  (Socket.IO server)
              |
    ------------------------
    |          |           |
 socket1   socket2     socket3
 (User A)  (User B)     (User C)



 io.on("connection", (socket) => {
  // Only this client
  socket.emit("welcome", "Hello!");

  // All clients
  io.emit("user_joined", `${socket.id} joined`);
});

 */
