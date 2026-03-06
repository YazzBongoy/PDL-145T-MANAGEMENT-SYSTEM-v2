import { Router } from 'express';
import {
  createResource,
  getResources,
  getResourceById,
  getResourcesByProject,
  getResourcesByType,
  updateResource,
  deleteResource,
  allocateResource,
  getAvailableResourcesCount,
  getResourceAllocationSummary,
} from '../controllers/resourcesController.js';
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

// Get resources by project ID
router.get('/project/:projectId/list', getResourcesByProject);

// Get available resources count
router.get('/project/:projectId/available', getAvailableResourcesCount);

// Get resource allocation summary
router.get('/project/:projectId/summary', getResourceAllocationSummary);

// Get resource by ID
router.get('/:id', getResourceById);

// Update resource (admin/supervisor only)
router.put('/:id', requireAdminOrSupervisor, updateResource);

// Delete resource (admin only)
router.delete('/:id', requireAdminOrSupervisor, deleteResource);

// Allocate resource (admin/supervisor only)
router.patch('/:id/allocate', requireAdminOrSupervisor, allocateResource);

export default router;
