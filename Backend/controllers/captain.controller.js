const asyncHandler = require("../utils/asyncHandler");
const { validationResult } = require("express-validator");
const captainModel = require("../models/captain.model");
const { ApiResponse } = require("../utils/ApiResponse");
const { createCaptain } = require("../services/captain.service");
const ApiError = require("../utils/ApiError");

module.exports.registerCaptain = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  console.log("errors", errors);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const { fullname, email, password, vehicle } = req.body;

  const isCaptainAlreadyExist = await captainModel.findOne({ email });
  if (isCaptainAlreadyExist) {
    throw new ApiError(400, "Captain already exists");
  }

  console.log("beforr hased");

  const hashedPassword = await captainModel.hashPassword(password);

  console.log("hashedPassword", hashedPassword);

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
