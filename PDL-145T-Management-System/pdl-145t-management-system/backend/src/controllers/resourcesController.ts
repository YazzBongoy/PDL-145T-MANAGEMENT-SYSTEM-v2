import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/index.js';

const prisma = new PrismaClient();

// Create a new resource
export const createResource = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, name, type, quantity, unit, location, status, notes } = req.body;

  if (!projectId || !name || !type) {
    res.status(400).json({ error: 'projectId, name, and type are required' });
    return;
  }

  if (quantity < 0) {
    res.status(400).json({ error: 'Quantity cannot be negative' });
    return;
  }

  const resource = await prisma.resource.create({
    data: {
      projectId,
      name,
      type,
      quantity: quantity || 0,
      unit: unit || 'PIECE',
      location: location || '',
      status: status || 'AVAILABLE',
      notes: notes || '',
      allocatedTo: null,
    },
  });

  res.status(201).json(resource);
});

// Get all resources with filtering
export const getResources = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, status, type } = req.query;

  const where: any = {};
  if (projectId) where.projectId = parseInt(projectId as string);
  if (status) where.status = status;
  if (type) where.type = type;

  const resources = await prisma.resource.findMany({ where });
  res.json(resources);
});

// Get resource by ID
export const getResourceById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const resource = await prisma.resource.findUnique({
    where: { id: parseInt(id) },
  });

  if (!resource) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }

  res.json(resource);
});

// Get resources by project
export const getResourcesByProject = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const resources = await prisma.resource.findMany({
    where: { projectId: parseInt(projectId) },
  });

  res.json(resources);
});

// Get resources by type
export const getResourcesByType = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.params;
  const resources = await prisma.resource.findMany({
    where: { type },
  });

  res.json(resources);
});

// Update resource
export const updateResource = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, quantity, unit, location, status, allocatedTo, notes } = req.body;

  if (quantity !== undefined && quantity < 0) {
    res.status(400).json({ error: 'Quantity cannot be negative' });
    return;
  }

  const resource = await prisma.resource.update({
    where: { id: parseInt(id) },
    data: {
      ...(name && { name }),
      ...(quantity !== undefined && { quantity }),
      ...(unit && { unit }),
      ...(location && { location }),
      ...(status && { status }),
      ...(allocatedTo !== undefined && { allocatedTo }),
      ...(notes && { notes }),
    },
  });

  res.json(resource);
});

// Delete resource
export const deleteResource = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.resource.delete({
    where: { id: parseInt(id) },
  });

  res.status(204).send();
});

// Allocate resource to user
export const allocateResource = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { allocatedTo } = req.body;

  const resource = await prisma.resource.update({
    where: { id: parseInt(id) },
    data: {
      allocatedTo: allocatedTo || null,
      status: allocatedTo ? 'ALLOCATED' : 'AVAILABLE',
    },
  });

  res.json(resource);
});

// Get available resources count
export const getAvailableResourcesCount = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;

  const resources = await prisma.resource.findMany({
    where: {
      projectId: parseInt(projectId),
      status: 'AVAILABLE',
    },
  });

  const count = resources.reduce((sum, r) => sum + r.quantity, 0);
  res.json({ projectId: parseInt(projectId), availableCount: count, resources });
});

// Get resource allocation summary
export const getResourceAllocationSummary = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;

  const resources = await prisma.resource.findMany({
    where: { projectId: parseInt(projectId) },
  });

  const summary = {
    projectId: parseInt(projectId),
    totalResources: resources.length,
    totalQuantity: resources.reduce((sum, r) => sum + r.quantity, 0),
    allocated: resources
      .filter((r) => r.status === 'ALLOCATED')
      .reduce((sum, r) => sum + r.quantity, 0),
    available: resources
      .filter((r) => r.status === 'AVAILABLE')
      .reduce((sum, r) => sum + r.quantity, 0),
    byType: Object.groupBy(resources, (r) => r.type),
  };

  res.json(summary);
});
