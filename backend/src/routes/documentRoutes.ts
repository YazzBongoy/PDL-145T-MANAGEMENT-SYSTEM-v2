import { Router } from 'express';
import {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  getProjectDocuments,
  getContractDocuments,
  uploadDocument,
  upload
} from '../controllers/documentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

// Document CRUD
router.get('/', getDocuments);
router.post('/', createDocument);
router.get('/:id', getDocumentById);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

// Project documents
router.get('/project/:projectId', getProjectDocuments);

// Contract documents
router.get('/contract/:contractId', getContractDocuments);

// Upload endpoint (multipart/form-data)
router.post('/upload', upload.single('file'), uploadDocument);

export default router;
