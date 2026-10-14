import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticateJWT, requireAdminOrSupervisor } from '../middleware/index.js';

const router = Router();

// Create Project
router.post('/', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const { Name, StartDate, EndDate, TotalBudget } = req.body;
  if (!Name || !StartDate || !TotalBudget) {
    res.status(400).json({ error: 'Name, StartDate, and TotalBudget are required.' });
    return;
  }
  const project = await prisma.project.create({
    data: {
      Name,
      StartDate: new Date(StartDate),
      EndDate: EndDate ? new Date(EndDate) : null,
      TotalBudget: Number(TotalBudget),
    },
  });
  res.status(201).json(project);
});

// List Projects
router.get('/', authenticateJWT, async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({ orderBy: { CreatedAt: 'desc' }, skip, take: limit }),
    prisma.project.count(),
  ]);
  res.json({ data: projects, total, page, limit, totalPages: Math.ceil(total / limit) });
});

// Get Project Details
router.get('/:id', authenticateJWT, async (req, res) => {
  const id = Number(req.params.id);
  const project = await prisma.project.findUnique({ where: { ProjectID: id } });
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json(project);
});

// Update Project
router.put('/:id', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const id = Number(req.params.id);
  const { Name, StartDate, EndDate, TotalBudget } = req.body;
  const project = await prisma.project.findUnique({ where: { ProjectID: id } });
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  const updated = await prisma.project.update({
    where: { ProjectID: id },
    data: {
      Name: Name ?? project.Name,
      StartDate: StartDate ? new Date(StartDate) : project.StartDate,
      EndDate: EndDate ? new Date(EndDate) : project.EndDate,
      TotalBudget: TotalBudget !== undefined ? Number(TotalBudget) : project.TotalBudget,
    },
  });
  res.json(updated);
});

// Delete Project
router.delete('/:id', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const id = Number(req.params.id);
  const project = await prisma.project.findUnique({ where: { ProjectID: id } });
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  await prisma.project.delete({ where: { ProjectID: id } });
  res.json({ success: true });
});

export default router;
