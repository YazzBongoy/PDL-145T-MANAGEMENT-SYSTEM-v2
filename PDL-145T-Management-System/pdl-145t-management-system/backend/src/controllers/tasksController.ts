import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/index.js';

const prisma = new PrismaClient();

// Create a new task
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, description, duration, assignedTo, sprintId } = req.body;

  if (!projectId || !description) {
    res.status(400).json({ error: 'projectId and description are required' });
    return;
  }

  const task = await prisma.task.create({
    data: {
      ProjectID: parseInt(projectId),
      SprintID: sprintId ? parseInt(sprintId) : null,
      Description: description,
      Duration: duration ? parseInt(duration) : null,
      AssignedTo: assignedTo || null,
      CompletionStatus: 'NotStarted',
      progressPercentage: 0,
    },
  });

  res.status(201).json(task);
});

// Get all tasks with filtering
export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, completionStatus, assignedTo } = req.query;

  const where: any = {};
  if (projectId) where.ProjectID = parseInt(projectId as string);
  if (completionStatus) where.CompletionStatus = completionStatus;
  if (assignedTo) where.AssignedTo = assignedTo;

  const tasks = await prisma.task.findMany({ where });
  res.json(tasks);
});

// Get task by ID
export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const task = await prisma.task.findUnique({
    where: { TaskID: parseInt(id) },
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
    where: { ProjectID: parseInt(projectId) },
  });

  res.json(tasks);
});

// Update task
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { description, duration, assignedTo, completionStatus, progressPercentage, actualCost, estimatedCost, statusReason } = req.body;

  const task = await prisma.task.update({
    where: { TaskID: parseInt(id) },
    data: {
      ...(description && { Description: description }),
      ...(duration !== undefined && { Duration: parseInt(duration) }),
      ...(assignedTo !== undefined && { AssignedTo: assignedTo }),
      ...(completionStatus && { CompletionStatus: completionStatus }),
      ...(progressPercentage !== undefined && { progressPercentage: parseInt(progressPercentage) }),
      ...(actualCost !== undefined && { actualCost: actualCost }),
      ...(estimatedCost !== undefined && { estimatedCost: estimatedCost }),
      ...(statusReason && { statusReason: statusReason }),
    },
  });

  res.json(task);
});

// Delete task
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.task.delete({
    where: { TaskID: parseInt(id) },
  });

  res.status(204).send();
});

// Mark task as complete
export const completeTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const task = await prisma.task.update({
    where: { TaskID: parseInt(id) },
    data: {
      CompletionStatus: 'Completed',
      progressPercentage: 100,
    },
  });

  res.json(task);
});
