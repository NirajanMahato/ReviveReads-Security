const express = require("express");
const router = express.Router();

const { adminSummary, getAllUsers } = require("../controller/adminController");
const { verifyAdmin } = require("../middleware/authMiddleware");

router.get("/summary", verifyAdmin, adminSummary);
router.get("/dashboard-summary", verifyAdmin, adminSummary);
router.get("/users", verifyAdmin, getAllUsers);

module.exports = router;
