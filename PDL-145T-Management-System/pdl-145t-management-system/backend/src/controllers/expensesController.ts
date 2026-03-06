import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/index.js';

const prisma = new PrismaClient();

// Create a new expense
export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, description, amount, category, date, vendor, notes } = req.body;

  if (!projectId || !description || !amount) {
    res.status(400).json({ error: 'projectId, description, and amount are required' });
    return;
  }

  if (amount < 0) {
    res.status(400).json({ error: 'Amount cannot be negative' });
    return;
  }

  const expense = await prisma.expense.create({
    data: {
      projectId,
      description,
      amount,
      category: category || 'OTHER',
      date: date ? new Date(date) : new Date(),
      vendor: vendor || '',
      notes: notes || '',
      approvalStatus: 'PENDING',
      approvedBy: null,
    },
  });

  res.status(201).json(expense);
});

// Get all expenses with filtering
export const getExpenses = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, status, category } = req.query;

  const where: any = {};
  if (projectId) where.projectId = parseInt(projectId as string);
  if (status) where.approvalStatus = status;
  if (category) where.category = category;

  const expenses = await prisma.expense.findMany({ where });
  res.json(expenses);
});

// Get expense by ID
export const getExpenseById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const expense = await prisma.expense.findUnique({
    where: { id: parseInt(id) },
  });

  if (!expense) {
    res.status(404).json({ error: 'Expense not found' });
    return;
  }

  res.json(expense);
});

// Get expenses by project
export const getExpensesByProject = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const expenses = await prisma.expense.findMany({
    where: { projectId: parseInt(projectId) },
  });

  res.json(expenses);
});

// Get expenses by status
export const getExpensesByStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.params;
  const expenses = await prisma.expense.findMany({
    where: { approvalStatus: status },
  });

  res.json(expenses);
});

// Update expense
export const updateExpense = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { description, amount, category, vendor, notes, approvalStatus, approvedBy } = req.body;

  if (amount !== undefined && amount < 0) {
    res.status(400).json({ error: 'Amount cannot be negative' });
    return;
  }

  const expense = await prisma.expense.update({
    where: { id: parseInt(id) },
    data: {
      ...(description && { description }),
      ...(amount !== undefined && { amount }),
      ...(category && { category }),
      ...(vendor && { vendor }),
      ...(notes && { notes }),
      ...(approvalStatus && { approvalStatus }),
      ...(approvedBy !== undefined && { approvedBy }),
    },
  });

  res.json(expense);
});

// Delete expense
export const deleteExpense = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.expense.delete({
    where: { id: parseInt(id) },
  });

  res.status(204).send();
});

// Approve expense
export const approveExpense = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { approvedBy } = req.body;

  const expense = await prisma.expense.update({
    where: { id: parseInt(id) },
    data: {
      approvalStatus: 'APPROVED',
      approvedBy: approvedBy || null,
    },
  });

  res.json(expense);
});

// Reject expense
export const rejectExpense = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const expense = await prisma.expense.update({
    where: { id: parseInt(id) },
    data: {
      approvalStatus: 'REJECTED',
      notes: reason || 'Rejected by admin',
    },
  });

  res.json(expense);
});

// Get expense summary by project
export const getProjectExpenseSummary = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;

  const expenses = await prisma.expense.findMany({
    where: { projectId: parseInt(projectId) },
  });

  const summary = {
    projectId: parseInt(projectId),
    totalExpenses: expenses.length,
    totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
    approved: expenses.filter((e) => e.approvalStatus === 'APPROVED').reduce((sum, e) => sum + e.amount, 0),
    pending: expenses.filter((e) => e.approvalStatus === 'PENDING').reduce((sum, e) => sum + e.amount, 0),
    rejected: expenses.filter((e) => e.approvalStatus === 'REJECTED').reduce((sum, e) => sum + e.amount, 0),
  };

  res.json(summary);
});
