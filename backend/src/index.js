import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js"; // Adjust the path as necessary
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js"; // Adjust the path as necessary
import cors from "cors";
import cookieParser from "cookie-parser";
import { app, server } from "./lib/socket.js";
import path from "path";

connectDB();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Adjust this to your frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
dotenv.config();

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
