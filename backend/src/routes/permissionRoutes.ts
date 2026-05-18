import { Router } from 'express';
import {
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  grantPermission,
  revokePermission,
  getUserPermissions
} from '../controllers/permissionController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', getPermissions);
router.post('/', createPermission);
router.get('/:id', getPermissionById);
router.put('/:id', updatePermission);
router.delete('/:id', deletePermission);
router.post('/grant', grantPermission);
router.post('/revoke', revokePermission);
router.get('/user/:userId', getUserPermissions);

export default router;
