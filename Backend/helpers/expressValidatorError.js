const { validationResult } = require("express-validator");
const expressValidatorError = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new Error(errors.array());
  }
};

module.exports = expressValidatorError;
