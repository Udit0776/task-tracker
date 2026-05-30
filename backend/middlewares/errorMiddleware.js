// Centralized Global Express Error Handling Middleware

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log non-operational errors (like programming bugs or network drops) for debugging
  if (err.statusCode === 500) {
    console.error('💥 CRITICAL ERROR:', err);
  } else {
    console.warn(`⚠️ Operational Error [${err.statusCode}]: ${err.message}`);
  }

  // Format response JSON
  const errorResponse = {
    status: err.status,
    message: err.message
  };

  // If validation errors are present, append them
  if (err.errors) {
    errorResponse.errors = err.errors;
  }

  // Include stack trace only in development environment
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }

  res.status(err.statusCode).json(errorResponse);
};

module.exports = {
  AppError,
  errorMiddleware
};
