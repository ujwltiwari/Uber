const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

const expressValidatorError = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return new ApiError(400, "Validation Error", errors.array());
  }
  return null; // Return null explicitly if no errors
};

module.exports = expressValidatorError;
