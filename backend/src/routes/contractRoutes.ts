import { Router } from 'express';
import {
  getContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  getProjectContracts,
  getContractPaymentSchedules,
  createPaymentSchedule,
  updatePaymentSchedule,
  deletePaymentSchedule
} from '../controllers/contractController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

// Contract CRUD
router.get('/', getContracts);
router.post('/', createContract);
router.get('/:id', getContractById);
router.put('/:id', updateContract);
router.delete('/:id', deleteContract);

// Project contracts
router.get('/project/:projectId', getProjectContracts);

// Payment schedules
router.get('/:id/payments', getContractPaymentSchedules);
router.post('/:id/payments', createPaymentSchedule);
router.put('/payments/:scheduleId', updatePaymentSchedule);
router.delete('/payments/:scheduleId', deletePaymentSchedule);

export default router;
