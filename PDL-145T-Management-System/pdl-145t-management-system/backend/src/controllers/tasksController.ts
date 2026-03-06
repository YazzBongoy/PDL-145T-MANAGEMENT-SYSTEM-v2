import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/index.js';

const prisma = new PrismaClient();

// Create a new task
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, name, description, assignedTo, status, priority, dueDate } = req.body;

  if (!projectId || !name) {
    res.status(400).json({ error: 'projectId and name are required' });
    return;
  }

  const task = await prisma.task.create({
    data: {
      projectId,
      name,
      description: description || '',
      assignedTo: assignedTo || null,
      status: status || 'PENDING',
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  res.status(201).json(task);
});

// Get all tasks with filtering
export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, status, assignedTo } = req.query;

  const where: any = {};
  if (projectId) where.projectId = parseInt(projectId as string);
  if (status) where.status = status;
  if (assignedTo) where.assignedTo = parseInt(assignedTo as string);

  const tasks = await prisma.task.findMany({ where });
  res.json(tasks);
});

// Get task by ID
export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const task = await prisma.task.findUnique({
    where: { id: parseInt(id) },
  });

  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  res.json(task);
});

// Get tasks by project
export const getTasksByProject = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const tasks = await prisma.task.findMany({
    where: { projectId: parseInt(projectId) },
  });

  res.json(tasks);
});

// Update task
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, assignedTo, status, priority, dueDate } = req.body;

  const task = await prisma.task.update({
    where: { id: parseInt(id) },
    data: {
      ...(name && { name }),
      ...(description && { description }),
      ...(assignedTo !== undefined && { assignedTo }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
    },
  });

  res.json(task);
});

// Delete task
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.task.delete({
    where: { id: parseInt(id) },
  });

  res.status(204).send();
});

// Mark task as complete
export const completeTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const task = await prisma.task.update({
    where: { id: parseInt(id) },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  res.json(task);
});
