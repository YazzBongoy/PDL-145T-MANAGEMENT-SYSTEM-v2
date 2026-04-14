import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class MeasurementService {
    // Create a new measurement
    async createMeasurement(taskId, data) {
        // Verify that the task exists
        const task = await prisma.task.findUnique({
            where: { TaskID: taskId },
        });
        if (!task) {
            throw new Error('Task not found');
        }
        return await prisma.measurement.create({
            data: {
                TaskID: taskId,
                SiteID: data.SiteID,
                MeasurementType: data.MeasurementType,
                Value: data.Value,
                Date: new Date(data.Date),
            },
        });
    }
    // Get all measurements for a task
    async getMeasurementsByTask(taskId) {
        return await prisma.measurement.findMany({
            where: { TaskID: taskId },
            orderBy: { Date: 'desc' },
        });
    }
    // Get a specific measurement by ID
    async getMeasurementById(id) {
        const measurement = await prisma.measurement.findUnique({
            where: { MeasurementID: id },
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
        if (!measurement) {
            throw new Error('Measurement not found');
        }
        return measurement;
    }
    // Update a measurement
    async updateMeasurement(id, data) {
        const measurement = await prisma.measurement.findUnique({
            where: { MeasurementID: id },
        });
        if (!measurement) {
            throw new Error('Measurement not found');
        }
        return await prisma.measurement.update({
            where: { MeasurementID: id },
            data: {
                SiteID: data.SiteID ?? measurement.SiteID,
                MeasurementType: data.MeasurementType ?? measurement.MeasurementType,
                Value: data.Value ?? measurement.Value,
                Date: data.Date ? new Date(data.Date) : measurement.Date,
            },
        });
    }
    // Delete a measurement
    async deleteMeasurement(id) {
        const measurement = await prisma.measurement.findUnique({
            where: { MeasurementID: id },
        });
        if (!measurement) {
            throw new Error('Measurement not found');
        }
        await prisma.measurement.delete({
            where: { MeasurementID: id },
        });
        return { success: true };
    }
    // Get measurements by site ID
    async getMeasurementsBySite(siteId) {
        return await prisma.measurement.findMany({
            where: { SiteID: siteId },
            orderBy: { Date: 'desc' },
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
    // Get measurements by type
    async getMeasurementsByType(measurementType) {
        return await prisma.measurement.findMany({
            where: { MeasurementType: measurementType },
            orderBy: { Date: 'desc' },
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
    // Get measurements with pagination
    async getMeasurementsPaginated(page = 1, limit = 10, sortBy = 'Date', sortOrder = 'desc') {
        const skip = (page - 1) * limit;
        const [measurements, total] = await Promise.all([
            prisma.measurement.findMany({
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
            prisma.measurement.count(),
        ]);
        return {
            data: measurements,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
}
