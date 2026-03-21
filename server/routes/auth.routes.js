const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  refreshToken,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const { validateMiddleware } = require("../middlewares/validateMiddleware");
const {
  registerValidationSchema,
  loginValidationSchema,
} = require("../validators/authValidationSchema");

router
  .route("/register")
  .post(registerValidationSchema(), validateMiddleware, register);

router.route("/login").post(loginValidationSchema(), validateMiddleware, login);

router.route("/refresh").post(refreshToken);

router.route("/logout").post(authMiddleware, logout);

module.exports = { authRouter: router };
