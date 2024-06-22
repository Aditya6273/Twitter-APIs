const express = require("express");
const {
  signupController,
  loginController,
  logoutController,
  getMe,
} = require("../controllers/authController");
const { protectedRoute } = require("../middlewares/protectRoutes");
const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.get("/me", protectedRoute, getMe);
module.exports = router;
