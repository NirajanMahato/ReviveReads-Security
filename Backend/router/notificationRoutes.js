const express = require("express");
const {
  getNotifications,
  markAsRead,
} = require("../controller/notificationController");
const { authenticateToken } = require("../middleware/userAuth");
const router = express.Router();

router.get("/", authenticateToken, getNotifications);
router.put("/mark-read", authenticateToken, markAsRead);

module.exports = router;
