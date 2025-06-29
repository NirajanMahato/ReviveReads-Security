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

// Get activity logs for a specific user
router.get("/user/:userId", getUserActivityLogs);

// Get activity statistics
router.get("/stats", getActivityStats);

// Get recent security events
router.get("/security-events", getSecurityEvents);

// Export activity logs
router.get("/export", exportActivityLogs);

// Clean old activity logs
router.delete("/clean", cleanOldLogs);

module.exports = router;
