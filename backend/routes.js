const express = require('express');
const router = express.Router();

// Middlewares
const auth = require('./middlewares/authMiddleware');
const authorize = require('./middlewares/roleMiddleware');

// Controllers
const authController = require('./controllers/authController');
const taskController = require('./controllers/taskController');
const userController = require('./controllers/userController');

// --- 1. Public Authentication Endpoints ---
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);

// --- All routes below this line require authentication ---
router.use(auth);

// --- 2. User Management Endpoints (Admin/Manager to list, Admin to change roles) ---
router.get('/users', authorize(['ADMIN', 'MANAGER']), userController.getAllUsers);
router.put('/users/:id/role', authorize(['ADMIN']), userController.updateUserRole);

// --- 3. Task Management Endpoints ---
router.post('/tasks', authorize(['ADMIN', 'MANAGER']), taskController.createTask);
router.get('/tasks', authorize(['ADMIN', 'MANAGER', 'MEMBER']), taskController.getAllTasks);
router.get('/tasks/:id', authorize(['ADMIN', 'MANAGER', 'MEMBER']), taskController.getTaskById);
router.put('/tasks/:id', authorize(['ADMIN', 'MANAGER', 'MEMBER']), taskController.updateTask);
router.delete('/tasks/:id', authorize(['ADMIN', 'MANAGER']), taskController.deleteTask);

// --- 4. Task Comments Endpoints ---
router.post('/tasks/:id/comments', authorize(['ADMIN', 'MANAGER', 'MEMBER']), taskController.addComment);
router.get('/tasks/:id/comments', authorize(['ADMIN', 'MANAGER', 'MEMBER']), taskController.getComments);

module.exports = router;
