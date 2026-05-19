import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/index.js';
import { normalizeBody } from '../utils/normalizeBody.js';

const prisma = new PrismaClient();

// Create a new expense
export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  const { taskID, description, cost, date } = normalizeBody(req.body);
  const taskId = taskID;

  if (!taskId || !description || cost === undefined) {
    res.status(400).json({ error: 'taskId, description, and cost are required' });
    return;
  }

  if (cost < 0) {
    res.status(400).json({ error: 'Cost cannot be negative' });
    return;
  }

  const expense = await prisma.expense.create({
    data: {
      TaskID: parseInt(taskId),
      Description: description,
      Cost: cost,
      Date: date ? new Date(date) : new Date(),
    },
  });

  res.status(201).json(expense);
});

// Get all expenses with filtering
export const getExpenses = asyncHandler(async (req: Request, res: Response) => {
  const { taskId, startDate, endDate } = req.query;

  const where: any = {};
  if (taskId) where.TaskID = parseInt(taskId as string);
  if (startDate || endDate) {
    where.Date = {};
    if (startDate) where.Date.gte = new Date(startDate as string);
    if (endDate) where.Date.lte = new Date(endDate as string);
  }

  const expenses = await prisma.expense.findMany({ where });
  res.json(expenses);
});

// Get expense by ID
export const getExpenseById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const expense = await prisma.expense.findUnique({
    where: { ExpenseID: parseInt(id) },
  });

  if (!expense) {
    res.status(404).json({ error: 'Expense not found' });
    return;
  }

  res.json(expense);
});

// Get expenses by task
export const getExpensesByTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const expenses = await prisma.expense.findMany({
    where: { TaskID: parseInt(taskId) },
  });

  res.json(expenses);
});

// Get expenses by date range
export const getExpensesByDateRange = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  const where: any = {};
  if (startDate || endDate) {
    where.Date = {};
    if (startDate) where.Date.gte = new Date(startDate as string);
    if (endDate) where.Date.lte = new Date(endDate as string);
  }

  const expenses = await prisma.expense.findMany({ where });
  res.json(expenses);
});

// Update expense
export const updateExpense = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { description, cost, date } = normalizeBody(req.body);

  if (cost !== undefined && cost < 0) {
    res.status(400).json({ error: 'Cost cannot be negative' });
    return;
  }

  const expense = await prisma.expense.update({
    where: { ExpenseID: parseInt(id) },
    data: {
      ...(description && { Description: description }),
      ...(cost !== undefined && { Cost: cost }),
      ...(date && { Date: new Date(date) }),
    },
  });

  res.json(expense);
});

// Delete expense
export const deleteExpense = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.expense.delete({
    where: { ExpenseID: parseInt(id) },
  });

  res.status(204).send();
});

// Get expense summary by task
export const getTaskExpenseSummary = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;

  const expenses = await prisma.expense.findMany({
    where: { TaskID: parseInt(taskId) },
  });

  const summary = {
    taskId: parseInt(taskId),
    totalExpenses: expenses.length,
    totalCost: expenses.reduce((sum: number, e: { Cost: { toNumber: () => number } | number }) => sum + (typeof e.Cost === 'object' ? e.Cost.toNumber() : e.Cost), 0),
  };

  res.json(summary);
});
