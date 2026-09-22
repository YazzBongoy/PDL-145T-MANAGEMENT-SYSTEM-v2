import { Router } from 'express';
import {
  getDocuments,
  getDocumentById,
  getDocumentsByCategory,
  getDocumentStats,
  createDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
} from '../controllers/documentController.js';
import { authenticateJWT, requireAdminOrSupervisor, validateSchema } from '../middleware/index.js';
import { DocumentParamsSchema } from '../schemas/index.js';

const router = Router();

// List & stats
router.get('/', authenticateJWT, getDocuments);
router.get('/stats', authenticateJWT, getDocumentStats);
router.get('/category/:category', authenticateJWT, getDocumentsByCategory);

// Create (admin/supervisor only)
router.post('/', authenticateJWT, requireAdminOrSupervisor, createDocument);

// Single document
router.get('/:id', authenticateJWT, validateSchema(DocumentParamsSchema, 'params'), getDocumentById);
router.get('/:id/download', authenticateJWT, validateSchema(DocumentParamsSchema, 'params'), downloadDocument);

// Update & delete (admin/supervisor only)
router.put('/:id', authenticateJWT, requireAdminOrSupervisor, validateSchema(DocumentParamsSchema, 'params'), updateDocument);
router.delete('/:id', authenticateJWT, requireAdminOrSupervisor, validateSchema(DocumentParamsSchema, 'params'), deleteDocument);

export default router;
