import AppError from "../utils/appError.js";

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = Object.keys(err.keyValue)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError("Invalid token. Please log in again", 401);
};

const handleJWTExpiredError = () => {
  return new AppError("Your token has expired! Please log in again.", 401);
};

const handleSyntaxError = () => {
  return new AppError("Invalid input syntax", 400);
};

// development error handler
const sendErrorDev = (err, res) => {
  console.log("🐛 Development Error:", {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
  });

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// production error handler
const sendErrorProd = (err, res) => {
  console.log("🔥 Production Error:", {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    isOperational: err.isOperational,
  });

  //for error we expect
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // for unexpected errors
  } else {
    console.error("❌ UNEXPECTED ERROR:", err);
    res.status(err.statusCode).json({
      status: err.status,
      message: "Something went wrong",
    });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  console.log("🚨 Error Handler Called:", {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    environment: process.env.NODE_ENV,
  });

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = Object.create(Object.getPrototypeOf(err));
    Object.assign(error, err);

    if (err.name === "CastError") {
      error = handleCastErrorDB(error);
    }

    if (err.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    if (err.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    }

    if (err.name === "JsonWebTokenError") error = handleJWTError();

    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    if (err.name === "SyntaxError") error = handleSyntaxError();

    sendErrorProd(error, res);
  }
};

export default errorHandler;
