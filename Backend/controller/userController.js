const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Conversation = require("../models/Conversation");
const mongoose = require("mongoose");
const { logUserActivity } = require("../middleware/activityLogger");
const AuditLog = require("../models/AuditLog");
const { OAuth2Client } = require("google-auth-library");
const {
  sendWelcomeEmail,
  sendOtpEmail,
  sendLockoutEmail,
  sendResetPasswordEmail,
  sendPasswordChangedEmail,
} = require("../utils/mailer");
const { validatePassword } = require("../utils/validators");

//Get all users information
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(404).json({ message: "User not found" }, error);
  }
};

// Get current user info from cookies
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Logout endpoint to clear cookies
const logout = async (req, res) => {
  try {
    await logUserActivity(req, res, "LOGOUT", "auth", {
      resourceId: req.userId,
      details: {},
    });
    res.clearCookie("token");
    res.clearCookie("userId");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Sign-Up
const signUp = async (req, res) => {
  try {
    const { name, email, password, address, avatar } = req.body;

    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists " });
    }

    // Enhanced password validation
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const validationError = validatePassword(password);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }
    const hashedPass = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashedPass,
      address: address || null,
      avatar,
    };

    // If there's an avatar file (from Flutter), add it to userData
    if (req.file) {
      userData.avatar = req.file.filename;
    }

    const newUser = new User(userData);
    const data = await newUser.save();

    await sendWelcomeEmail(email, newUser._id);

    await logUserActivity(req, res, "REGISTER", "auth", {
      resourceId: newUser._id,
      details: { registrationMethod: "email" },
    });

    res.status(201).json({ message: "User saved successfully", data, info });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const uploadImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).send({ message: "Please upload a file" });
  }
  res.status(200).json({
    success: true,
    data: req.file.filename,
  });
});

// Sign-In
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      await logUserActivity(req, res, "LOGIN_FAILED", "auth", {
        status: "failed",
        severity: "medium",
        details: { reason: "Invalid Credentials", email },
      });
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Reset lock if lockout period has expired
    if (existingUser.lockoutUntil && existingUser.lockoutUntil < Date.now()) {
      existingUser.failedLoginAttempts = 0;
      existingUser.lockoutUntil = undefined;
      existingUser.lockoutNotified = false;
      await existingUser.save();
    }

    // Check if account is currently locked
    if (existingUser.lockoutUntil && existingUser.lockoutUntil > Date.now()) {
      if (!existingUser.lockoutNotified) {
        await sendLockoutEmail(existingUser.email);

        existingUser.lockoutNotified = true;
        await existingUser.save();
      }

      return res.status(403).json({
        message:
          "Account locked due to multiple failed login attempts. Try again in 15 minutes.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (isMatch) {
      existingUser.failedLoginAttempts = 0;
      existingUser.lockoutUntil = undefined;
      existingUser.lockoutNotified = false;

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = Date.now() + 5 * 60 * 1000;
      existingUser.twoFactorOTP = otp;
      existingUser.twoFactorOTPExpires = otpExpiry;
      await existingUser.save();

      await sendOtpEmail(email, otp);

      await logUserActivity(req, res, "LOGIN_SUCCESS", "auth", {
        resourceId: existingUser._id,
        details: { loginMethod: "2FA" },
      });

      return res.status(200).json({
        message: "OTP sent to your email. Please verify to continue.",
        user: {
          id: existingUser._id,
          role: existingUser.role,
          email: existingUser.email,
        },
        twoFactorRequired: true,
      });
    } else {
      existingUser.failedLoginAttempts =
        (existingUser.failedLoginAttempts || 0) + 1;

      if (existingUser.failedLoginAttempts >= 5) {
        existingUser.lockoutUntil = Date.now() + 15 * 60 * 1000;
        existingUser.lockoutNotified = false;

        await logUserActivity(req, res, "ACCOUNT_LOCKED", "auth", {
          resourceId: existingUser._id,
          severity: "high",
          details: {
            reason: "Exceeded max failed login attempts",
            email,
          },
        });
      }

      await existingUser.save();

      return res.status(400).json({ message: "Invalid Credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 2FA OTP Verification
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.twoFactorOTP || !user.twoFactorOTPExpires) {
      await logUserActivity(req, res, "OTP_FAILED", "auth", {
        status: "failed",
        severity: "medium",
        details: { reason: "OTP not found", email },
      });
      return res
        .status(400)
        .json({ message: "OTP not found. Please login again." });
    }

    if (user.twoFactorOTP !== otp) {
      // console.log(
      //   `Invalid OTP attempt for user ${email}. Expected: ${user.twoFactorOTP}, Received: ${otp}`
      // );

      await logUserActivity(req, res, "OTP_FAILED", "auth", {
        status: "failed",
        severity: "medium",
        details: { reason: "Invalid OTP", email },
      });

      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (user.twoFactorOTPExpires < Date.now()) {
      user.twoFactorOTP = undefined;
      user.twoFactorOTPExpires = undefined;
      await user.save();

      await logUserActivity(req, res, "OTP_FAILED", "auth", {
        status: "failed",
        severity: "medium",
        details: { reason: "OTP expired", email },
      });

      return res
        .status(400)
        .json({ message: "OTP expired. Please login again." });
    }

    user.twoFactorOTP = undefined;
    user.twoFactorOTPExpires = undefined;
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        sessionVersion: user.sessionVersion || 0,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

    res.cookie("userId", user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

    await logUserActivity(req, res, "LOGIN_SUCCESS", "auth", {
      resourceId: user._id,
      details: { loginMethod: "2FA" },
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get user's information
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    const data = await User.findById(id).select("-password");
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateData = async (req, res) => {
  try {
    const { id } = req.headers;
    const { name, phone, address } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;
    if (req.file) updateFields.avatar = req.file.filename;

    const data = await User.findByIdAndUpdate(id, updateFields, { new: true }); // { new: true }: Returns the updated document.
    await logUserActivity(req, res, "PROFILE_UPDATE", "user", {
      resourceId: id,
      details: updateFields,
    });
    res.status(200).json({ message: "User updated successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    const data = await User.findByIdAndDelete(id);
    if (data == null) {
      res.status(404).json({ message: "User not found" });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Forget and reset password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist" });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Create reset link first
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Use the reusable mail function
    await sendResetPasswordEmail(email, resetUrl);
    await logUserActivity(req, res, "PASSWORD_RESET_REQUEST", "auth", {
      details: { email: req.body.email },
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending reset email",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Enhanced password validation for reset
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    // Enhanced password validation for reset
    const validationError = validatePassword(newPassword);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    try {
      await sendPasswordChangedEmail(user.email);
    } catch (err) {}

    await logUserActivity(req, res, "PASSWORD_RESET_SUCCESS", "auth", {
      details: { email: req.body.email },
    });

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error resetting password",
    });
  }
};

const addBookToFavorites = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.favorites.includes(bookId)) {
      user.favorites.push(bookId);
      await user.save();
      return res.status(200).json({ message: "Book added to favorites", user });
    } else {
      return res.status(400).json({ message: "Book already in favorites" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const removeBookFromFavorites = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (user.favorites.includes(bookId)) {
      user.favorites = user.favorites.filter((id) => id.toString() !== bookId); // Remove book
      await user.save();
      return res
        .status(200)
        .json({ message: "Book removed from favorites", user });
    } else {
      return res.status(400).json({ message: "Book not found in favorites" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const getFavouriteBook = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    const conversations = await Conversation.find({
      participants: loggedInUserId,
    }).populate("participants", "-password");

    const users = [];
    conversations.forEach((conversation) => {
      conversation.participants.forEach((participant) => {
        if (
          participant._id.toString() !== loggedInUserId &&
          !users.some(
            (user) => user._id.toString() === participant._id.toString()
          )
        ) {
          users.push(participant);
        }
      });
    });

    res.status(200).json(users); // Send filtered users
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// PATCH: Update User Status
const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status, lastActivity } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { status, lastActivity },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Helper to log audit events
const logAuditEvent = async (req, userId, action, resource, details = {}) => {
  try {
    await AuditLog.create({
      userId,
      action,
      resource,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      details,
    });
  } catch (err) {
    // Do not block main flow on logging error
  }
};

// Add logoutAll endpoint
const logoutAll = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    await User.findByIdAndUpdate(userId, { $inc: { sessionVersion: 1 } });
    res.clearCookie("token");
    res.clearCookie("userId");
    res.status(200).json({ message: "Logged out from all devices" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const avatar = payload.picture;
    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name,
        avatar,
        password: Math.random().toString(36).slice(-8), // random password
        isGoogleUser: true,
        role: "user",
      });
    }
    // Issue JWT and set cookies
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        sessionVersion: user.sessionVersion || 0,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("userId", user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res
      .status(401)
      .json({ message: "Google login failed", error: err.message });
  }
};

module.exports = {
  getAllUsers,
  signUp,
  uploadImage,
  signIn,
  verifyOTP,
  getUserById,
  deleteById,
  updateData,
  forgotPassword,
  resetPassword,
  addBookToFavorites,
  removeBookFromFavorites,
  getFavouriteBook,
  getUsersForSidebar,
  updateUserStatus,
  getCurrentUser,
  logout,
  logoutAll,
  googleLogin: exports.googleLogin,
};
