import { ReportService } from '../services/reportService.js';
import { asyncHandler } from '../middleware/index.js';
import { ReportCreateSchema, ReportParamsSchema, } from '../schemas/index.js';
const reportService = new ReportService();
// Create a report
export const createReport = asyncHandler(async (req, res) => {
    const validatedData = await ReportCreateSchema.parseAsync(req.body);
    const report = await reportService.createReport(validatedData);
    res.status(201).json(report);
});
// Get all reports
export const getAllReports = asyncHandler(async (req, res) => {
    const reports = await reportService.getAllReports();
    res.json(reports);
});
// Get report by ID
export const getReportById = asyncHandler(async (req, res) => {
    const { id } = await ReportParamsSchema.parseAsync(req.params);
    const report = await reportService.getReportById(id);
    res.json(report);
});
// Get reports by project
export const getReportsByProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const reports = await reportService.getReportsByProject(parseInt(projectId));
    res.json(reports);
});
// Get reports by validation
export const getReportsByValidation = asyncHandler(async (req, res) => {
    const { validationId } = req.params;
    const reports = await reportService.getReportsByValidation(parseInt(validationId));
    res.json(reports);
});
// Delete a report
export const deleteReport = asyncHandler(async (req, res) => {
    const { id } = await ReportParamsSchema.parseAsync(req.params);
    await reportService.deleteReport(id);
    res.status(204).send();
});
// Get reports with pagination
export const getReportsPaginated = asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortOrder } = req.query;
    const pagination = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        sortBy: sortBy || 'Timestamp',
        sortOrder: sortOrder || 'desc',
    };
    const result = await reportService.getReportsPaginated(pagination.page, pagination.limit, pagination.sortBy, pagination.sortOrder);
    res.json(result);
});
// Generate billing report for a project
export const generateBillingReport = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const billingReport = await reportService.generateBillingReport(parseInt(projectId));
    res.json(billingReport);
});
