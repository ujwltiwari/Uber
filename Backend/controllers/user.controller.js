const { validationResult } = require("express-validator");
const userService = require("../services/user.service");
const userModel = require("../models/user.model");
const blackListTokenModel = require("../models/blacklistToken.model");
const { ApiResponse } = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

//User Registration
module.exports.registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password } = req.body;

  const hashedPassword = await userModel.hashPassword(password);

  try {
    const user = await userService.createUser({
      firstname: fullname.firstname,
      lastname: fullname.lastname,
      email,
      password: hashedPassword,
    });
    const token = user.generateAuthToken();

    return res
      .status(200)
      .json(new ApiResponse(200, "User Created Successfully", { token, user }));
  } catch (error) {
    return res.status(400).json({ error: error });
  }
});

// User Login
module.exports.loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid Email Or Password");
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw new ApiError(401, "Invalid Email Or Password");
  }

  const token = user.generateAuthToken();
  // ✅ Secure cookie settings
  res.cookie("token", token, {
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === "production", // Set to `true` in production
    sameSite: "strict", // Protects against CSRF
  });
  return res
    .status(200)
    .json(new ApiResponse(200, "User Logged In", { token, user }));
});

//User Profile
module.exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  return res.status(200).json(new ApiResponse(200, "User Profile", user));
});

//Logout User
module.exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.authorization.split(" ")[1];
  await blackListTokenModel.create({ token });
  return res.status(200).json(new ApiResponse(200, "Logout Successfull"));
});
