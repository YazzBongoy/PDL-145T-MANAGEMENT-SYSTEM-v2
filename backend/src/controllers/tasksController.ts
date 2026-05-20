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

// ─── Recalcul TEP global du site (pondéré 3 niveaux) ─────────────────────────
// Formule identique au fichier TMUPDATED :
//   TEP_site = Σ(TEP_L1 × Weight_L1) / 100
//   TEP_L1   = Σ(TEP_L2 × Weight_L2) / Σ(Weight_L2)
//   TEP_L2   = moyenne simple des tâches feuilles L3 (Weight=1 chacune)
async function recalcSiteTEP(siteId: string): Promise<number> {
  // Récupérer toute la hiérarchie du site en une seule requête
  const allTasks = await prisma.task.findMany({
    where: { SiteID: siteId },
    select: { TaskID: true, ParentTaskID: true, Level: true, Weight: true, progressPercentage: true },
  });
  if (allTasks.length === 0) return 0;

  const byId = new Map(allTasks.map(t => [t.TaskID, t]));

  // L3 : tâches feuilles (pas d'enfants) — progressPercentage mis à jour directement
  // L2 : moyenne simple des L3 enfants
  // L1 : moyenne pondérée des L2 enfants (Weight = poids sous-rubrique)
  // Site : moyenne pondérée des L1 (Weight = poids rubrique contrat, total = 100)

  const l1tasks = allTasks.filter(t => t.Level === 1 && t.ParentTaskID === null);
  let tepSite = 0;
  let totalW1 = 0;

  for (const l1 of l1tasks) {
    const l2tasks = allTasks.filter(t => t.ParentTaskID === l1.TaskID);
    let tepL1 = 0;
    let totalW2 = 0;

    for (const l2 of l2tasks) {
      const l3tasks = allTasks.filter(t => t.ParentTaskID === l2.TaskID);
      let tepL2 = 0;
      if (l3tasks.length > 0) {
        tepL2 = l3tasks.reduce((s, t) => s + t.progressPercentage, 0) / l3tasks.length;
      } else {
        tepL2 = l2.progressPercentage;
      }
      const w2 = Number(l2.Weight ?? 0);
      tepL1 += tepL2 * w2;
      totalW2 += w2;
    }

    if (totalW2 > 0) tepL1 = tepL1 / totalW2;
    else tepL1 = l1.progressPercentage;

    const w1 = Number(l1.Weight ?? 0);
    tepSite += tepL1 * w1;
    totalW1 += w1;
  }

  if (totalW1 > 0) tepSite = tepSite / totalW1;

  const tep = Math.round(tepSite);
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
