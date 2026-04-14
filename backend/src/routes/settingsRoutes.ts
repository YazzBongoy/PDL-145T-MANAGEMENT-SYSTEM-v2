import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  updateNotifications,
} from '../controllers/settingsController.js';
import { authenticateJWT } from '../middleware/index.js';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

// Get user settings
router.get('/', getSettings);

// Update user settings
router.put('/', updateSettings);

// Update notification preferences
router.patch('/notifications', updateNotifications);

export default router;
