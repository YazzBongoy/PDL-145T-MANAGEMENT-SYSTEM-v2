import { ValidationService } from '../services/validationService.js';
import { asyncHandler } from '../middleware/index.js';
import { ValidationCreateSchema, ValidationUpdateSchema, ValidationParamsSchema, } from '../schemas/index.js';
const validationService = new ValidationService();
// Create a validation
export const createValidation = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const validatedData = await ValidationCreateSchema.parseAsync(req.body);
    const validation = await validationService.createValidation(parseInt(taskId), validatedData);
    res.status(201).json(validation);
});
// Get validations by task
export const getValidationsByTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const validations = await validationService.getValidationsByTask(parseInt(taskId));
    res.json(validations);
});
// Get validation by ID
export const getValidationById = asyncHandler(async (req, res) => {
    const { id } = await ValidationParamsSchema.parseAsync(req.params);
    const validation = await validationService.getValidationById(id);
    res.json(validation);
});
// Update a validation
export const updateValidation = asyncHandler(async (req, res) => {
    const { id } = await ValidationParamsSchema.parseAsync(req.params);
    const validatedData = await ValidationUpdateSchema.parseAsync(req.body);
    const validation = await validationService.updateValidation(id, validatedData);
    res.json(validation);
});
// Delete a validation
export const deleteValidation = asyncHandler(async (req, res) => {
    const { id } = await ValidationParamsSchema.parseAsync(req.params);
    await validationService.deleteValidation(id);
    res.status(204).send();
});
// Approve a validation
export const approveValidation = asyncHandler(async (req, res) => {
    const { id } = await ValidationParamsSchema.parseAsync(req.params);
    const { approvedBy } = req.body;
    const validation = await validationService.approveValidation(id, approvedBy);
    res.json(validation);
});
// Reject a validation
export const rejectValidation = asyncHandler(async (req, res) => {
    const { id } = await ValidationParamsSchema.parseAsync(req.params);
    const { rejectedBy, reason } = req.body;
    const validation = await validationService.rejectValidation(id, rejectedBy, reason);
    res.json(validation);
});
// Get validations by site
export const getValidationsBySite = asyncHandler(async (req, res) => {
    const { siteId } = req.params;
    const validations = await validationService.getValidationsBySite(siteId);
    res.json(validations);
});
// Get validations with pagination
export const getValidationsPaginated = asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortOrder } = req.query;
    const pagination = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        sortBy: sortBy || 'Timestamp',
        sortOrder: sortOrder || 'desc',
    };
    const result = await validationService.getValidationsPaginated(pagination.page, pagination.limit, pagination.sortBy, pagination.sortOrder);
    res.json(result);
});
