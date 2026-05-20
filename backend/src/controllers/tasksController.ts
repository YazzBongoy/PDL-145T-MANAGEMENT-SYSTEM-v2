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
      Name: description.substring(0, 100),
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
  const { projectId, completionStatus, assignedTo, siteId } = req.query;

  const where: any = {};
  if (projectId) where.ProjectID = parseInt(projectId as string);
  if (completionStatus) where.CompletionStatus = completionStatus;
  if (assignedTo) where.AssignedTo = assignedTo;
  if (siteId) where.SiteID = siteId as string;

  const tasks = await prisma.task.findMany({
    where,
    include: { Site: { select: { SiteID: true, Name: true, Province: true, Type: true } } },
    orderBy: { SortOrder: 'asc' }
  });
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
    include: { Site: { select: { SiteID: true, Name: true, Province: true, Type: true } } },
    orderBy: { SortOrder: 'asc' }
  });

  res.json(tasks);
});

// Update task
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body;

  // Accept both PascalCase (frontend) and camelCase keys
  const completionStatus = body.CompletionStatus ?? body.completionStatus;
  const progress = body.progressPercentage ?? body.ProgressPercentage;
  const description = body.Description ?? body.description;
  const duration = body.Duration ?? body.duration;
  const assignedTo = body.AssignedTo ?? body.assignedTo;
  const actualCost = body.actualCost ?? body.ActualCost;
  const estimatedCost = body.estimatedCost ?? body.EstimatedCost;
  const statusReason = body.statusReason ?? body.StatusReason;
  const siteId = body.SiteID ?? body.siteId;

  const task = await prisma.task.update({
    where: { TaskID: parseInt(id) },
    data: {
      ...(description !== undefined && description !== null && { Description: description }),
      ...(duration !== undefined && { Duration: parseInt(duration) }),
      ...(assignedTo !== undefined && { AssignedTo: assignedTo }),
      ...(completionStatus && { CompletionStatus: completionStatus }),
      ...(progress !== undefined && { progressPercentage: Number(progress) }),
      ...(actualCost !== undefined && { actualCost: actualCost }),
      ...(estimatedCost !== undefined && { estimatedCost: estimatedCost }),
      ...(statusReason && { statusReason: statusReason }),
      ...(siteId !== undefined && { SiteID: siteId || null }),
    },
    include: { Site: { select: { SiteID: true, Name: true, Province: true, Type: true } } }
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

// ─── Recalcul TEP global du site ────────────────────────────────────────────
// TEP site = moyenne simple des progressPercentage de toutes ses tâches feuilles
// (pondération égale = 1 par tâche, identique au fichier TMUPDATED)
async function recalcSiteTEP(siteId: string): Promise<number> {
  const leafTasks = await prisma.task.findMany({
    where: { SiteID: siteId, ParentTaskID: null },
    select: { progressPercentage: true },
  });
  if (leafTasks.length === 0) return 0;
  const tep = Math.round(
    leafTasks.reduce((s, t) => s + t.progressPercentage, 0) / leafTasks.length
  );
  await prisma.site.update({
    where: { SiteID: siteId },
    data: { tepGlobal: tep },
  });
  return tep;
}

// ─── Recalcul pondéré des parents ───────────────────────────────────────────

async function recalcParent(parentId: number): Promise<void> {
  const children = await prisma.task.findMany({
    where: { ParentTaskID: parentId },
    select: { progressPercentage: true, Weight: true },
  });

  if (children.length === 0) return;

  const totalWeight = children.reduce((s, c) => s + Number(c.Weight || 0), 0);
  let weighted = 0;
  if (totalWeight > 0) {
    weighted = children.reduce((s, c) => s + (c.progressPercentage * Number(c.Weight || 0)), 0) / totalWeight;
  } else {
    weighted = children.reduce((s, c) => s + c.progressPercentage, 0) / children.length;
  }

  const progress = Math.round(weighted);
  const status = progress === 0 ? 'NotStarted' : progress >= 100 ? 'Completed' : 'InProgress';

  await prisma.task.update({
    where: { TaskID: parentId },
    data: { progressPercentage: progress, CompletionStatus: status },
  });

  // Remonter récursivement au grand-parent
  const parent = await prisma.task.findUnique({
    where: { TaskID: parentId },
    select: { ParentTaskID: true },
  });
  if (parent?.ParentTaskID) {
    await recalcParent(parent.ParentTaskID);
  }
}

// Update progress of a leaf task (Level 3) and propagate up
export const updateLeafProgress = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const taskId = parseInt(id);
  const { progressPercentage, CompletionStatus } = req.body;

  const task = await prisma.task.findUnique({ where: { TaskID: taskId } });
  if (!task) { res.status(404).json({ error: 'Task not found' }); return; }

  const progress = Number(progressPercentage ?? task.progressPercentage);
  const status = CompletionStatus ?? (progress === 0 ? 'NotStarted' : progress >= 100 ? 'Completed' : 'InProgress');

  const updated = await prisma.task.update({
    where: { TaskID: taskId },
    data: { progressPercentage: progress, CompletionStatus: status },
  });

  // Recalculer les parents si cette tâche a un parent
  if (task.ParentTaskID) {
    await recalcParent(task.ParentTaskID);
  }

  // Recalculer le TEP global du site (moyenne de toutes les tâches feuilles)
  let siteTEP: number | null = null;
  if (task.SiteID) {
    siteTEP = await recalcSiteTEP(task.SiteID);
  }

  // Retourner la tâche mise à jour + tous les ancêtres recalculés + TEP site
  const allAncestors: any[] = [];
  let cur: any = updated;
  while (cur?.ParentTaskID) {
    const parent = await prisma.task.findUnique({ where: { TaskID: cur.ParentTaskID } });
    if (parent) allAncestors.push(parent);
    cur = parent;
  }

  res.json({ updated, ancestors: allAncestors, siteTEP });
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
