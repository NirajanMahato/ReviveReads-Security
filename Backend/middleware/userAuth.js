const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  const token = req.cookies.token;
  const userId = req.cookies.userId;

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Token expired. Please sign-in again" });
    }
    if (userId) {
      const dbUser = await User.findById(userId);
      if (!dbUser || user.sessionVersion !== (dbUser.sessionVersion || 0)) {
        return res
          .status(401)
          .json({ message: "Session invalidated. Please log in again." });
      }
    }
    req.user = user;
    req.userId = userId;
    next();
  });
};

module.exports = { authenticateToken };
