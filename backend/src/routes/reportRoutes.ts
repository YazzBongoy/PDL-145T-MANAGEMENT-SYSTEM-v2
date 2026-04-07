import { Router } from 'express';
import {
  createReport,
  getAllReports,
  getReportById,
  getReportsByProject,
  getReportsByValidation,
  deleteReport,
  getReportsPaginated,
  generateBillingReport,
} from '../controllers/reportController.js';
import {
  authenticateJWT,
  requireAdminOrSupervisor,
  requireFinance,
  validateSchema,
} from '../middleware/index.js';
import {
  ReportCreateSchema,
  ReportParamsSchema,
} from '../schemas/index.js';

const router = Router();

// Public routes (with authentication)
router.get('/', authenticateJWT, getReportsPaginated);
router.get('/all', authenticateJWT, getAllReports);
router.get('/:id', authenticateJWT, validateSchema(ReportParamsSchema, 'params'), getReportById);

// Project-specific routes
router.get('/project/:projectId', authenticateJWT, getReportsByProject);
router.get('/project/:projectId/billing', authenticateJWT, requireFinance, generateBillingReport);

// Validation-specific routes
router.get('/validation/:validationId', authenticateJWT, getReportsByValidation);

// Admin/Finance routes
router.post(
  '/',
  authenticateJWT,
  requireFinance,
  validateSchema(ReportCreateSchema, 'body'),
  createReport
);

router.delete(
  '/:id',
  authenticateJWT,
  requireAdminOrSupervisor,
  validateSchema(ReportParamsSchema, 'params'),
  deleteReport
);

export default router;
