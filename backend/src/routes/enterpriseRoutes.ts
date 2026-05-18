import { Router } from 'express';
import {
  getEnterprises,
  getEnterpriseById,
  createEnterprise,
  updateEnterprise,
  deleteEnterprise,
  getProjectEnterprises,
  assignEnterpriseToProject,
  removeEnterpriseFromProject
} from '../controllers/enterpriseController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

// Enterprise CRUD
router.get('/', getEnterprises);
router.post('/', createEnterprise);
router.get('/:id', getEnterpriseById);
router.put('/:id', updateEnterprise);
router.delete('/:id', deleteEnterprise);

// Project assignments
router.get('/project/:projectId', getProjectEnterprises);
router.post('/assign', assignEnterpriseToProject);
router.delete('/assign/:projectId/:enterpriseId', removeEnterpriseFromProject);

export default router;
