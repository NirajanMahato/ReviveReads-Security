const express = require("express");
const { authenticateToken } = require("../middleware/userAuth");
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getUnreadMessageCount,
} = require("../controller/messageController");

// Put specific routes before parameter routes
router.get("/unread", authenticateToken, getUnreadMessageCount);

// Then put your parameter routes
router.get("/:id", authenticateToken, getMessages);
router.post("/send/:id", authenticateToken, sendMessage);

module.exports = router;
