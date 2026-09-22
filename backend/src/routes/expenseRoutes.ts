import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticateJWT, requireAdminOrSupervisor } from '../middleware/index.js';

const router = Router();

// Create Expense (linked to Task)
router.post('/', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const { TaskID, Description, Cost, Date } = req.body;
  if (!TaskID || !Cost || !Date) {
    res.status(400).json({ error: 'TaskID, Cost, and Date are required.' });
    return;
  }
  const expense = await prisma.expense.create({
    data: {
      TaskID: Number(TaskID),
      Description: Description || null,
      Cost: Number(Cost),
      Date: new Date(Date),
    },
  });
  res.status(201).json(expense);
});

// List Expenses by Task
router.get('/by-task/:taskId', authenticateJWT, async (req, res) => {
  const taskId = Number(req.params.taskId);
  const expenses = await prisma.expense.findMany({ where: { TaskID: taskId }, orderBy: { Date: 'desc' } });
  res.json(expenses);
});

// Get Expense Details
router.get('/:id', authenticateJWT, async (req, res) => {
  const id = Number(req.params.id);
  const expense = await prisma.expense.findUnique({ where: { ExpenseID: id } });
  if (!expense) {
    res.status(404).json({ error: 'Expense not found' });
    return;
  }
  res.json(expense);
});

// Update Expense
router.put('/:id', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const id = Number(req.params.id);
  const { Description, Cost, Date } = req.body;
  const expense = await prisma.expense.findUnique({ where: { ExpenseID: id } });
  if (!expense) {
    res.status(404).json({ error: 'Expense not found' });
    return;
  }
  const updated = await prisma.expense.update({
    where: { ExpenseID: id },
    data: {
      Description: Description ?? expense.Description,
      Cost: Cost !== undefined ? Number(Cost) : expense.Cost,
      Date: Date ? new Date(Date) : expense.Date,
    },
  });
  res.json(updated);
});

// Delete Expense
router.delete('/:id', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const id = Number(req.params.id);
  const expense = await prisma.expense.findUnique({ where: { ExpenseID: id } });
  if (!expense) {
    res.status(404).json({ error: 'Expense not found' });
    return;
  }
  await prisma.expense.delete({ where: { ExpenseID: id } });
  res.json({ success: true });
});

export default router;
