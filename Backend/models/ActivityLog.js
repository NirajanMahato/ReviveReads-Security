const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userEmail: {
      type: String,
    },
    userRole: {
      type: String,
      enum: ["user", "admin", "anonymous"],
    },
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN_ATTEMPT",
        "LOGIN_SUCCESS",
        "LOGIN_FAILED",
        "LOGOUT",
        "REGISTER",
        "PASSWORD_RESET_REQUEST",
        "PASSWORD_RESET_SUCCESS",
        "PASSWORD_CHANGE",
        "OTP_SENT",
        "OTP_VERIFIED",
        "OTP_FAILED",

        "PROFILE_UPDATE",
        "AVATAR_UPLOAD",
        "PROFILE_VIEW",

        "BOOK_CREATE",
        "BOOK_UPDATE",
        "BOOK_DELETE",
        "BOOK_VIEW",
        "BOOK_APPROVE",
        "BOOK_REJECT",
        "BOOK_MARK_SOLD",
        "BOOK_FAVORITE_ADD",
        "BOOK_FAVORITE_REMOVE",

        "MESSAGE_SEND",
        "MESSAGE_READ",
        "CONVERSATION_CREATE",
        "CONVERSATION_VIEW",

        "NOTIFICATION_READ",
        "NOTIFICATION_DELETE",

        "USER_DELETE",
        "USER_STATUS_UPDATE",
        "SYSTEM_SETTINGS_UPDATE",

        "SUSPICIOUS_ACTIVITY",
        "RATE_LIMIT_EXCEEDED",
        "INVALID_TOKEN",
        "UNAUTHORIZED_ACCESS",
        "FILE_UPLOAD_ATTEMPT",
        "FILE_UPLOAD_SUCCESS",
        "FILE_UPLOAD_FAILED",

        "SESSION_EXPIRED",
        "ACCOUNT_LOCKED",
        "ACCOUNT_UNLOCKED",
      ],
    },
    resourceType: {
      type: String,
      enum: ["user", "book", "message", "notification", "system", "auth"],
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    deviceFingerprint: {
      type: String,
      required: false,
    },
    location: {
      country: String,
      city: String,
      region: String,
    },
    status: {
      type: String,
      enum: ["success", "failed", "warning", "info"],
      default: "success",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    indexes: [
      { userId: 1, createdAt: -1 },
      { action: 1, createdAt: -1 },
      { status: 1, createdAt: -1 },
      { severity: 1, createdAt: -1 },
      { ipAddress: 1, createdAt: -1 },
      { userEmail: 1, createdAt: -1 },
    ],
  }
);

activityLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
