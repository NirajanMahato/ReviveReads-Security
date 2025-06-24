require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const { app, server } = require("./socket/socket");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./router/userRoutes");
const bookRoutes = require("./router/bookRoutes");
const messageRoutes = require("./router/messageRoutes");
const notificationRoutes = require("./router/notificationRoutes");
const adminRoutes = require("./router/adminRoutes");

connectDB();
const PORT = process.env.PORT ? process.env.PORT : 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:4004",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(helmet());
app.use(xss());
app.use(express.json({ limit: "10mb" }));

app.use("/api/user", userRoutes);
app.use("/api/book", bookRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/product_images", express.static("product_images"));

// server.js
app.use("/api/uploads/users", express.static("uploads/users"));
app.use("/api/uploads/books", express.static("uploads/books"));

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
