const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  signUp,
  signIn,
  deleteById,
  updateData,
  getUserById,
  addBookToFavorites,
  getFavouriteBook,
  removeBookFromFavorites,
  getUsersForSidebar,
  updateUserStatus,
  forgotPassword,
  resetPassword,
  uploadImage,
  verifyOTP,
  getCurrentUser,
  logout,
} = require("../controller/userController");
const { authenticateToken } = require("../middleware/userAuth");
const { uploadUserAvatar } = require("../config/multerConfig");
const { authLimiter } = require("../middleware/security");

router.post("/uploadImage", uploadUserAvatar, uploadImage);
router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.get("/get-all-users", authenticateToken, getAllUsers);
router.get("/get-user-by-id/:id", getUserById);
router.delete("/:id", deleteById);
router.get("/get-users-for-sidebar", authenticateToken, getUsersForSidebar);
router.patch("/:id/status", updateUserStatus);

router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/add-to-favorites", authenticateToken, addBookToFavorites);
router.delete(
  "/remove-from-favorites/:bookId",
  authenticateToken,
  removeBookFromFavorites
);
router.get("/get-favorites-books", authenticateToken, getFavouriteBook);
router.patch("/", uploadUserAvatar, authenticateToken, updateData);

router.post("/verify-otp", authLimiter, verifyOTP);

router.get("/me", authenticateToken, getCurrentUser);
router.post("/logout", logout);

module.exports = router;
