import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all tasks with optional filtering
export async function getTasks(req: Request, res: Response) {
  try {
    const { projectId, parentTaskId, level, siteId, completionStatus } = req.query;
    
    const where: any = {};
    if (projectId) where.ProjectID = parseInt(projectId as string);
    if (parentTaskId) where.ParentTaskID = parseInt(parentTaskId as string);
    if (parentTaskId === 'null') where.ParentTaskID = null;
    if (level) where.Level = parseInt(level as string);
    if (siteId) where.SiteID = siteId as string;
    if (completionStatus) where.CompletionStatus = completionStatus as string;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        Project: {
          select: {
            Name: true,
            ProgramID: true
          }
        },
        _count: {
          select: {
            SubTasks: true,
            TaskResources: true,
            Expenses: true
          }
        },
        SubTasks: {
          select: {
            TaskID: true,
            Name: true,
            CompletionStatus: true,
            progressPercentage: true,
            Level: true
          }
        }
      },
      orderBy: [
        { SortOrder: 'asc' },
        { CreatedAt: 'desc' }
      ]
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

// Get task by ID with full hierarchy
export async function getTaskById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const task = await prisma.task.findUnique({
      where: { TaskID: parseInt(id) },
      include: {
        Project: true,
        Sprint: true,
        ParentTask: {
          select: {
            TaskID: true,
            Name: true,
            Level: true
          }
        },
        SubTasks: {
          include: {
            _count: {
              select: {
                SubTasks: true,
                TaskResources: true
              }
            },
            SubTasks: {
              select: {
                TaskID: true,
                Name: true,
                CompletionStatus: true,
                progressPercentage: true,
                Level: true,
                _count: {
                  select: {
                    SubTasks: true
                  }
                }
              }
            }
          }
        },
        TaskResources: {
          include: {
            Resource: true
          }
        },
        Expenses: true,
        Validations: true,
        Measurements: true
      }
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
}

// Create task with hierarchy validation
export async function createTask(req: Request, res: Response) {
  try {
    const {
      projectId,
      parentTaskId,
      name,
      description,
      duration,
      assignedTo,
      estimatedCost,
      sprintId
    } = req.body;

    // Validate hierarchy level (max 3 levels)
    let level = 1;
    if (parentTaskId) {
      const parentTask = await prisma.task.findUnique({
        where: { TaskID: parseInt(parentTaskId) }
      });
      
      if (!parentTask) {
        res.status(400).json({ error: 'Parent task not found' });
        return;
      }
      
      if (parentTask.Level >= 3) {
        res.status(400).json({ error: 'Maximum hierarchy level reached (3 levels)' });
        return;
      }
      
      level = parentTask.Level + 1;
    }

    const task = await prisma.task.create({
      data: {
        ProjectID: parseInt(projectId),
        ParentTaskID: parentTaskId ? parseInt(parentTaskId) : null,
        Name: name,
        Description: description,
        Duration: duration ? parseInt(duration) : null,
        AssignedTo: assignedTo,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
        SprintID: sprintId ? parseInt(sprintId) : null,
        Level: level
      },
      include: {
        Project: {
          select: {
            Name: true
          }
        },
        ParentTask: {
          select: {
            TaskID: true,
            Name: true
          }
        }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
}

// Update task
export async function updateTask(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      duration,
      assignedTo,
      completionStatus,
      actualCost,
      estimatedCost,
      progressPercentage,
      statusReason,
      sprintId
    } = req.body;

    const task = await prisma.task.update({
      where: { TaskID: parseInt(id) },
      data: {
        Name: name,
        Description: description,
        Duration: duration !== undefined ? parseInt(duration) : undefined,
        AssignedTo: assignedTo,
        CompletionStatus: completionStatus,
        actualCost: actualCost !== undefined ? parseFloat(actualCost) : undefined,
        estimatedCost: estimatedCost !== undefined ? parseFloat(estimatedCost) : undefined,
        progressPercentage: progressPercentage !== undefined ? parseInt(progressPercentage) : undefined,
        statusReason: statusReason,
        SprintID: sprintId !== undefined ? (sprintId ? parseInt(sprintId) : null) : undefined
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
}

// Delete task with cascade check
export async function deleteTask(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Check if task has subtasks
    const task = await prisma.task.findUnique({
      where: { TaskID: parseInt(id) },
      include: {
        _count: {
          select: {
            SubTasks: true
          }
        }
      }
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    if (task._count.SubTasks > 0) {
      res.status(400).json({ 
        error: 'Cannot delete task with subtasks. Delete subtasks first or reassign them.' 
      });
      return;
    }

    await prisma.task.delete({
      where: { TaskID: parseInt(id) }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
}

// Get task hierarchy tree
export async function getTaskHierarchy(req: Request, res: Response) {
  try {
    const { projectId } = req.params;

    // Get all tasks for project with their hierarchy
    const tasks = await prisma.task.findMany({
      where: { 
        ProjectID: parseInt(projectId),
        ParentTaskID: null // Start from root tasks
      },
      include: {
        SubTasks: {
          include: {
            SubTasks: {
              select: {
                TaskID: true,
                Name: true,
                CompletionStatus: true,
                progressPercentage: true,
                Level: true,
                _count: {
                  select: {
                    TaskResources: true,
                    Expenses: true
                  }
                }
              }
            },
            _count: {
              select: {
                TaskResources: true,
                Expenses: true
              }
            }
          }
        },
        _count: {
          select: {
            TaskResources: true,
            Expenses: true
          }
        }
      },
      orderBy: {
        CreatedAt: 'asc'
      }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching task hierarchy:', error);
    res.status(500).json({ error: 'Failed to fetch task hierarchy' });
  }
}

// Get subtasks for a task
export async function getSubtasks(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const subtasks = await prisma.task.findMany({
      where: { ParentTaskID: parseInt(id) },
      include: {
        _count: {
          select: {
            SubTasks: true,
            TaskResources: true,
            Expenses: true
          }
        }
      },
      orderBy: {
        CreatedAt: 'asc'
      }
    });

    res.json(subtasks);
  } catch (error) {
    console.error('Error fetching subtasks:', error);
    res.status(500).json({ error: 'Failed to fetch subtasks' });
  }
}

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

  const parent = await prisma.task.findUnique({
    where: { TaskID: parentId },
    select: { ParentTaskID: true },
  });
  if (parent?.ParentTaskID) await recalcParent(parent.ParentTaskID);
}

// Update leaf task progress and propagate weighted average to parents
export async function updateLeafProgress(req: Request, res: Response) {
  try {
    const taskId = parseInt(req.params.id);
    const { progressPercentage, CompletionStatus } = req.body;

    const task = await prisma.task.findUnique({ where: { TaskID: taskId } });
    if (!task) { res.status(404).json({ error: 'Task not found' }); return; }

    const progress = Number(progressPercentage ?? task.progressPercentage);
    const status: string = CompletionStatus ?? (progress === 0 ? 'NotStarted' : progress >= 100 ? 'Completed' : 'InProgress');

    const updated = await prisma.task.update({
      where: { TaskID: taskId },
      data: { progressPercentage: progress, CompletionStatus: status as any },
    });

    if (task.ParentTaskID) await recalcParent(task.ParentTaskID);

    // Recalculer le TEP global du site
    let siteTEP: number | null = null;
    if (task.SiteID) {
      siteTEP = await recalcSiteTEP(task.SiteID);
    }

    const ancestors: any[] = [];
    let cur: any = updated;
    while (cur?.ParentTaskID) {
      const parent = await prisma.task.findUnique({ where: { TaskID: cur.ParentTaskID } });
      if (parent) ancestors.push(parent);
      cur = parent;
    }

    res.json({ updated, ancestors, siteTEP });
  } catch (error) {
    console.error('Error updating leaf progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
}
