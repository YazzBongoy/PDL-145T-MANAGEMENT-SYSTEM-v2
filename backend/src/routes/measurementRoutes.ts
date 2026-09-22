import { Router } from 'express';
import {
  createMeasurement,
  getMeasurementsByTask,
  getMeasurementById,
  updateMeasurement,
  deleteMeasurement,
  getMeasurementsBySite,
  getMeasurementsByType,
  getMeasurementsPaginated,
} from '../controllers/measurementController.js';
import {
  authenticateJWT,
  requireAdminOrSupervisor,
  requireConstruction,
  validateSchema,
} from '../middleware/index.js';
import { MeasurementCreateSchema, MeasurementUpdateSchema } from '../schemas/index.js';

const router = Router();

router.get('/', authenticateJWT, getMeasurementsPaginated);
router.get('/:id', authenticateJWT, getMeasurementById);
router.get('/site/:siteId', authenticateJWT, getMeasurementsBySite);
router.get('/type/:type', authenticateJWT, getMeasurementsByType);

router.get('/task/:taskId', authenticateJWT, getMeasurementsByTask);
router.post(
  '/task/:taskId',
  authenticateJWT,
  requireConstruction,
  validateSchema(MeasurementCreateSchema, 'body'),
  createMeasurement
);

router.put(
  '/:id',
  authenticateJWT,
  requireAdminOrSupervisor,
  validateSchema(MeasurementUpdateSchema, 'body'),
  updateMeasurement
);

router.delete(
  '/:id',
  authenticateJWT,
  requireAdminOrSupervisor,
  deleteMeasurement
);

export default router;
