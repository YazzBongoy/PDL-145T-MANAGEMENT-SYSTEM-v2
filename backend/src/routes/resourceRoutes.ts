import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticateJWT, requireAdminOrSupervisor } from '../middleware/index.js';

const router = Router();

// Create Resource
router.post('/', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const { Type, Quantity } = req.body;
  if (!Type || Quantity === undefined) {
    res.status(400).json({ error: 'Type and Quantity are required.' });
    return;
  }
  const resource = await prisma.resource.create({
    data: {
      Type,
      Quantity: Number(Quantity),
    },
  });
  res.status(201).json(resource);
});

// List Resources
router.get('/', authenticateJWT, async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [resources, total] = await Promise.all([
    prisma.resource.findMany({ orderBy: { CreatedAt: 'desc' }, skip, take: limit }),
    prisma.resource.count(),
  ]);
  res.json({ data: resources, total, page, limit, totalPages: Math.ceil(total / limit) });
});

// Update Resource
router.put('/:id', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const id = Number(req.params.id);
  const { Type, Quantity } = req.body;
  const resource = await prisma.resource.findUnique({ where: { ResourceID: id } });
  if (!resource) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }
  const updated = await prisma.resource.update({
    where: { ResourceID: id },
    data: {
      Type: Type ?? resource.Type,
      Quantity: Quantity !== undefined ? Number(Quantity) : resource.Quantity,
    },
  });
  res.json(updated);
});

// Delete Resource
router.delete('/:id', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const id = Number(req.params.id);
  const resource = await prisma.resource.findUnique({ where: { ResourceID: id } });
  if (!resource) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }
  await prisma.resource.delete({ where: { ResourceID: id } });
  res.json({ success: true });
});

export default router;
