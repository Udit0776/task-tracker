const authService = require('../services/authService');
const { AppError } = require('../middlewares/errorMiddleware');

class AuthController {
  async signup(req, res, next) {
    try {
      const { name, email, password, role, tenantName, tenantId } = req.body;

      // 1. Basic validation
      if (!name || name.trim() === '') {
        return next(new AppError('Name is required.', 400));
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return next(new AppError('Please provide a valid email address.', 400));
      }
      if (!password || password.length < 6) {
        return next(new AppError('Password must be at least 6 characters long.', 400));
      }

      // 2. Call Service
      const result = await authService.signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        tenantName: tenantName ? tenantName.trim() : null,
        tenantId
      });

      // 3. Respond
      res.status(201).json({
        status: 'success',
        message: 'Registration successful!',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // 1. Basic validation
      if (!email || !password) {
        return next(new AppError('Email and password are required.', 400));
      }

      // 2. Call Service
      const result = await authService.login({
        email: email.trim().toLowerCase(),
        password
      });

      // 3. Respond
      res.status(200).json({
        status: 'success',
        message: 'Login successful!',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
