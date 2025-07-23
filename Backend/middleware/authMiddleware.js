const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyAdmin = async (req, res, next) => {
  try {
    let token;

    if (req.header("Authorization")) {
      token = req.header("Authorization").replace("Bearer ", "");
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }
    if (!token) {
      return res.status(401).json({ message: "No token provided!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied! Admin privileges required." });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized access!" });
  }
};

module.exports = { verifyAdmin };
