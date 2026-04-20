import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskHierarchy,
  getSubtasks
} from '../controllers/taskController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Task routes
router.get('/', getTasks);
router.get('/hierarchy/:projectId', getTaskHierarchy);
router.get('/:id', getTaskById);
router.get('/:id/subtasks', getSubtasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
