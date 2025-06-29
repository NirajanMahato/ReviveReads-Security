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

router.use(verifyAdmin);
router.get("/", getActivityLogs);
router.get("/user/:userId", getUserActivityLogs);
router.get("/stats", getActivityStats);
router.get("/security-events", getSecurityEvents);
router.get("/export", exportActivityLogs);
router.delete("/clean", cleanOldLogs);

module.exports = router;
