const asyncHandler = require("../utils/asyncHandler");
const { validationResult } = require("express-validator");
const captainModel = require("../models/captain.model");
const { ApiResponse } = require("../utils/ApiResponse");
const { createCaptain } = require("../services/captain.service");
const ApiError = require("../utils/ApiError");
const blackListTokenModel = require("../models/blacklistToken.model");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

module.exports.registerCaptain = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const { fullname, email, password, vehicle } = req.body;

  const isCaptainAlreadyExist = await captainModel.findOne({ email });
  if (isCaptainAlreadyExist) {
    throw new ApiError(400, "Captain already exists");
  }

  const hashedPassword = await captainModel.hashPassword(password);

  const captain = await createCaptain({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    password: hashedPassword,
    color: vehicle.color,
    plate: vehicle.plate,
    capacity: vehicle.capacity,
    vehicleType: vehicle.vehicleType,
  });

  const token = captain.generateAuthToken();

  return res.status(200).json(
    new ApiResponse(200, "Captain Successfully Registered", {
      token,
      captain,
    }),
  );
});

module.exports.loginCaptain = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const { email, password } = req.body;

  const captain = await captainModel.findOne({ email }).select("+password");
  console.log({ captain });
  if (!captain) {
    throw new ApiError(401, "Invalid Email Or Password");
  }

  const isPasswordMatch = await captain.comparePassword(password);
  console.log({ isPasswordMatch });
  if (!isPasswordMatch) {
    throw new ApiError(401, "Invalid Email Or Password");
  }

  const token = captain.generateAuthToken();
  // ✅ Secure cookie settings
  res.cookie("token", token, {
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === "production", // Set to `true` in production
    sameSite: "strict", // Protects against CSRF
  });

  return res.status(200).json(
    new ApiResponse(200, "Login Successful", {
      token,
      captain,
    }),
  );
});

module.exports.getCaptainProfile = asyncHandler(async (req, res) => {
  const captain = req.captain;
  return res.status(200).json(new ApiResponse(200, "Captain Profile", captain));
});

module.exports.logoutCaptain = asyncHandler(async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  await blackListTokenModel.create({ token });

  res.clearCookie("token");

  res.status(200).json({ message: "Logout successfully" });
});
