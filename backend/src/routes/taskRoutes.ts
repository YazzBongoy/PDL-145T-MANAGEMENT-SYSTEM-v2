import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticateJWT, requireAdminOrSupervisor } from '../middleware/index.js';

const router = Router();

// Create Task
router.post('/', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const { ProjectID, Description, Duration, AssignedTo, CompletionStatus } = req.body;
  if (!ProjectID || !Description) {
    res.status(400).json({ error: 'ProjectID and Description are required.' });
    return;
  }
  const task = await prisma.task.create({
    data: {
      ProjectID: Number(ProjectID),
      Description,
      Duration: Duration ? Number(Duration) : null,
      AssignedTo: AssignedTo || null,
      CompletionStatus: CompletionStatus || 'NotStarted',
    },
  });
  res.status(201).json(task);
});

// List Tasks by Project
router.get('/by-project/:projectId', authenticateJWT, async (req, res) => {
  const projectId = Number(req.params.projectId);
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({ where: { ProjectID: projectId }, orderBy: { CreatedAt: 'desc' }, skip, take: limit }),
    prisma.task.count({ where: { ProjectID: projectId } }),
  ]);
  res.json({ data: tasks, total, page, limit, totalPages: Math.ceil(total / limit) });
});

// Get Task Details
router.get('/:id', authenticateJWT, async (req, res) => {
  const id = Number(req.params.id);
  const task = await prisma.task.findUnique({ where: { TaskID: id } });
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(task);
});

// Update Task
router.put('/:id', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const id = Number(req.params.id);
  const { Description, Duration, AssignedTo, CompletionStatus } = req.body;
  const task = await prisma.task.findUnique({ where: { TaskID: id } });
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  const updated = await prisma.task.update({
    where: { TaskID: id },
    data: {
      Description: Description ?? task.Description,
      Duration: Duration !== undefined ? Number(Duration) : task.Duration,
      AssignedTo: AssignedTo ?? task.AssignedTo,
      CompletionStatus: CompletionStatus ?? task.CompletionStatus,
    },
  });
  res.json(updated);
});

// Delete Task
router.delete('/:id', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const id = Number(req.params.id);
  const task = await prisma.task.findUnique({ where: { TaskID: id } });
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  await prisma.task.delete({ where: { TaskID: id } });
  res.json({ success: true });
});

export default router;
