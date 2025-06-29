const express = require("express");
const { authenticateToken } = require("../middleware/userAuth");
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getUnreadMessageCount,
} = require("../controller/messageController");

router.get("/unread", authenticateToken, getUnreadMessageCount);

router.get("/:id", authenticateToken, getMessages);
router.post("/send/:id", authenticateToken, sendMessage);

module.exports = router;
