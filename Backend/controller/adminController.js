const Book = require("../models/Book");
const User = require("../models/User");

const adminSummary = async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newUsersCount = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    const newBooksCount = await Book.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    const totalBooksCount = await Book.countDocuments();

    const booksPending = await Book.countDocuments({ status: "Pending" });

    res.status(200).json({
      newUsersCount,
      newBooksCount,
      totalBooksCount,
      booksPending,
    });
  } catch (error) {
    console.error("Error fetching summary data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  adminSummary,
  getAllUsers,
};
