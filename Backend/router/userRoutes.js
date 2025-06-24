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
} = require("../controller/userController");
const { authenticateToken } = require("../middleware/userAuth");
const { uploadUserAvatar } = require("../config/multerConfig");

router.post("/uploadImage", uploadUserAvatar, uploadImage);
router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.get("/get-all-users", authenticateToken, getAllUsers);
router.get("/get-user-by-id/:id", getUserById);
router.delete("/:id", deleteById);
router.get("/get-users-for-sidebar", authenticateToken, getUsersForSidebar);
router.patch("/:id/status", updateUserStatus);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/add-to-favorites", authenticateToken, addBookToFavorites);
router.delete(
  "/remove-from-favorites/:bookId",
  authenticateToken,
  removeBookFromFavorites
);
router.get("/get-favorites-books", authenticateToken, getFavouriteBook);
router.patch("/", uploadUserAvatar, authenticateToken, updateData);

router.post("/verify-otp", verifyOTP);

module.exports = router;
