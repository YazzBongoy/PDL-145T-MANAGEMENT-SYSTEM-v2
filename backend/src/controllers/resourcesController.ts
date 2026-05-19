import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/index.js';
import { normalizeBody } from '../utils/normalizeBody.js';

const prisma = new PrismaClient();

// Create a new resource (Device)
export const createResource = asyncHandler(async (req: Request, res: Response) => {
  const { name, type, quantity, description, status, location, serialnumber, purchasedate, cost } = normalizeBody(req.body);
  const serialNumber = serialnumber; const purchaseDate = purchasedate;

  if (!name || !type) {
    res.status(400).json({ error: 'name and type are required' });
    return;
  }

  if (quantity !== undefined && quantity < 0) {
    res.status(400).json({ error: 'Quantity cannot be negative' });
    return;
  }

  const resource = await prisma.resource.create({
    data: {
      Name: name,
      Type: type,
      Quantity: quantity ?? 1,
      Description: description,
      Status: status || 'active',
      Location: location,
      SerialNumber: serialNumber,
      PurchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      Cost: cost ? parseFloat(cost) : null,
    },
  });

  res.status(201).json(resource);
});

// Get all resources (Devices) with filtering
export const getResources = asyncHandler(async (req: Request, res: Response) => {
  const { type, status, location, search } = req.query;

  const where: any = {};
  if (type) where.Type = type;
  if (status) where.Status = status;
  if (location) where.Location = { contains: location, mode: 'insensitive' };
  if (search) {
    where.OR = [
      { Name: { contains: search, mode: 'insensitive' } },
      { Description: { contains: search, mode: 'insensitive' } },
      { SerialNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  const resources = await prisma.resource.findMany({ 
    where,
    orderBy: { CreatedAt: 'desc' },
  });
  res.json(resources);
});

// Get resource by ID
export const getResourceById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const resource = await prisma.resource.findUnique({
    where: { ResourceID: parseInt(id) },
  });

  if (!resource) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }

  res.json(resource);
});

// Get resources by type
export const getResourcesByType = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.params;
  const resources = await prisma.resource.findMany({
    where: { Type: type },
  });

  res.json(resources);
});

// Update resource (Device)
export const updateResource = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, type, quantity, description, status, location, serialnumber, purchasedate, lastmaintenance, nextmaintenance, cost } = normalizeBody(req.body);
  const serialNumber = serialnumber; const purchaseDate = purchasedate;
  const lastMaintenance = lastmaintenance; const nextMaintenance = nextmaintenance;

  if (quantity !== undefined && quantity < 0) {
    res.status(400).json({ error: 'Quantity cannot be negative' });
    return;
  }

  const data: any = {};
  if (name !== undefined) data.Name = name;
  if (type !== undefined) data.Type = type;
  if (quantity !== undefined) data.Quantity = quantity;
  if (description !== undefined) data.Description = description;
  if (status !== undefined) data.Status = status;
  if (location !== undefined) data.Location = location;
  if (serialNumber !== undefined) data.SerialNumber = serialNumber;
  if (purchaseDate !== undefined) data.PurchaseDate = purchaseDate ? new Date(purchaseDate) : null;
  if (lastMaintenance !== undefined) data.LastMaintenance = lastMaintenance ? new Date(lastMaintenance) : null;
  if (nextMaintenance !== undefined) data.NextMaintenance = nextMaintenance ? new Date(nextMaintenance) : null;
  if (cost !== undefined) data.Cost = cost ? parseFloat(cost) : null;

  const resource = await prisma.resource.update({
    where: { ResourceID: parseInt(id) },
    data,
  });

  res.json(resource);
});

// Delete resource
export const deleteResource = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.resource.delete({
    where: { ResourceID: parseInt(id) },
  });

  res.status(204).send();
});
