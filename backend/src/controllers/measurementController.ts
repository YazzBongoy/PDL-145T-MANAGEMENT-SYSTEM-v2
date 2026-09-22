import { Request, Response } from 'express';
import { MeasurementService } from '../services/measurementService.js';
import { asyncHandler } from '../middleware/index.js';
import { MeasurementCreateSchema, MeasurementUpdateSchema } from '../schemas/index.js';
import { AuthenticatedRequest } from '../types/express.js';

const measurementService = new MeasurementService();

// Create a new measurement
export const createMeasurement = asyncHandler(async (req: Request, res: Response) => {
  const taskId = parseInt(req.params.taskId);
  const validatedData = await MeasurementCreateSchema.parseAsync(req.body);
  const measurement = await measurementService.createMeasurement(taskId, validatedData);
  res.status(201).json(measurement);
});

// Get measurements by task
export const getMeasurementsByTask = asyncHandler(async (req: Request, res: Response) => {
  const taskId = parseInt(req.params.taskId);
  const measurements = await measurementService.getMeasurementsByTask(taskId);
  res.json(measurements);
});

// Get measurement by ID
export const getMeasurementById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const measurement = await measurementService.getMeasurementById(id);
  res.json(measurement);
});

// Update a measurement
export const updateMeasurement = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const validatedData = await MeasurementUpdateSchema.parseAsync(req.body);
  const measurement = await measurementService.updateMeasurement(id, validatedData);
  res.json(measurement);
});

// Delete a measurement
export const deleteMeasurement = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await measurementService.deleteMeasurement(id);
  res.status(204).send();
});

// Get measurements by site
export const getMeasurementsBySite = asyncHandler(async (req: Request, res: Response) => {
  const { siteId } = req.params;
  const measurements = await measurementService.getMeasurementsBySite(siteId);
  res.json(measurements);
});

// Get measurements by type
export const getMeasurementsByType = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.params;
  const measurements = await measurementService.getMeasurementsByType(type);
  res.json(measurements);
});

// Get measurements with pagination
export const getMeasurementsPaginated = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, sortBy, sortOrder } = req.query;
  const pagination = {
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 10,
    sortBy: (sortBy as string) || 'Date',
    sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
  };
  const result = await measurementService.getMeasurementsPaginated(
    pagination.page,
    pagination.limit,
    pagination.sortBy,
    pagination.sortOrder
  );
  res.json(result);
});
