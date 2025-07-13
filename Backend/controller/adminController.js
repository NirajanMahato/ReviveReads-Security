const Book = require("../models/Book");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

const adminSummary = async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newUsersCount = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    const newBooksCount = await Book.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    const totalBooksCount = await Book.countDocuments();

    const booksPending = await Book.countDocuments({ status: "Pending" });

    res.status(200).json({
      newUsersCount,
      newBooksCount,
      totalBooksCount,
      booksPending,
    });
  } catch (error) {
    console.error("Error fetching summary data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getSecurityMetrics = async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Recent security events
    const recentSecurityEvents = await ActivityLog.countDocuments({
      severity: { $in: ["high", "critical"] },
      createdAt: { $gte: oneHourAgo },
    });

    // Failed login attempts in last hour
    const failedLogins = await ActivityLog.countDocuments({
      action: "LOGIN_FAILED",
      createdAt: { $gte: oneHourAgo },
    });

    // Suspicious activities in last hour
    const suspiciousActivities = await ActivityLog.countDocuments({
      action: "SUSPICIOUS_ACTIVITY",
      createdAt: { $gte: oneHourAgo },
    });

    // Rate limit violations in last hour
    const rateLimitViolations = await ActivityLog.countDocuments({
      action: "RATE_LIMIT_EXCEEDED",
      createdAt: { $gte: oneHourAgo },
    });

    // System health metrics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "Active" });
    const lockedAccounts = await User.countDocuments({ isLocked: true });

    // Top IP addresses with suspicious activity
    const topSuspiciousIPs = await ActivityLog.aggregate([
      {
        $match: {
          severity: { $in: ["high", "critical"] },
          createdAt: { $gte: oneDayAgo },
        },
      },
      {
        $group: {
          _id: "$ipAddress",
          count: { $sum: 1 },
          actions: { $addToSet: "$action" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Security event trends
    const securityEventTrends = await ActivityLog.aggregate([
      {
        $match: {
          severity: { $in: ["high", "critical"] },
          createdAt: { $gte: oneWeekAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      recentSecurityEvents,
      failedLogins,
      suspiciousActivities,
      rateLimitViolations,
      totalUsers,
      activeUsers,
      lockedAccounts,
      topSuspiciousIPs,
      securityEventTrends,
      lastUpdated: now,
    });
  } catch (error) {
    console.error("Error fetching security metrics:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserActivityStats = async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const userActivityStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(userActivityStats);
  } catch (error) {
    console.error("Error fetching user activity stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getBookListingsStats = async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const bookListingsStats = await Book.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(bookListingsStats);
  } catch (error) {
    console.error("Error fetching book listings stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  adminSummary,
  getSecurityMetrics,
  getUserActivityStats,
  getBookListingsStats,
  getAllUsers,
};
