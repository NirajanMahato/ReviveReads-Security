const express = require("express");
const router = express.Router();
const {
  getActivityLogs,
  getUserActivityLogs,
  getActivityStats,
  getSecurityEvents,
  exportActivityLogs,
  cleanOldLogs,
} = require("../controller/activityLogController");
const { verifyAdmin } = require("../middleware/authMiddleware");

// All routes require admin privileges
router.use(verifyAdmin);

// Get all activity logs with filtering and pagination
router.get("/", getActivityLogs);
router.get("/user/:userId", getUserActivityLogs);
router.get("/stats", getActivityStats);
router.get("/security-events", getSecurityEvents);
router.get("/export", exportActivityLogs);
router.delete("/clean", cleanOldLogs);

module.exports = router;
