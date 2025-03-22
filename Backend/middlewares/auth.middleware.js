const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");
const blackListTokenModel = require("../models/blackListToken.model");

module.exports.authUser = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  const isBlacklisted = await blackListTokenModel.findOne({ token: token });

  if (isBlacklisted) {
    throw new ApiError(401, "Unauthorized");
  }

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const user = await userModel.findById(decodedToken._id);

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  req.user = user;
  return next();
});

module.exports.authCaptain = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  const isBlackListed = await blackListTokenModel.findOne({ token });

  if (isBlackListed) {
    throw new ApiError(401, "Unauthorized");
  }

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const captain = await captainModel.findById(decodedToken._id);
  if (!captain) {
    throw new ApiError(401, "Unauthorized");
  }
  req.captain = captain;
  return next();
});
