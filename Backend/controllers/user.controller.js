const { validationResult } = require("express-validator");
const userService = require("../services/user.service");
const userModel = require("../models/user.model");
const { ApiResponse } = require("../utils/ApiResponse");

//User Registration
module.exports.registerUser = async (req, res, next) => {
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
};

// User Login
module.exports.loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Invalid Email Or Password" });
  }

  const isPasswordMatch = user.comparePassword(password);

  if (!isPasswordMatch) {
    return res.status(401).json({ message: "Invalid Email Or Password" });
  }

  const token = user.generateAuthToken();
  return res
    .status(200)
    .json(new ApiResponse(200, "User Logged In", { token, user }));
};
