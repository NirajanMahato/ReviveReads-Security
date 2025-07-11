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
  logoutAll,
  googleLogin,
} = require("../controller/userController");
const { authenticateToken } = require("../middleware/userAuth");
const { uploadUserAvatar } = require("../config/multerConfig");
const { authLimiter } = require("../middleware/security");
const { verifyCaptcha } = require("../middleware/recaptchaMiddleware");
const {
  sanitizeInput,
  validateEmail,
  validatePhone,
  uploadLimiter,
} = require("../middleware/validation");

router.post("/uploadImage", uploadUserAvatar, uploadImage);
router.post("/sign-up", sanitizeInput, validateEmail, verifyCaptcha, signUp);
router.post("/sign-in", sanitizeInput, validateEmail, authLimiter, signIn);
router.get("/get-all-users", authenticateToken, getAllUsers);
router.get("/get-user-by-id/:id", getUserById);
router.delete("/:id", deleteById);
router.get("/get-users-for-sidebar", authenticateToken, getUsersForSidebar);
router.patch("/:id/status", updateUserStatus);

router.post(
  "/forgot-password",
  sanitizeInput,
  validateEmail,
  authLimiter,
  forgotPassword
);
router.post("/reset-password", sanitizeInput, authLimiter, resetPassword);

router.post("/add-to-favorites", authenticateToken, addBookToFavorites);
router.delete(
  "/remove-from-favorites/:bookId",
  authenticateToken,
  removeBookFromFavorites
);
router.get("/get-favorites-books", authenticateToken, getFavouriteBook);
router.patch(
  "/",
  uploadLimiter,
  uploadUserAvatar,
  authenticateToken,
  updateData
);

router.post(
  "/verify-otp",
  sanitizeInput,
  validateEmail,
  authLimiter,
  verifyOTP
);

router.post("/google-login", googleLogin);

router.get("/me", authenticateToken, getCurrentUser);
router.post("/logout", logout);
router.post("/logout-all", authenticateToken, logoutAll);

module.exports = router;
