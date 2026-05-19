import { Router } from 'express';
import {
  getTaskResources,
  createTaskResource,
  deleteTaskResource
} from '../controllers/taskResourceController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getTaskResources);
router.post('/', createTaskResource);
router.delete('/:taskId/:resourceId', deleteTaskResource);

export default router;
