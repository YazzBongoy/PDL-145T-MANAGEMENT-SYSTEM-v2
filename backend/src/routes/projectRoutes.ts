import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  getProjectTasks,
  getProjectSprints
} from '../controllers/projectController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Project routes
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', requireRole(['ADMIN', 'SUPERVISOR']), createProject);
router.put('/:id', requireRole(['ADMIN', 'SUPERVISOR']), updateProject);
router.delete('/:id', requireRole(['ADMIN']), deleteProject);
router.get('/:id/stats', getProjectStats);
router.get('/:id/tasks', getProjectTasks);
router.get('/:id/sprints', getProjectSprints);

export default router;
