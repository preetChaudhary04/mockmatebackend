const jwt = require("jsonwebtoken");
const blacklistModel = require("../models/blacklist.model");

const validateRegisterUserInput = (req, res, next) => {
  const { username, email, password } = req.body;

  // Check missing fields
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check type
  if (
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ message: "Invalid data format" });
  }

  // Trim values
  const trimmedUsername = username.trim();
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  // Empty after trim
  if (!trimmedUsername || !trimmedEmail || !trimmedPassword) {
    return res.status(400).json({ message: "Fields cannot be empty" });
  }

  // Length checks
  if (trimmedUsername.length < 3) {
    return res
      .status(400)
      .json({ message: "Username must be at least 3 characters" });
  }

  if (trimmedPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  // Attach sanitized data to req
  req.body.username = trimmedUsername;
  req.body.email = trimmedEmail;
  req.body.password = trimmedPassword;

  next();
};

const validateLoginUserInput = (req, res, next) => {
  const { email, password } = req.body;

  // Check missing fields
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Type check
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Invalid data format" });
  }

  // Trim values
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  // Empty after trim
  if (!trimmedEmail || !trimmedPassword) {
    return res.status(400).json({ message: "Fields cannot be empty" });
  }

  // Basic password length check
  if (trimmedPassword.length < 6) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Attach sanitized data
  req.body.email = trimmedEmail;
  req.body.password = trimmedPassword;

  next();
};

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Token is missing" });

  isTokenBlacklisted = await blacklistModel.findOne({ token });
  if (isTokenBlacklisted)
    return res.status(401).json({ message: "Token is invalidated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = {
  validateRegisterUserInput,
  validateLoginUserInput,
  authMiddleware,
};
