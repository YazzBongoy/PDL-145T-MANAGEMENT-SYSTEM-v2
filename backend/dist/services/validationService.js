import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class ValidationService {
    // Create a new validation
    async createValidation(taskId, data) {
        // Verify that the task exists
        const task = await prisma.task.findUnique({
            where: { TaskID: taskId },
        });
        if (!task) {
            throw new Error('Task not found');
        }
        return await prisma.validation.create({
            data: {
                TaskID: taskId,
                SiteID: data.SiteID,
                Status: data.Status || 'Pending',
                Notes: data.Notes || null,
                GeneratedBy: data.GeneratedBy,
            },
        });
    }
    // Get all validations for a task
    async getValidationsByTask(taskId) {
        return await prisma.validation.findMany({
            where: { TaskID: taskId },
            orderBy: { Timestamp: 'desc' },
        });
    }
    // Get a specific validation by ID
    async getValidationById(id) {
        const validation = await prisma.validation.findUnique({
            where: { ValidationID: id },
            include: {
                Task: {
                    select: {
                        TaskID: true,
                        Description: true,
                        Project: {
                            select: {
                                ProjectID: true,
                                Name: true,
                            },
                        },
                    },
                },
                Reports: true,
            },
        });
        if (!validation) {
            throw new Error('Validation not found');
        }
        return validation;
    }
    // Update a validation
    async updateValidation(id, data) {
        const validation = await prisma.validation.findUnique({
            where: { ValidationID: id },
        });
        if (!validation) {
            throw new Error('Validation not found');
        }
        return await prisma.validation.update({
            where: { ValidationID: id },
            data: {
                SiteID: data.SiteID ?? validation.SiteID,
                Status: data.Status ?? validation.Status,
                Notes: data.Notes ?? validation.Notes,
                GeneratedBy: data.GeneratedBy ?? validation.GeneratedBy,
            },
        });
    }
    // Delete a validation
    async deleteValidation(id) {
        const validation = await prisma.validation.findUnique({
            where: { ValidationID: id },
        });
        if (!validation) {
            throw new Error('Validation not found');
        }
        // Check if there are any reports referencing this validation
        const reportCount = await prisma.report.count({
            where: { ValidationID: id },
        });
        if (reportCount > 0) {
            throw new Error('Cannot delete validation with existing reports');
        }
        await prisma.validation.delete({
            where: { ValidationID: id },
        });
        return { success: true };
    }
    // Get validations by site ID
    async getValidationsBySite(siteId) {
        return await prisma.validation.findMany({
            where: { SiteID: siteId },
            orderBy: { Timestamp: 'desc' },
            include: {
                Task: {
                    select: {
                        TaskID: true,
                        Description: true,
                        Project: {
                            select: {
                                ProjectID: true,
                                Name: true,
                            },
                        },
                    },
                },
            },
        });
    }
    // Get validations by status
    async getValidationsByStatus(status) {
        return await prisma.validation.findMany({
            where: { Status: status },
            orderBy: { Timestamp: 'desc' },
            include: {
                Task: {
                    select: {
                        TaskID: true,
                        Description: true,
                        Project: {
                            select: {
                                ProjectID: true,
                                Name: true,
                            },
                        },
                    },
                },
            },
        });
    }
    // Get pending validations (commonly used for workflow)
    async getPendingValidations() {
        return await this.getValidationsByStatus('Pending');
    }
    // Approve a validation
    async approveValidation(id, approvedBy) {
        const validation = await prisma.validation.findUnique({
            where: { ValidationID: id },
        });
        if (!validation) {
            throw new Error('Validation not found');
        }
        return await prisma.validation.update({
            where: { ValidationID: id },
            data: {
                Status: 'Approved',
                Notes: validation.Notes ? `${validation.Notes}\n\nApproved by: ${approvedBy}` : `Approved by: ${approvedBy}`,
            },
        });
    }
    // Reject a validation
    async rejectValidation(id, rejectedBy, reason) {
        const validation = await prisma.validation.findUnique({
            where: { ValidationID: id },
        });
        if (!validation) {
            throw new Error('Validation not found');
        }
        const rejectionNote = reason ? `Rejected by: ${rejectedBy}. Reason: ${reason}` : `Rejected by: ${rejectedBy}`;
        return await prisma.validation.update({
            where: { ValidationID: id },
            data: {
                Status: 'Rejected',
                Notes: validation.Notes ? `${validation.Notes}\n\n${rejectionNote}` : rejectionNote,
            },
        });
    }
    // Get validations with pagination
    async getValidationsPaginated(page = 1, limit = 10, sortBy = 'Timestamp', sortOrder = 'desc') {
        const skip = (page - 1) * limit;
        const [validations, total] = await Promise.all([
            prisma.validation.findMany({
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    Task: {
                        select: {
                            TaskID: true,
                            Description: true,
                            Project: {
                                select: {
                                    ProjectID: true,
                                    Name: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.validation.count(),
        ]);
        return {
            data: validations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
}
