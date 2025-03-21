const process = require("node:process");
const ApiError = require("./ApiError");
const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: err.success,
      message: err.message,
      errors: err.errors,
    });
  }

  // Handle duplicate key errors (MongoDB, etc.)
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate key error",
      errors: err.keyValue,
      statusCode: 400,
    });
  }

  // For other unhandled errors
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
    statusCode: 500,
  });
};

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason.message);
  // process.exit(1);
});
module.exports = errorHandler;
