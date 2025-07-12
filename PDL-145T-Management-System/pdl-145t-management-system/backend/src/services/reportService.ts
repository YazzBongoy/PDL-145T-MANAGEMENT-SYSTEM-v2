import { PrismaClient } from '@prisma/client';
import { ReportCreateRequest } from '../types/express.js';

const prisma = new PrismaClient();

export class ReportService {
  // Create a new report
  async createReport(data: ReportCreateRequest) {
    // Verify that the validation and project exist
    const [validation, project] = await Promise.all([
      prisma.validation.findUnique({
        where: { ValidationID: data.ValidationID },
      }),
      prisma.project.findUnique({
        where: { ProjectID: data.ProjectID },
      }),
    ]);
    
    if (!validation) {
      throw new Error('Validation not found');
    }
    
    if (!project) {
      throw new Error('Project not found');
    }

    return await prisma.report.create({
      data: {
        ValidationID: data.ValidationID,
        ProjectID: data.ProjectID,
        GeneratedBy: data.GeneratedBy,
      },
    });
  }

  // Get all reports
  async getAllReports() {
    return await prisma.report.findMany({
      orderBy: { Timestamp: 'desc' },
      include: {
        Validation: {
          select: {
            ValidationID: true,
            SiteID: true,
            Status: true,
            Task: {
              select: {
                TaskID: true,
                Description: true,
              },
            },
          },
        },
        Project: {
          select: {
            ProjectID: true,
            Name: true,
          },
        },
      },
    });
  }

  // Get a specific report by ID
  async getReportById(id: number) {
    const report = await prisma.report.findUnique({
      where: { ReportID: id },
      include: {
        Validation: {
          include: {
            Task: {
              select: {
                TaskID: true,
                Description: true,
                CompletionStatus: true,
              },
            },
          },
        },
        Project: true,
      },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    return report;
  }

  // Get reports by project
  async getReportsByProject(projectId: number) {
    return await prisma.report.findMany({
      where: { ProjectID: projectId },
      orderBy: { Timestamp: 'desc' },
      include: {
        Validation: {
          select: {
            ValidationID: true,
            SiteID: true,
            Status: true,
            Task: {
              select: {
                TaskID: true,
                Description: true,
              },
            },
          },
        },
      },
    });
  }

  // Get reports by validation
  async getReportsByValidation(validationId: number) {
    return await prisma.report.findMany({
      where: { ValidationID: validationId },
      orderBy: { Timestamp: 'desc' },
      include: {
        Project: {
          select: {
            ProjectID: true,
            Name: true,
          },
        },
      },
    });
  }

  // Delete a report
  async deleteReport(id: number) {
    const report = await prisma.report.findUnique({
      where: { ReportID: id },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    await prisma.report.delete({
      where: { ReportID: id },
    });

    return { success: true };
  }

  // Get reports with pagination
  async getReportsPaginated(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'Timestamp',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    const skip = (page - 1) * limit;
    
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          Validation: {
            select: {
              ValidationID: true,
              SiteID: true,
              Status: true,
              Task: {
                select: {
                  TaskID: true,
                  Description: true,
                },
              },
            },
          },
          Project: {
            select: {
              ProjectID: true,
              Name: true,
            },
          },
        },
      }),
      prisma.report.count(),
    ]);

    return {
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Generate billing report for a project
  async generateBillingReport(projectId: number) {
    const project = await prisma.project.findUnique({
      where: { ProjectID: projectId },
      include: {
        Tasks: {
          include: {
            Expenses: true,
            Validations: {
              where: { Status: 'Approved' },
            },
          },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const totalExpenses = project.Tasks.reduce((total, task) => {
      return total + task.Expenses.reduce((taskTotal, expense) => taskTotal + Number(expense.Cost), 0);
    }, 0);

    const approvedValidations = project.Tasks.reduce((total, task) => total + task.Validations.length, 0);
    const totalTasks = project.Tasks.length;
    const completedTasks = project.Tasks.filter(task => task.CompletionStatus === 'Completed').length;

    return {
      project: {
        id: project.ProjectID,
        name: project.Name,
        startDate: project.StartDate,
        endDate: project.EndDate,
        totalBudget: Number(project.TotalBudget),
      },
      summary: {
        totalExpenses,
        approvedValidations,
        totalTasks,
        completedTasks,
        budgetUtilization: (totalExpenses / Number(project.TotalBudget)) * 100,
        completionRate: (completedTasks / totalTasks) * 100,
      },
      details: {
        tasks: project.Tasks.map(task => ({
          id: task.TaskID,
          description: task.Description,
          status: task.CompletionStatus,
          expenses: task.Expenses.map(expense => ({
            id: expense.ExpenseID,
            description: expense.Description,
            cost: Number(expense.Cost),
            date: expense.Date,
          })),
          validations: task.Validations.length,
        })),
      },
    };
  }
}
