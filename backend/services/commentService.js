const commentRepository = require('../repositories/commentRepository');
const taskRepository = require('../repositories/taskRepository');
const { AppError } = require('../middlewares/errorMiddleware');

class CommentService {
  async addComment(taskId, userContext, message) {
    const { tenantId, role, id: userId } = userContext;

    if (!message || message.trim() === '') {
      throw new AppError('Comment message cannot be blank.', 400);
    }

    // 1. Verify task exists in tenant
    const task = await taskRepository.findById(taskId, tenantId);
    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    // 2. Access control:
    // "Members should be able to comment on tasks assigned to them; Managers/Admin can comment on any visible task."
    if (role === 'MEMBER' && task.assigned_to_id !== userId) {
      throw new AppError('Access Denied: You can only comment on tasks assigned to you.', 403);
    }

    // 3. Create comment
    return await commentRepository.create({
      tenantId,
      taskId,
      message: message.trim(),
      createdById: userId
    });
  }

  async getCommentsByTaskId(taskId, userContext) {
    const { tenantId, role, id: userId } = userContext;

    // 1. Verify task exists in tenant
    const task = await taskRepository.findById(taskId, tenantId);
    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    // 2. Access control:
    if (role === 'MEMBER' && task.assigned_to_id !== userId) {
      throw new AppError('Access Denied: You can only view comments for tasks assigned to you.', 403);
    }

    // 3. Fetch comments
    return await commentRepository.findAllByTaskId(taskId, tenantId);
  }
}

module.exports = new CommentService();
