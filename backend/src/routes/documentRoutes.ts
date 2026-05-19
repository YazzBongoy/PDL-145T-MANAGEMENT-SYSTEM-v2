import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
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
router.post('/upload',
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        res.status(400).json({ error: `Fichier trop volumineux (max 500 MB)` });
        return;
      }
      if (err) {
        res.status(400).json({ error: err.message || 'Erreur upload' });
        return;
      }
      next();
    });
  },
  uploadDocument
);

export default router;
