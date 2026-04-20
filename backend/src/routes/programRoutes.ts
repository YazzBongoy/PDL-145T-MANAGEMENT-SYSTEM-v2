import { Router } from 'express';
import {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramStats
} from '../controllers/programController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Program routes
router.get('/', getPrograms);
router.get('/:id', getProgramById);
router.post('/', createProgram);
router.put('/:id', updateProgram);
router.delete('/:id', deleteProgram);
router.get('/:id/stats', getProgramStats);

export default router;
