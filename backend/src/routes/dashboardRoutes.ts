import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticateJWT } from '../middleware/index.js';

const router = Router();

// GET /api/dashboard/stats - Aggregated dashboard statistics
router.get('/stats', authenticateJWT, async (_req, res) => {
  try {
    // Run all queries in parallel for performance
    const [
      projectCount,
      taskStats,
      expenseStats,
      resourceCount,
      documentStats,
      siteCount,
      territoryCount,
      measurementCount,
      validationStats,
      recentProjects,
      recentMeasurements,
      recentValidations,
    ] = await Promise.all([
      // Project count
      prisma.project.count(),

      // Task statistics
      prisma.task.groupBy({
        by: ['CompletionStatus'],
        _count: { TaskID: true },
      }),

      // Expense totals
      prisma.expense.aggregate({
        _sum: { Cost: true },
        _count: { ExpenseID: true },
      }),

      // Resource count
      prisma.resource.count(),

      // Document statistics by category
      prisma.document.groupBy({
        by: ['Category'],
        _count: { DocumentID: true },
      }),

      // Site count
      prisma.site.count(),

      // Territory count
      prisma.territory.count(),

      // Measurement count
      prisma.measurement.count(),

      // Validation statistics by status
      prisma.validation.groupBy({
        by: ['Status'],
        _count: { ValidationID: true },
      }),

      // Recent projects (last 5)
      prisma.project.findMany({
        take: 5,
        orderBy: { CreatedAt: 'desc' },
        select: {
          ProjectID: true,
          Name: true,
          StartDate: true,
          EndDate: true,
          TotalBudget: true,
          _count: { select: { Tasks: true } },
        },
      }),

      // Recent measurements (last 5)
      prisma.measurement.findMany({
        take: 5,
        orderBy: { CreatedAt: 'desc' },
        select: {
          MeasurementID: true,
          MeasurementType: true,
          Value: true,
          Date: true,
          SiteID: true,
          Site: { select: { Name: true } },
        },
      }),

      // Recent validations (last 5)
      prisma.validation.findMany({
        take: 5,
        orderBy: { Timestamp: 'desc' },
        select: {
          ValidationID: true,
          Status: true,
          GeneratedBy: true,
          Timestamp: true,
          SiteID: true,
          Site: { select: { Name: true } },
        },
      }),
    ]);

    // Process task stats
    const tasksByStatus = {
      NotStarted: 0,
      InProgress: 0,
      Completed: 0,
    };
    let totalTasks = 0;
    for (const stat of taskStats) {
      const count = stat._count.TaskID;
      tasksByStatus[stat.CompletionStatus as keyof typeof tasksByStatus] = count;
      totalTasks += count;
    }

    // Process validation stats
    const validationsByStatus = {
      Pending: 0,
      Approved: 0,
      Rejected: 0,
    };
    let totalValidations = 0;
    for (const stat of validationStats) {
      const count = stat._count.ValidationID;
      validationsByStatus[stat.Status as keyof typeof validationsByStatus] = count;
      totalValidations += count;
    }

    // Process document stats
    const documentsByCategory: Record<string, number> = {};
    let totalDocuments = 0;
    for (const stat of documentStats) {
      documentsByCategory[stat.Category] = stat._count.DocumentID;
      totalDocuments += stat._count.DocumentID;
    }

    // Budget utilization
    const totalBudget = await prisma.project.aggregate({
      _sum: { TotalBudget: true },
    });
    const totalExpenses = expenseStats._sum.Cost || 0;
    const budgetUtilization = totalBudget._sum.TotalBudget
      ? Number(totalExpenses) / Number(totalBudget._sum.TotalBudget) * 100
      : 0;

    res.json({
      projects: {
        total: projectCount,
        recent: recentProjects,
      },
      tasks: {
        total: totalTasks,
        byStatus: tasksByStatus,
        completionRate: totalTasks > 0 ? Math.round((tasksByStatus.Completed / totalTasks) * 100) : 0,
      },
      budget: {
        totalBudget: Number(totalBudget._sum.TotalBudget || 0),
        totalExpenses: Number(totalExpenses),
        utilization: Math.round(budgetUtilization * 10) / 10,
      },
      expenses: {
        total: expenseStats._count.ExpenseID,
        totalCost: Number(totalExpenses),
      },
      resources: {
        total: resourceCount,
      },
      documents: {
        total: totalDocuments,
        byCategory: documentsByCategory,
      },
      sites: {
        total: siteCount,
        territories: territoryCount,
      },
      measurements: {
        total: measurementCount,
        recent: recentMeasurements,
      },
      validations: {
        total: totalValidations,
        byStatus: validationsByStatus,
        recent: recentValidations,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

export default router;
