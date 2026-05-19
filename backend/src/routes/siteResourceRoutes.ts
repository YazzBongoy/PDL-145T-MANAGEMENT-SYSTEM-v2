import { Router } from 'express';
import {
  getSiteResources,
  createSiteResource,
  deleteSiteResource
} from '../controllers/siteResourceController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getSiteResources);
router.post('/', createSiteResource);
router.delete('/:siteId/:resourceId', deleteSiteResource);

export default router;
