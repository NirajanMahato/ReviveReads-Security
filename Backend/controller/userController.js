const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Conversation = require("../models/Conversation");
const mongoose = require("mongoose");
const {
  logUserActivity,
  logSecurityEvent,
} = require("../middleware/activityLogger");
const AuditLog = require("../models/AuditLog");

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
    await logAuditEvent(req, req.userId, "LOGOUT", "auth", {});
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

    if (password.length <= 5) {
      return res
        .status(400)
        .json({ message: "Password length should be greater than 5" });
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

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: "nirajanmahato44@gmail.com",
      to: email,
      subject: "Welcome to ReviveReads",
      html: `
        <h1>Your Registration has been completed</h1>
        <p>Your user id is ${newUser.id}</p>
        `,
    });

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

// Sign-In (2FA enabled)
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Check for account lockout
    if (existingUser.lockoutUntil && existingUser.lockoutUntil > Date.now()) {
      const minutes = Math.ceil(
        (existingUser.lockoutUntil - Date.now()) / 60000
      );
      // Send lockout email notification
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: existingUser.email,
          subject: "Account Locked - ReviveReads",
          html: `<h2>Your account has been locked due to multiple failed login attempts.</h2><p>Please try again after 15 minutes. If this wasn't you, please contact support immediately.</p>`,
        });
      } catch (err) {
        /* ignore email errors */
      }
      return res.status(403).json({
        message: `Account locked due to multiple failed login attempts. Try again in 15 minutes.`,
      });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (isMatch) {
      // Reset failed login attempts and lockout
      existingUser.failedLoginAttempts = 0;
      existingUser.lockoutUntil = undefined;
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
      existingUser.twoFactorOTP = otp;
      existingUser.twoFactorOTPExpires = otpExpiry;
      await existingUser.save();

      // Send OTP via email
      const transporter = nodemailer.createTransporter({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your ReviveReads OTP Code",
        html: `<h2>Your OTP code is: <b>${otp}</b></h2><p>This code will expire in 5 minutes.</p>`,
      });

      await logAuditEvent(req, existingUser._id, "LOGIN_SUCCESS", "auth", {});

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
      // Increment failed login attempts
      existingUser.failedLoginAttempts =
        (existingUser.failedLoginAttempts || 0) + 1;
      // Lock account after 5 failed attempts for 15 minutes
      if (existingUser.failedLoginAttempts >= 5) {
        existingUser.lockoutUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
      }
      await existingUser.save();
      if (existingUser.lockoutUntil && existingUser.lockoutUntil > Date.now()) {
        return res.status(403).json({
          message:
            "Account locked due to multiple failed login attempts. Try again in 15 minutes.",
        });
      }
      await logAuditEvent(req, existingUser._id, "LOGIN_FAILED", "auth", {
        email,
      });
      return res.status(400).json({ message: "Invalid Credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error });
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
      console.log(
        `Invalid OTP attempt for user ${email}. Expected: ${user.twoFactorOTP}, Received: ${otp}`
      );

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

    // OTP is valid, clear OTP fields and issue JWT
    user.twoFactorOTP = undefined;
    user.twoFactorOTPExpires = undefined;
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
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
    console.error("VerifyOTP error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
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
    await logAuditEvent(req, id, "PROFILE_UPDATE", "user", updateFields);
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

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h1>You requested a password reset</h1>
        <p>Click this link to reset your password:</p>
        <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending reset email",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

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

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send password change email notification
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Password Changed - ReviveReads",
        html: `<h2>Your password has been changed successfully.</h2><p>If you did not perform this action, please reset your password immediately or contact support.</p>`,
      });
    } catch (err) {
      /* ignore email errors */
    }

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
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
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
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
};
