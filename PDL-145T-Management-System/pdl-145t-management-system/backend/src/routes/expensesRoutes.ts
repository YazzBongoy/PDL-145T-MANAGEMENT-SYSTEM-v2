import { Router } from 'express';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  getExpensesByProject,
  getExpensesByStatus,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
  getProjectExpenseSummary,
} from '../controllers/expensesController.js';
import { authenticateJWT, requireAdminOrSupervisor } from '../middleware/index.js';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

// Create expense (finance/admin)
router.post('/', createExpense);

// Get all expenses
router.get('/', getExpenses);

// Get expenses by status
router.get('/status/:status', getExpensesByStatus);

// Get expenses by project ID
router.get('/project/:projectId/list', getExpensesByProject);

// Get project expense summary
router.get('/project/:projectId/summary', getProjectExpenseSummary);

// Get expense by ID
router.get('/:id', getExpenseById);

// Update expense (finance/admin only)
router.put('/:id', requireAdminOrSupervisor, updateExpense);

// Delete expense (admin only)
router.delete('/:id', requireAdminOrSupervisor, deleteExpense);

// Approve expense (admin/supervisor only)
router.patch('/:id/approve', requireAdminOrSupervisor, approveExpense);

// Reject expense (admin/supervisor only)
router.patch('/:id/reject', requireAdminOrSupervisor, rejectExpense);

export default router;
