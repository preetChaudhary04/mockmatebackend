const userModel = require("../models/user.model");
const blacklistModel = require("../models/blacklist.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * @name registerUser
 * @description This method creates a new user, expects username, email, and password from request body
 * @access Public
 */
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // does user already exists
    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ username }, { email }],
    });
    if (isUserAlreadyExists) {
      return res
        .status(400)
        .json({ message: "Username or Email already taken" });
    }

    // hash password
    const hashedPass = await bcrypt.hash(password, 10);

    // create a new user
    const user = await userModel.create({
      username,
      email,
      password: hashedPass,
    });

    // setting cookie
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, { maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        username,
        email,
      },
    });
  } catch (err) {
    console.log("Register user error: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @name loginUser
 * @description This method login an user, expects email and password
 * @access Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // does email exists?
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // does password match?
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // generating token and saving it in cookie
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, { maxAge: 7 * 24 * 60 * 60 * 1000 });

    // sending response
    res.status(200).json({
      message: "Logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.log("Login error: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @name logoutUser
 * @description This method logs out an user, adds token into blacklist
 * @access Public
 */
const logoutUser = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(400).json({ message: "Token missing" });
    }

    await blacklistModel.create({ token });

    res.clearCookie("token");

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.log("Logout Error: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @name getMe
 * @description This method returns the current user
 * @access Private
 */
const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) return res.status(401).json({ message: "User not found" });

    return res.status(200).json({
      message: "User found successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { registerUser, loginUser, logoutUser, getMe };
