require("dotenv").config();
const express = require("express");
const { app, server } = require("./socket/socket");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./router/userRoutes");
const bookRoutes = require("./router/bookRoutes");
const messageRoutes = require("./router/messageRoutes");
const notificationRoutes = require("./router/notificationRoutes");
const adminRoutes = require("./router/adminRoutes");
const activityLogRoutes = require("./router/activityLogRoutes");
const { applySecurityMiddlewares } = require("./middleware/security");
const cookieParser = require("cookie-parser");

connectDB();
const PORT = process.env.PORT ? process.env.PORT : 5000;

const requiredEnvVars = [
  "JWT_SECRET",
  "MONGO_DB_URI",
  "EMAIL_USER",
  "EMAIL_PASS",
  "FRONTEND_URL",
];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:4000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());

applySecurityMiddlewares(app);

app.use("/api/user", userRoutes);
app.use("/api/book", bookRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/activity-logs", activityLogRoutes);

app.use("/api/product_images", express.static("product_images"));
app.use("/api/uploads/users", express.static("uploads/users"));
app.use("/api/uploads/books", express.static("uploads/books"));

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
