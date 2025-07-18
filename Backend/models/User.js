const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String },
    password: { type: String, required: true },
    address: { type: String },
    avatar: { type: String, default: "default_avatar.png" },
    role: { type: String, default: "user", enum: ["user", "admin"] },
    book_listings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    purchases: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    notifications: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["Active", "Away", "Offline"],
      default: "Away",
    },
    lastActivity: { type: Date, default: Date.now },
    lockoutNotified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    twoFactorOTP: String,
    twoFactorOTPExpires: Date,
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date },
    sessionVersion: { type: Number, default: 0 },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
