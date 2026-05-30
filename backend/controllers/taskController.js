const taskService = require('../services/taskService');
const commentService = require('../services/commentService');
const { AppError } = require('../middlewares/errorMiddleware');

class TaskController {
  async createTask(req, res, next) {
    try {
      const { title, description, priority, status, dueDate, assignedToId } = req.body;

      // 1. Validation
      if (!title || title.trim() === '') {
        return next(new AppError('Task title is required.', 400));
      }

      if (priority && !['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
        return next(new AppError('Invalid priority. Must be LOW, MEDIUM, or HIGH.', 400));
      }

      if (status && !['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
        return next(new AppError('Invalid status. Must be TODO, IN_PROGRESS, or DONE.', 400));
      }

      // 2. Call Service
      const task = await taskService.createTask(req.user, {
        title: title.trim(),
        description: description ? description.trim() : '',
        priority,
        status,
        dueDate,
        assignedToId
      });

      res.status(201).json({
        status: 'success',
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req, res, next) {
    try {
      const task = await taskService.getTaskById(req.params.id, req.user);
      res.status(200).json({
        status: 'success',
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTasks(req, res, next) {
    try {
      const { status, priority, assignedToId } = req.query;

      const tasks = await taskService.getAllTasks(req.user, {
        status,
        priority,
        assignedToId
      });

      res.status(200).json({
        status: 'success',
        results: tasks.length,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req, res, next) {
    try {
      const { title, description, priority, status, dueDate, assignedToId } = req.body;

      // Validate inputs if provided
      if (title !== undefined && title.trim() === '') {
        return next(new AppError('Task title cannot be empty.', 400));
      }

      if (priority && !['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
        return next(new AppError('Invalid priority. Must be LOW, MEDIUM, or HIGH.', 400));
      }

      if (status && !['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
        return next(new AppError('Invalid status. Must be TODO, IN_PROGRESS, or DONE.', 400));
      }

      const updatedTask = await taskService.updateTask(req.params.id, req.user, {
        title: title ? title.trim() : undefined,
        description: description ? description.trim() : undefined,
        priority,
        status,
        dueDate,
        assignedToId
      });

      res.status(200).json({
        status: 'success',
        data: updatedTask
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req, res, next) {
    try {
      const result = await taskService.deleteTask(req.params.id, req.user);
      res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // Comment Endpoints
  async addComment(req, res, next) {
    try {
      const { message } = req.body;
      const comment = await commentService.addComment(req.params.id, req.user, message);

      res.status(201).json({
        status: 'success',
        data: comment
      });
    } catch (error) {
      next(error);
    }
  }

  async getComments(req, res, next) {
    try {
      const comments = await commentService.getCommentsByTaskId(req.params.id, req.user);

      res.status(200).json({
        status: 'success',
        results: comments.length,
        data: comments
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
