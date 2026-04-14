import { Router } from 'express';
import { createMeasurement, getMeasurementsByTask, getMeasurementById, updateMeasurement, deleteMeasurement, getMeasurementsBySite, getMeasurementsByType, getMeasurementsPaginated, } from '../controllers/measurementController.js';
import { authenticateJWT, requireAdminOrSupervisor, requireConstruction, validateSchema, } from '../middleware/index.js';
import { MeasurementCreateSchema, MeasurementUpdateSchema, MeasurementParamsSchema, } from '../schemas/index.js';
const router = Router();
// Public routes (with authentication)
router.get('/', authenticateJWT, getMeasurementsPaginated);
router.get('/:id', authenticateJWT, validateSchema(MeasurementParamsSchema, 'params'), getMeasurementById);
router.get('/site/:siteId', authenticateJWT, getMeasurementsBySite);
router.get('/type/:type', authenticateJWT, getMeasurementsByType);
// Task-specific routes
router.get('/task/:taskId', authenticateJWT, getMeasurementsByTask);
router.post('/task/:taskId', authenticateJWT, requireConstruction, validateSchema(MeasurementCreateSchema, 'body'), createMeasurement);
// Admin/Supervisor routes
router.put('/:id', authenticateJWT, requireAdminOrSupervisor, validateSchema(MeasurementParamsSchema, 'params'), validateSchema(MeasurementUpdateSchema, 'body'), updateMeasurement);
router.delete('/:id', authenticateJWT, requireAdminOrSupervisor, validateSchema(MeasurementParamsSchema, 'params'), deleteMeasurement);
export default router;
