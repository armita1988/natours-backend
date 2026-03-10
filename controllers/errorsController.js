const AppError = require('../utils/appError');

const HandleCastErrorDB = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const HandleValidationErrorDB = (err) => {
  const messages = Object.entries(err?.errors)
    .map(([key, value]) => value.message)
    .join(', ');

  return new AppError(messages, 400);
};
const HandleDuplicateKeyErrorDB = (err) => {
  const [field, value] = Object.entries(err.keyValue)[0];
  return new AppError(
    ` Duplicate value: ${value} for field: ${field} . Please use another value!`,
    400,
  );
};

const HandleJWTError = (err) => {
  return new AppError(` Ivalid JWT token. Please log in again!`, 401);
};

const HandleJWTExpired = (err) => {
  return new AppError(`Your token has expired. Please log in again!`, 401);
};

const sendErrorDev = function (err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = function (err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'something went wrong!',
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err?.errorResponse?.code === 11000) {
      err = HandleDuplicateKeyErrorDB(err);
    }
    if (err?.name === 'CastError') {
      err = HandleCastErrorDB(err);
    }
    if (err?.name === 'ValidationError') {
      err = HandleValidationErrorDB(err);
    }
    if (err?.name === 'JsonWebTokenError') {
      err = HandleJWTError(err);
    }

    if (err?.name === 'TokenExpiredError') {
      err = HandleJWTExpired(err);
    }

    sendErrorProd(err, res);
  }
};

module.exports = globalErrorHandler;
