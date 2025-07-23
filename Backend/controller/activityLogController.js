const ActivityLog = require("../models/ActivityLog");

const normalizeIp = (rawIp) => {
  if (!rawIp) return "unknown";
  return rawIp === "::1" || rawIp === "::ffff:127.0.0.1" ? "127.0.0.1" : rawIp;
};

const getActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      userId,
      userEmail,
      action,
      resourceType,
      status,
      severity,
      startDate,
      endDate,
      ipAddress,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};

    if (userId) filter.userId = userId;
    if (userEmail) filter.userEmail = { $regex: userEmail, $options: "i" };
    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    if (ipAddress) {
      const cleanIp = normalizeIp(ipAddress);
      filter.ipAddress = { $regex: cleanIp, $options: "i" };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("userId", "name email role")
        .lean(),
      ActivityLog.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalLogs: total,
        logsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserActivityLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, action, status } = req.query;

    const filter = { userId };
    if (action) filter.action = action;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ActivityLog.countDocuments(filter),
    ]);

    res.status(200).json({
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalLogs: total,
      },
    });
  } catch (error) {
    console.error("Error fetching user activity logs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const totalActivities = await ActivityLog.countDocuments(dateFilter);

    const statusStats = await ActivityLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const severityStats = await ActivityLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$severity", count: { $sum: 1 } } },
    ]);

    const topActions = await ActivityLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const topUsers = await ActivityLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$userEmail", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const hourlyStats = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const securityEvents = await ActivityLog.countDocuments({
      ...dateFilter,
      severity: { $in: ["high", "critical"] },
    });

    res.status(200).json({
      totalActivities,
      statusStats,
      severityStats,
      topActions,
      topUsers,
      hourlyStats,
      securityEvents,
    });
  } catch (error) {
    console.error("Error fetching activity stats:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getSecurityEvents = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const securityEvents = await ActivityLog.find({
      severity: { $in: ["high", "critical"] },
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("userId", "name email role")
      .lean();

    res.status(200).json(securityEvents);
  } catch (error) {
    console.error("Error fetching security events:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const exportActivityLogs = async (req, res) => {
  try {
    const { startDate, endDate, format = "json" } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "name email role")
      .lean();

    if (format === "csv") {
      const csvHeaders = [
        "Timestamp",
        "User Email",
        "User Role",
        "Action",
        "Resource Type",
        "Status",
        "Severity",
        "IP Address",
        "User Agent",
      ];

      const csvData = logs.map((log) => [
        log.createdAt,
        log.userEmail,
        log.userRole,
        log.action,
        log.resourceType,
        log.status,
        log.severity,
        normalizeIp(log.ipAddress),
        log.userAgent,
      ]);

      const csvContent = [csvHeaders, ...csvData]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=activity-logs-${Date.now()}.csv`
      );
      res.send(csvContent);
    } else {
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=activity-logs-${Date.now()}.json`
      );
      res.json(logs);
    }
  } catch (error) {
    console.error("Error exporting activity logs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const cleanOldLogs = async (req, res) => {
  try {
    const { days = 365 } = req.query;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await ActivityLog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    res.status(200).json({
      message: `Cleaned ${result.deletedCount} old activity logs`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error cleaning old logs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getActivityLogs,
  getUserActivityLogs,
  getActivityStats,
  getSecurityEvents,
  exportActivityLogs,
  cleanOldLogs,
};
