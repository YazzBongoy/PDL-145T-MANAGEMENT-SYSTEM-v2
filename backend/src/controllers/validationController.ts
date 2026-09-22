import { Request, Response } from 'express';
import { ValidationService } from '../services/validationService.js';
import { asyncHandler } from '../middleware/index.js';
import {
  ValidationCreateSchema,
  ValidationUpdateSchema,
  ValidationParamsSchema,
} from '../schemas/index.js';

const validationService = new ValidationService();

// Create a validation
export const createValidation = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const validatedData = await ValidationCreateSchema.parseAsync(req.body);
  const validation = await validationService.createValidation(parseInt(taskId), validatedData);
  res.status(201).json(validation);
});

// Get validations by task
export const getValidationsByTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const validations = await validationService.getValidationsByTask(parseInt(taskId));
  res.json(validations);
});

// Get validation by ID
export const getValidationById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = await ValidationParamsSchema.parseAsync(req.params);
  const validation = await validationService.getValidationById(id);
  res.json(validation);
});

// Update a validation
export const updateValidation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = await ValidationParamsSchema.parseAsync(req.params);
  const validatedData = await ValidationUpdateSchema.parseAsync(req.body);
  const validation = await validationService.updateValidation(id, validatedData);
  res.json(validation);
});

// Delete a validation
export const deleteValidation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = await ValidationParamsSchema.parseAsync(req.params);
  await validationService.deleteValidation(id);
  res.status(204).send();
});

// Approve a validation
export const approveValidation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = await ValidationParamsSchema.parseAsync(req.params);
  const { approvedBy } = req.body;
  const validation = await validationService.approveValidation(id, approvedBy);
  res.json(validation);
});

// Reject a validation
export const rejectValidation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = await ValidationParamsSchema.parseAsync(req.params);
  const { rejectedBy, reason } = req.body;
  const validation = await validationService.rejectValidation(id, rejectedBy, reason);
  res.json(validation);
});

// Get validations by site
export const getValidationsBySite = asyncHandler(async (req: Request, res: Response) => {
  const { siteId } = req.params;
  const validations = await validationService.getValidationsBySite(siteId);
  res.json(validations);
});

// Get validations with pagination
export const getValidationsPaginated = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, sortBy, sortOrder } = req.query;
  const pagination = {
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 10,
    sortBy: (sortBy as string) || 'Timestamp',
    sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
  };
  const result = await validationService.getValidationsPaginated(
    pagination.page,
    pagination.limit,
    pagination.sortBy,
    pagination.sortOrder
  );
  res.json(result);
});

