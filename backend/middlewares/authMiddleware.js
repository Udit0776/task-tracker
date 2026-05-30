const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { AppError } = require('./errorMiddleware');

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Your session has expired. Please log in again.', 401));
      }
      return next(new AppError('Invalid token. Access denied.', 401));
    }

    // 3. Check if user still exists in database and extract tenant info
    const userRes = await query(
      'SELECT id, name, email, role, tenant_id FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userRes.rows.length === 0) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    const user = userRes.rows[0];

    // 4. Double check tenant-matching safety
    if (user.tenant_id !== decoded.tenantId) {
      return next(new AppError('Tenant mismatch. Access denied.', 403));
    }

    // 5. Attach user context to the request object
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
