const express = require("express");
const router = express.Router();

const {
  adminSummary,
  getSecurityMetrics,
  getUserActivityStats,
  getBookListingsStats,
  getAllUsers,
} = require("../controller/adminController");
const { verifyAdmin } = require("../middleware/authMiddleware");

router.get("/summary", verifyAdmin, adminSummary);
router.get("/dashboard-summary", verifyAdmin, adminSummary);
router.get("/security-metrics", verifyAdmin, getSecurityMetrics);
router.get("/user-activity-stats", verifyAdmin, getUserActivityStats);
router.get("/book-listings-stats", verifyAdmin, getBookListingsStats);
router.get("/users", verifyAdmin, getAllUsers);

module.exports = router;
