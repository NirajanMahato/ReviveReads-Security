const ActivityLog = require("../models/ActivityLog");
const { logger } = require("./security");

// Activity logging middleware
const logActivity = (action, resourceType, options = {}) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
      res.send = originalSend;

      logUserActivity(req, res, action, resourceType, {
        ...options,
        responseData: data,
      });

      return originalSend.call(this, data);
    };

    next();
  };
};

// Main function to log user activity
const logUserActivity = async (
  req,
  res,
  action,
  resourceType,
  options = {}
) => {
  try {
    const {
      resourceId,
      details = {},
      status = "success",
      severity = "low",
      metadata = {},
      responseData,
    } = options;

    const user = req.user || {};
    const userId = user.id || null;
    const userEmail = user.email || req.body?.email || "anonymous";
    const userRole = user.role || "anonymous";

    const xForwardedFor = req.headers["x-forwarded-for"];
    const ipAddress =
      (typeof xForwardedFor === "string" && xForwardedFor.split(",")[0].trim()) ||
      req.ip ||
      req.connection.remoteAddress;
    const userAgent = req.get("User-Agent") || "Unknown";
    const deviceFingerprint = req.deviceFingerprint || null;

    let finalStatus = status;
    if (responseData && typeof responseData === "string") {
      try {
        const parsed = JSON.parse(responseData);
        if (parsed.message && parsed.message.includes("error")) {
          finalStatus = "failed";
        }
      } catch (e) {
        if (res.statusCode >= 400) {
          finalStatus = "failed";
        }
      }
    } else if (res.statusCode >= 400) {
      finalStatus = "failed";
    }

    const activityLog = new ActivityLog({
      userId,
      userEmail,
      userRole,
      action,
      resourceType,
      resourceId,
      details: {
        ...details,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseSize: responseData ? JSON.stringify(responseData).length : 0,
        ...options.details,
      },
      ipAddress,
      userAgent,
      deviceFingerprint,
      status: finalStatus,
      severity,
      metadata: {
        ...metadata,
        timestamp: new Date(),
        sessionId: req.session?.id,
        requestId: req.headers["x-request-id"],
        ...options.metadata,
      },
    });

    await activityLog.save();

    const logMessage = `[ACTIVITY] ${action} - User: ${userEmail} (${userRole}) - IP: ${ipAddress} - Status: ${finalStatus}`;

    if (
      finalStatus === "failed" ||
      severity === "high" ||
      severity === "critical"
    ) {
      logger.error(logMessage, { activityLog: activityLog._id });
    } else if (severity === "medium") {
      logger.warn(logMessage, { activityLog: activityLog._id });
    } else {
      logger.info(logMessage, { activityLog: activityLog._id });
    }
  } catch (error) {
    logger.error("Error logging activity:", error);
  }
};

// Security event logging
const logSecurityEvent = async (req, eventType, details = {}) => {
  try {
    const user = req.user || {};
    const userId = user.id || null;
    const userEmail = user.email || req.body?.email || "anonymous";
    const userRole = user.role || "anonymous";
    const xForwardedFor = req.headers["x-forwarded-for"];
    const ipAddress =
      (typeof xForwardedFor === "string" && xForwardedFor.split(",")[0].trim()) ||
      req.ip ||
      req.connection.remoteAddress;
    const userAgent = req.get("User-Agent") || "Unknown";

    const activityLog = new ActivityLog({
      userId,
      userEmail,
      userRole,
      action: eventType,
      resourceType: "system",
      details: {
        ...details,
        method: req.method,
        url: req.originalUrl,
        headers: {
          "user-agent": userAgent,
          referer: req.get("Referer"),
          origin: req.get("Origin"),
        },
      },
      ipAddress,
      userAgent,
      status: "warning",
      severity: "high",
      metadata: {
        eventType,
        timestamp: new Date(),
        ...details.metadata,
      },
    });

    await activityLog.save();
    logger.warn(
      `[SECURITY] ${eventType} - User: ${userEmail} - IP: ${ipAddress}`,
      { activityLog: activityLog._id }
    );
  } catch (error) {
    logger.error("Error logging security event:", error);
  }
};

// Middleware to log all requests
const logAllRequests = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const user = req.user || {};
    const userEmail = user.email || "anonymous";
    const xForwardedFor = req.headers["x-forwarded-for"];
    const ipAddress =
      (typeof xForwardedFor === "string" && xForwardedFor.split(",")[0].trim()) ||
      req.ip ||
      req.connection.remoteAddress;

    logger.info(
      `[REQUEST] ${req.method} ${req.originalUrl} - User: ${userEmail} - IP: ${ipAddress} - Status: ${res.statusCode} - Duration: ${duration}ms`
    );
  });

  next();
};

// Utility functions for specific actions
const activityLogger = {
  logLoginAttempt: (req, res, next) =>
    logActivity("LOGIN_ATTEMPT", "auth")(req, res, next),
  logLoginSuccess: (req, res, next) =>
    logActivity("LOGIN_SUCCESS", "auth")(req, res, next),
  logLoginFailed: (req, res, next) =>
    logActivity("LOGIN_FAILED", "auth", {
      status: "failed",
      severity: "medium",
    })(req, res, next),
  logLogout: (req, res, next) => logActivity("LOGOUT", "auth")(req, res, next),
  logRegister: (req, res, next) =>
    logActivity("REGISTER", "auth")(req, res, next),
  logOtpSent: (req, res, next) =>
    logActivity("OTP_SENT", "auth")(req, res, next),
  logOtpVerified: (req, res, next) =>
    logActivity("OTP_VERIFIED", "auth")(req, res, next),
  logOtpFailed: (req, res, next) =>
    logActivity("OTP_FAILED", "auth", { status: "failed", severity: "medium" })(
      req,
      res,
      next
    ),

  logProfileUpdate: (req, res, next) =>
    logActivity("PROFILE_UPDATE", "user")(req, res, next),
  logAvatarUpload: (req, res, next) =>
    logActivity("AVATAR_UPLOAD", "user")(req, res, next),
  logProfileView: (req, res, next) =>
    logActivity("PROFILE_VIEW", "user")(req, res, next),

  logBookCreate: (req, res, next) =>
    logActivity("BOOK_CREATE", "book")(req, res, next),
  logBookUpdate: (req, res, next) =>
    logActivity("BOOK_UPDATE", "book")(req, res, next),
  logBookDelete: (req, res, next) =>
    logActivity("BOOK_DELETE", "book", { severity: "medium" })(req, res, next),
  logBookView: (req, res, next) =>
    logActivity("BOOK_VIEW", "book")(req, res, next),
  logBookApprove: (req, res, next) =>
    logActivity("BOOK_APPROVE", "book")(req, res, next),
  logBookReject: (req, res, next) =>
    logActivity("BOOK_REJECT", "book")(req, res, next),
  logBookMarkSold: (req, res, next) =>
    logActivity("BOOK_MARK_SOLD", "book")(req, res, next),
  logBookFavoriteAdd: (req, res, next) =>
    logActivity("BOOK_FAVORITE_ADD", "book")(req, res, next),
  logBookFavoriteRemove: (req, res, next) =>
    logActivity("BOOK_FAVORITE_REMOVE", "book")(req, res, next),

  logMessageSend: (req, res, next) =>
    logActivity("MESSAGE_SEND", "message")(req, res, next),
  logMessageRead: (req, res, next) =>
    logActivity("MESSAGE_READ", "message")(req, res, next),
  logConversationCreate: (req, res, next) =>
    logActivity("CONVERSATION_CREATE", "message")(req, res, next),
  logConversationView: (req, res, next) =>
    logActivity("CONVERSATION_VIEW", "message")(req, res, next),

  logUserDelete: (req, res, next) =>
    logActivity("USER_DELETE", "user", { severity: "high" })(req, res, next),
  logUserStatusUpdate: (req, res, next) =>
    logActivity("USER_STATUS_UPDATE", "user")(req, res, next),

  logFileUploadAttempt: (req, res, next) =>
    logActivity("FILE_UPLOAD_ATTEMPT", "system")(req, res, next),
  logFileUploadSuccess: (req, res, next) =>
    logActivity("FILE_UPLOAD_SUCCESS", "system")(req, res, next),
  logFileUploadFailed: (req, res, next) =>
    logActivity("FILE_UPLOAD_FAILED", "system", {
      status: "failed",
      severity: "medium",
    })(req, res, next),

  logActivity,
  logUserActivity,
  logSecurityEvent,
  logAllRequests,
};

module.exports = activityLogger;
