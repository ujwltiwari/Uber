const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

module.exports.authUser = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  const isBlackListed = await userModel.findOne({ token });

  if (isBlackListed) {
    throw new ApiError(401, "Unauthorized");
  }

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const user = await userModel.findById(decodedToken._id);
  req.user = user;
  return next();
});
