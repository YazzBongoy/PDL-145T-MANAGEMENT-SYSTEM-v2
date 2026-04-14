import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/index.js';
const prisma = new PrismaClient();
// Create a new resource
export const createResource = asyncHandler(async (req, res) => {
    const { type, quantity } = req.body;
    if (!type || quantity === undefined) {
        res.status(400).json({ error: 'type and quantity are required' });
        return;
    }
    if (quantity < 0) {
        res.status(400).json({ error: 'Quantity cannot be negative' });
        return;
    }
    const resource = await prisma.resource.create({
        data: {
            Type: type,
            Quantity: quantity,
        },
    });
    res.status(201).json(resource);
});
// Get all resources with filtering
export const getResources = asyncHandler(async (req, res) => {
    const { type } = req.query;
    const where = {};
    if (type)
        where.Type = type;
    const resources = await prisma.resource.findMany({ where });
    res.json(resources);
});
// Get resource by ID
export const getResourceById = asyncHandler(async (req, res) => {
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
export const getResourcesByType = asyncHandler(async (req, res) => {
    const { type } = req.params;
    const resources = await prisma.resource.findMany({
        where: { Type: type },
    });
    res.json(resources);
});
// Update resource
export const updateResource = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { type, quantity } = req.body;
    if (quantity !== undefined && quantity < 0) {
        res.status(400).json({ error: 'Quantity cannot be negative' });
        return;
    }
    const resource = await prisma.resource.update({
        where: { ResourceID: parseInt(id) },
        data: {
            ...(type && { Type: type }),
            ...(quantity !== undefined && { Quantity: quantity }),
        },
    });
    res.json(resource);
});
// Delete resource
export const deleteResource = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.resource.delete({
        where: { ResourceID: parseInt(id) },
    });
    res.status(204).send();
});
