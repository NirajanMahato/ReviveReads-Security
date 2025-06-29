const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:4000"],
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {}; // {userId: socketId}

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const emitNotification = (userId, notification) => {
  const socketId = userSocketMap[userId];
  if (socketId) {
    io.to(socketId).emit("newNotification", notification);
  }
};

io.on("connection", (socket) => {
  // console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId != "undefined") {
    userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  socket.on("disconnect", () => {
    if (userId != "undefined") {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });

  socket.on("subscribeToNotifications", (userId) => {
    socket.join(`notifications:${userId}`);
  });

  socket.on("notificationRead", (notificationId) => {
    console.log("Notification read:", notificationId);
  });
});

module.exports = { app, server, io, getReceiverSocketId, emitNotification };
