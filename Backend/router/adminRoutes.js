const express = require("express");
const router = express.Router();

const {
  adminSummary,
  getUserActivityStats,
  bookListingsStats,
} = require("../controller/adminController");
const { verifyAdmin } = require("../middleware/authMiddleware");

router.get("/summary", verifyAdmin, adminSummary);
router.get("/user-activity-stats", getUserActivityStats);
router.get("/book-listings-stats", bookListingsStats);

module.exports = router;
