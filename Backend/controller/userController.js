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

    //Check if email already exists
    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists " });
    }

    //check password's length
    if (password.length <= 5) {
      return res
        .status(400)
        .json({ message: "Password length should be greater than 5" });
    }
    //Hash the password
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

    // Log successful registration
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
      // Log failed login attempt
      await logUserActivity(req, res, "LOGIN_FAILED", "auth", {
        status: "failed",
        severity: "medium",
        details: { reason: "User not found", email },
      });
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (isMatch) {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
      existingUser.twoFactorOTP = otp;
      existingUser.twoFactorOTPExpires = otpExpiry;
      await existingUser.save();

      try {
        // Send OTP via email
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
          to: email,
          subject: "Your ReviveReads OTP Code",
          html: `<h2>Your OTP code is: <b>${otp}</b></h2><p>This code will expire in 5 minutes.</p>`,
        });

        // Log OTP sent
        await logUserActivity(req, res, "OTP_SENT", "auth", {
          resourceId: existingUser._id,
          details: { email },
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
      } catch (emailError) {
        console.error("Email sending error:", emailError);

        // Clear OTP if email fails
        existingUser.twoFactorOTP = undefined;
        existingUser.twoFactorOTPExpires = undefined;
        await existingUser.save();

        return res.status(500).json({
          message:
            "Failed to send OTP email. Please try again or contact support.",
          error: "Email service unavailable",
        });
      }
    } else {
      // Log failed login attempt
      await logUserActivity(req, res, "LOGIN_FAILED", "auth", {
        status: "failed",
        severity: "medium",
        details: { reason: "Invalid password", email },
      });
      return res.status(400).json({ message: "Invalid Credentials" });
    }
  } catch (error) {
    console.error("SignIn error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
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

      // Log failed OTP attempt
      await logUserActivity(req, res, "OTP_FAILED", "auth", {
        status: "failed",
        severity: "medium",
        details: { reason: "Invalid OTP", email },
      });

      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (user.twoFactorOTPExpires < Date.now()) {
      // Clear expired OTP
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

    // Set JWT as httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

    // Set user ID as httpOnly cookie
    res.cookie("userId", user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

    // Log successful login
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

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send email
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

    // Verify token
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

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

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

//
const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id; // Current logged-in user ID

    // Find conversations where the current user is a participant
    const conversations = await Conversation.find({
      participants: loggedInUserId,
    }).populate("participants", "-password"); // Populate user details excluding password

    // Extract unique users from the conversations
    const users = [];
    conversations.forEach((conversation) => {
      conversation.participants.forEach((participant) => {
        // Add only other participants (exclude the logged-in user)
        if (
          participant._id.toString() !== loggedInUserId && // Exclude self
          !users.some(
            (user) => user._id.toString() === participant._id.toString()
          ) // Avoid duplicates
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
