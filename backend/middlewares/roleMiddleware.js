const { AppError } = require('./errorMiddleware');

/**
 * Middleware builder to restrict endpoint access to specific roles.
 * Must be used AFTER authMiddleware.
 * 
 * @param {Array<string>} roles - Array of allowed roles (e.g. ['ADMIN', 'MANAGER'])
 */
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication context missing.', 500));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Permission Denied: Role '${req.user.role}' is not authorized to access this resource. Required roles: [${roles.join(', ')}]`,
          403
        )
      );
    }

    next();
  };
};

module.exports = authorize;
