const express = require("express");
const router = express.Router();

// middlewares
const {
  validateRegisterUserInput,
  validateLoginUserInput,
  authMiddleware,
} = require("../middlewares/auth.middlewares");

// controllers
const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
} = require("../controllers/auth.controllers");

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
router.post("/register", validateRegisterUserInput, registerUser);

/**
 * @route POST /api/auth/login
 * @description Login a new user
 * @access Public
 */
router.post("/login", validateLoginUserInput, loginUser);

/**
 * @route GET /api/auth/logout
 * @description Logout an user
 * @access Public
 */
router.get("/logout", logoutUser);

/**
 * @route GET /api/auth/getme
 * @description Gets details of currently loggen in user
 * @access Private
 */
router.get("/getme", authMiddleware, getMe);

module.exports = router;
