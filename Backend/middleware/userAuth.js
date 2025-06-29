const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // Read token from httpOnly cookie instead of Authorization header
  const token = req.cookies.token;
  const userId = req.cookies.userId;

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Token expired. Please sign-in again" });
    }
    req.user = user;
    req.userId = userId; // Add userId to request object
    next();
  });
};

module.exports = { authenticateToken };
