const taskRepository = require('../repositories/taskRepository');
const userRepository = require('../repositories/userRepository');
const { AppError } = require('../middlewares/errorMiddleware');

class TaskService {
  async createTask(userContext, taskData) {
    const { tenantId, id: userId } = userContext;

    // If assignedToId is provided, verify it exists and belongs to the same tenant
    if (taskData.assignedToId) {
      const assignee = await userRepository.findById(taskData.assignedToId, tenantId);
      if (!assignee) {
        throw new AppError('The assigned user does not exist in your organization.', 400);
      }
    }

    const newTask = await taskRepository.create({
      tenantId,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority || 'MEDIUM',
      status: taskData.status || 'TODO',
      dueDate: taskData.dueDate,
      createdById: userId,
      assignedToId: taskData.assignedToId || null
    });

    return newTask;
  }

  async getTaskById(id, userContext) {
    const { tenantId, role, id: userId } = userContext;

    const task = await taskRepository.findById(id, tenantId);
    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    // Role restrictions:
    // "Member Can view tasks assigned to them"
    if (role === 'MEMBER' && task.assigned_to_id !== userId) {
      throw new AppError('Access Denied: You can only view tasks assigned to you.', 403);
    }

    return task;
  }

  async getAllTasks(userContext, filters) {
    const { tenantId, role, id: userId } = userContext;
    const { status, priority, assignedToId } = filters;

    // Delegate role-filtering and parameters down to Repository
    return await taskRepository.findAll({
      tenantId,
      status,
      priority,
      assignedToId,
      role,
      userId
    });
  }

  async updateTask(id, userContext, updates) {
    const { tenantId, role, id: userId } = userContext;

    // 1. Check if task exists in tenant
    const existingTask = await taskRepository.findById(id, tenantId);
    if (!existingTask) {
      throw new AppError('Task not found.', 404);
    }

    // 2. Role-based modifications check
    if (role === 'MEMBER') {
      // "Member can only update status for tasks assigned to them"
      if (existingTask.assigned_to_id !== userId) {
        throw new AppError('Access Denied: You can only update tasks assigned to you.', 403);
      }

      // Check if they tried to update other fields besides 'status'
      const updateKeys = Object.keys(updates).filter(key => updates[key] !== undefined);
      const invalidKeys = updateKeys.filter(key => key !== 'status');

      if (invalidKeys.length > 0) {
        throw new AppError('Access Denied: Members are only permitted to update task status.', 403);
      }

      // Only allow status update
      return await taskRepository.update(id, tenantId, { status: updates.status });
    }

    // Manager / Admin can update anything.
    // If updating assignedToId, verify user exists in tenant.
    if (updates.assignedToId) {
      const assignee = await userRepository.findById(updates.assignedToId, tenantId);
      if (!assignee) {
        throw new AppError('The assigned user does not exist in your organization.', 400);
      }
    }

    return await taskRepository.update(id, tenantId, updates);
  }

  async deleteTask(id, userContext) {
    const { tenantId } = userContext;

    const existingTask = await taskRepository.findById(id, tenantId);
    if (!existingTask) {
      throw new AppError('Task not found.', 404);
    }

    await taskRepository.delete(id, tenantId);
    return { message: 'Task deleted successfully.' };
  }
}

module.exports = new TaskService();
