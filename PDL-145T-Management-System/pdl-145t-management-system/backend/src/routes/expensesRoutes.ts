import { Router } from 'express';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  getExpensesByTask,
  getExpensesByDateRange,
  updateExpense,
  deleteExpense,
  getTaskExpenseSummary,
} from '../controllers/expensesController.js';
import { authenticateJWT, requireAdminOrSupervisor } from '../middleware/index.js';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

// Create expense (finance/admin)
router.post('/', createExpense);

// Get all expenses
router.get('/', getExpenses);

// Get expenses by date range
router.get('/date-range', getExpensesByDateRange);

// Get expenses by task ID
router.get('/task/:taskId/list', getExpensesByTask);

// Get task expense summary
router.get('/task/:taskId/summary', getTaskExpenseSummary);

// Get expense by ID
router.get('/:id', getExpenseById);

// Update expense (finance/admin only)
router.put('/:id', requireAdminOrSupervisor, updateExpense);

// Delete expense (admin only)
router.delete('/:id', requireAdminOrSupervisor, deleteExpense);

export default router;
