import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticateJWT, requireAdminOrSupervisor } from '../middleware/index.js';

const router = Router();

// List resources for a project
router.get('/project/:projectId', authenticateJWT, async (req, res) => {
  const projectId = Number(req.params.projectId);
  const resources = await prisma.projectResource.findMany({
    where: { ProjectID: projectId },
    include: { Resource: true },
  });
  res.json(resources);
});

// Assign resource to project
router.post('/project/:projectId', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const projectId = Number(req.params.projectId);
  const { ResourceID } = req.body;
  if (!ResourceID) {
    res.status(400).json({ error: 'ResourceID is required.' });
    return;
  }
  const project = await prisma.project.findUnique({ where: { ProjectID: projectId } });
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  const resource = await prisma.resource.findUnique({ where: { ResourceID: Number(ResourceID) } });
  if (!resource) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }
  const existing = await prisma.projectResource.findUnique({
    where: { ProjectID_ResourceID: { ProjectID: projectId, ResourceID: Number(ResourceID) } },
  });
  if (existing) {
    res.status(409).json({ error: 'Resource already assigned to this project' });
    return;
  }
  const assignment = await prisma.projectResource.create({
    data: { ProjectID: projectId, ResourceID: Number(ResourceID) },
    include: { Resource: true },
  });
  res.status(201).json(assignment);
});

// Unassign resource from project
router.delete('/project/:projectId/resource/:resourceId', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const projectId = Number(req.params.projectId);
  const resourceId = Number(req.params.resourceId);
  const existing = await prisma.projectResource.findUnique({
    where: { ProjectID_ResourceID: { ProjectID: projectId, ResourceID: resourceId } },
  });
  if (!existing) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }
  await prisma.projectResource.delete({
    where: { ProjectID_ResourceID: { ProjectID: projectId, ResourceID: resourceId } },
  });
  res.json({ success: true });
});

// List resources for a task
router.get('/task/:taskId', authenticateJWT, async (req, res) => {
  const taskId = Number(req.params.taskId);
  const resources = await prisma.taskResource.findMany({
    where: { TaskID: taskId },
    include: { Resource: true },
  });
  res.json(resources);
});

// Assign resource to task
router.post('/task/:taskId', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const taskId = Number(req.params.taskId);
  const { ResourceID } = req.body;
  if (!ResourceID) {
    res.status(400).json({ error: 'ResourceID is required.' });
    return;
  }
  const task = await prisma.task.findUnique({ where: { TaskID: taskId } });
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  const resource = await prisma.resource.findUnique({ where: { ResourceID: Number(ResourceID) } });
  if (!resource) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }
  const existing = await prisma.taskResource.findUnique({
    where: { TaskID_ResourceID: { TaskID: taskId, ResourceID: Number(ResourceID) } },
  });
  if (existing) {
    res.status(409).json({ error: 'Resource already assigned to this task' });
    return;
  }
  const assignment = await prisma.taskResource.create({
    data: { TaskID: taskId, ResourceID: Number(ResourceID) },
    include: { Resource: true },
  });
  res.status(201).json(assignment);
});

// Unassign resource from task
router.delete('/task/:taskId/resource/:resourceId', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const taskId = Number(req.params.taskId);
  const resourceId = Number(req.params.resourceId);
  const existing = await prisma.taskResource.findUnique({
    where: { TaskID_ResourceID: { TaskID: taskId, ResourceID: resourceId } },
  });
  if (!existing) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }
  await prisma.taskResource.delete({
    where: { TaskID_ResourceID: { TaskID: taskId, ResourceID: resourceId } },
  });
  res.json({ success: true });
});

export default router;
