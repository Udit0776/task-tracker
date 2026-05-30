const userRepository = require('../repositories/userRepository');
const { AppError } = require('../middlewares/errorMiddleware');

class UserService {
  async getAllUsers(userContext) {
    const { tenantId } = userContext;
    return await userRepository.findAllInTenant(tenantId);
  }

  async updateUserRole(targetUserId, userContext, newRole) {
    const { tenantId, id: adminId } = userContext;

    // Validate new role value
    const allowedRoles = ['ADMIN', 'MANAGER', 'MEMBER'];
    if (!allowedRoles.includes(newRole)) {
      throw new AppError(`Invalid role: ${newRole}. Allowed values are: ADMIN, MANAGER, MEMBER.`, 400);
    }

    // 1. Prevent updating own role
    if (targetUserId === adminId) {
      throw new AppError('Action Denied: You cannot modify your own administrative role.', 400);
    }

    // 2. Check if user exists in tenant
    const user = await userRepository.findById(targetUserId, tenantId);
    if (!user) {
      throw new AppError('User not found in your organization.', 404);
    }

    // 3. Update role
    return await userRepository.updateRole(targetUserId, newRole, tenantId);
  }
}

module.exports = new UserService();
