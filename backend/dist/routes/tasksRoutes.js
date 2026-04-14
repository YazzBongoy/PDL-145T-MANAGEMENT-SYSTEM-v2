import { Router } from 'express';
import { createTask, getTasks, getTaskById, getTasksByProject, updateTask, deleteTask, completeTask, } from '../controllers/tasksController.js';
import { authenticateJWT, requireAdminOrSupervisor } from '../middleware/index.js';
const router = Router();
// All routes require authentication
router.use(authenticateJWT);
// Create task (admin/supervisor only)
router.post('/', requireAdminOrSupervisor, createTask);
// Get all tasks
router.get('/', getTasks);
// Get tasks by project ID
router.get('/project/:projectId', getTasksByProject);
// Get task by ID
router.get('/:id', getTaskById);
// Update task (admin/supervisor can update all fields, construction can update status)
router.put('/:id', updateTask);
// Delete task (admin/supervisor only)
router.delete('/:id', requireAdminOrSupervisor, deleteTask);
// Mark task as complete
router.patch('/:id/complete', completeTask);
export default router;
