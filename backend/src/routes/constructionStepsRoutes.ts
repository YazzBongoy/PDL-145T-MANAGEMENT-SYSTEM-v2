import { Router } from 'express';
import {
  getStepsByTaskId,
  getStepById,
  createStep,
  updateStep,
  deleteStep,
  createDefaultSteps,
  updateStepProgress,
  addPhotoToStep,
  getStepPhotos
} from '../controllers/constructionStepController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

// Get all steps for a task
router.get('/task/:taskId', getStepsByTaskId);

// Create default steps for a task
router.post('/task/:taskId/default', createDefaultSteps);

// Create a new step
router.post('/', createStep);

// Get single step
router.get('/:id', getStepById);

// Update step
router.put('/:id', updateStep);

// Update step progress
router.patch('/:id/progress', updateStepProgress);

// Delete step
router.delete('/:id', deleteStep);

// Photos
router.get('/:id/photos', getStepPhotos);
router.post('/:id/photos', addPhotoToStep);

export default router;
