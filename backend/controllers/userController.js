const userService = require('../services/userService');
const { AppError } = require('../middlewares/errorMiddleware');

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers(req.user);
      res.status(200).json({
        status: 'success',
        results: users.length,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const { role } = req.body;
      const targetUserId = req.params.id;

      if (!role) {
        return next(new AppError('Role is required.', 400));
      }

      const updatedUser = await userService.updateUserRole(
        targetUserId,
        req.user,
        role.trim().toUpperCase()
      );

      res.status(200).json({
        status: 'success',
        message: 'User role updated successfully.',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
