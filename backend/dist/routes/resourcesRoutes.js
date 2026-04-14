import { Router } from 'express';
import { createResource, getResources, getResourceById, getResourcesByType, updateResource, deleteResource, } from '../controllers/resourcesController.js';
import { authenticateJWT, requireAdminOrSupervisor } from '../middleware/index.js';
const router = Router();
// All routes require authentication
router.use(authenticateJWT);
// Create resource (admin/supervisor only)
router.post('/', requireAdminOrSupervisor, createResource);
// Get all resources
router.get('/', getResources);
// Get resources by type
router.get('/type/:type', getResourcesByType);
// Get resource by ID
router.get('/:id', getResourceById);
// Update resource (admin/supervisor only)
router.put('/:id', requireAdminOrSupervisor, updateResource);
// Delete resource (admin only)
router.delete('/:id', requireAdminOrSupervisor, deleteResource);
export default router;
