const mongoose = require("mongoose");
const xss = require("xss");

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = xss(req.body[key]);
      }
    });
  }

  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === "string") {
        req.query[key] = xss(req.query[key]);
      }
    });
  }

  if (req.params) {
    Object.keys(req.params).forEach((key) => {
      if (typeof req.params[key] === "string") {
        req.params[key] = xss(req.params[key]);
      }
    });
  }

  next();
};

// ObjectId validation middleware
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id =
      req.params[paramName] || req.body[paramName] || req.query[paramName];

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: `Invalid ${paramName} format`,
      });
    }

    next();
  };
};

// Email validation middleware
const validateEmail = (req, res, next) => {
  const email = req.body.email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email && !emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }

  next();
};

// Phone number validation middleware
const validatePhone = (req, res, next) => {
  const phone = req.body.phone;
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

  if (phone && !phoneRegex.test(phone)) {
    return res.status(400).json({
      message: "Invalid phone number format",
    });
  }

  next();
};

// Rate limiting for file uploads
const uploadLimiter = require("express-rate-limit")({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 uploads per windowMs
  message: "Too many file uploads, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  sanitizeInput,
  validateObjectId,
  validateEmail,
  validatePhone,
  uploadLimiter,
};
