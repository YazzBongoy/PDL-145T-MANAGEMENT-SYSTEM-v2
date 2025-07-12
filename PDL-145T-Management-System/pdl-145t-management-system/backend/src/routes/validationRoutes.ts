import { Router } from 'express';
import {
  createValidation,
  getValidationsByTask,
  getValidationById,
  updateValidation,
  deleteValidation,
  approveValidation,
  rejectValidation,
  getValidationsBySite,
  getValidationsPaginated,
} from '../controllers/validationController.js';
import {
  authenticateJWT,
  requireAdminOrSupervisor,
  requireFinance,
  validateSchema,
} from '../middleware/index.js';
import {
  ValidationCreateSchema,
  ValidationUpdateSchema,
  ValidationParamsSchema,
} from '../schemas/index.js';

const router = Router();

// Public routes (with authentication)
router.get('/', authenticateJWT, getValidationsPaginated);
router.get('/:id', authenticateJWT, validateSchema(ValidationParamsSchema, 'params'), getValidationById);
router.get('/site/:siteId', authenticateJWT, getValidationsBySite);

// Task-specific routes
router.get('/task/:taskId', authenticateJWT, getValidationsByTask);
router.post(
  '/task/:taskId',
  authenticateJWT,
  requireAdminOrSupervisor,
  validateSchema(ValidationCreateSchema, 'body'),
  createValidation
);

// Admin/Supervisor routes
router.put(
  '/:id',
  authenticateJWT,
  requireAdminOrSupervisor,
  validateSchema(ValidationParamsSchema, 'params'),
  validateSchema(ValidationUpdateSchema, 'body'),
  updateValidation
);

router.delete(
  '/:id',
  authenticateJWT,
  requireAdminOrSupervisor,
  validateSchema(ValidationParamsSchema, 'params'),
  deleteValidation
);

// Finance approval routes
router.post(
  '/:id/approve',
  authenticateJWT,
  requireFinance,
  validateSchema(ValidationParamsSchema, 'params'),
  approveValidation
);

router.post(
  '/:id/reject',
  authenticateJWT,
  requireFinance,
  validateSchema(ValidationParamsSchema, 'params'),
  rejectValidation
);

export default router;
