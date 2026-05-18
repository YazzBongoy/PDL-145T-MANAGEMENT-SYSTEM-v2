import { Router } from 'express';
import {
  getReportTemplates,
  getReportTemplateById,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate
} from '../controllers/reportTemplateController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', getReportTemplates);
router.post('/', createReportTemplate);
router.get('/:id', getReportTemplateById);
router.put('/:id', updateReportTemplate);
router.delete('/:id', deleteReportTemplate);

export default router;
