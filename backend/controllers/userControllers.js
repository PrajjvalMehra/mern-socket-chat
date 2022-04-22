const asyncHandler = require("express-async-handler");
const generateToken = require("../config/generateToken");
const { sendEmail } = require("../config/mailer");
const Token = require("../models/TokenModel");
const User = require("../models/userModel");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter All The Fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password, pic });
  const token = generateToken(user._id);
  if (token) {
    await Token.create({ userId: user._id, token: token });
  }

  if (user) {
    sendEmail(email, "Email Verification", { token: token });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
    });
  } else {
    res.status(400);
    throw new Error("Failed to create user");
  }
});

const verifyUser = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const tokenExists = await Token.findOne({ token: token });
  const checkVerify = await User.findById(tokenExists.userId);
  if (checkVerify.isVerified !== true) {
    if (token === tokenExists.token) {
      const setIsVerified = await User.findByIdAndUpdate(tokenExists.userId, {
        isVerified: true,
      });
      if (setIsVerified) {
        res.status(200).json({
          message: "Verification Successful",
        });
      } else {
        res.status(400).json({
          message: "Token either expired or wrong one passed.",
        });
      }
    } else {
      res.status(400).json({
        message: "Token either expired or wrong one passed.",
      });
    }
  } else {
    res.status(400).json({
      message: "User already verified.",
    });
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please Enter All The Fields");
  }

  const user = await User.findOne({ email });
  if (user.isVerified) {
    if (user && (await user.matchPassword(password))) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid Email or Password");
    }
  } else {
    res.status(400);
    throw new Error("Please verify your email to login.");
  }
});

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

module.exports = { registerUser, authUser, allUsers, verifyUser };
