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
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
// const sendErrorDev = (err, res) => {
//   console.log('=== SENDING DEV ERROR RESPONSE ===');
//   console.log('About to send error response with status:', err.statusCode);
  
//   res.status(err.statusCode).json({
//     status: err.status,
//     error: err,
//     message: err.message,
//     stack: err.stack,
//   });
  
//   console.log('Error response sent successfully');
// };
// production error handler
const sendErrorProd = (err, res) => {
  //for error we expect
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // for unexpected errors
  } else {
    console.error("ERROR", err);
    res.status(err.statusCode).json({
      status: err.status,
      message: "Something went wrong",
    });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (err.name === "CastError") {
      error = handleCastErrorDB(error);
      error.isOperational = true;
    }
    if (err.code === 11000) {
      error = handleDuplicateFieldsDB(error);
      error.isOperational = true;
    }
    if (err.name === "ValidationError") {
      error = handleValidationErrorDB(error);
      error.isOperational = true;
    }
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    if (err.name === "SyntaxError") error = handleSyntaxError();
    
    sendErrorProd(error, res);
  }
};
// const errorHandler = (err, req, res, next) => {
//   console.log('=== ERROR HANDLER CALLED ===');
//   console.log('Error message:', err.message);
//   console.log('Status code:', err.statusCode);
//   console.log('NODE_ENV:', process.env.NODE_ENV);
  
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || "error";

//   if (process.env.NODE_ENV === "development") {
//     console.log('Going to development error handler');
//     sendErrorDev(err, res);
//   } else if (process.env.NODE_ENV === "production") {
//     console.log('Going to production error handler');
//     // ... your existing production code
//   } else {
//     console.log('NODE_ENV is neither development nor production:', process.env.NODE_ENV);
//     // Fallback to development
//     sendErrorDev(err, res);
//   }
// };

export default errorHandler;