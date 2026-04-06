import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TaskMetrics {
  taskId: number;
  title: string;
  progress: number;
  estimatedCost?: number;
  actualCost?: number;
  variance?: number;
  status: string;
}

interface ProjectMetrics {
  projectId: number;
  projectName: string;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  budgetUtilization: number; // percentage
  taskCount: number;
  completedTasks: number;
  progressPercentage: number;
  averageTaskProgress: number;
  daysElapsed: number;
  estimatedDaysRemaining?: number;
}

interface BurndownData {
  date: string;
  plannedProgress: number;
  actualProgress: number;
}

/**
 * Calculate task progress percentage
 */
function calculateTaskProgress(task: any): number {
  const progress = task.progressPercentage || 0;
  return Math.min(100, Math.max(0, progress));
}

/**
 * Calculate project metrics
 */
export async function getProjectMetrics(projectId: number): Promise<ProjectMetrics> {
  try {
    const project = await prisma.project.findUnique({
      where: { ProjectID: projectId },
      include: {
        Tasks: {
          include: {
            Expenses: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    // Calculate metrics
    const tasks = project.Tasks || [];
    const totalBudget = project.TotalBudget || 0;

    let totalSpent = 0;
    let totalEstimatedCost = 0;
    let totalProgress = 0;
    let completedCount = 0;

    tasks.forEach((task: any) => {
      // Calculate spent
      const taskSpent = task.Expenses?.reduce((sum: number, exp: any) => sum + (exp.Cost || 0), 0) || 0;
      totalSpent += taskSpent;

      // Calculate estimated
      const estimated = (task as any).estimatedCost || 0;
      totalEstimatedCost += estimated;

      // Calculate progress
      const progress = calculateTaskProgress(task as any);
      totalProgress += progress;
      if (progress >= 100) completedCount++;
    });

    const avgProgress = tasks.length > 0 ? totalProgress / tasks.length : 0;
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Calculate time metrics
    const startDate = new Date(project.StartDate);
    const endDate = project.EndDate ? new Date(project.EndDate) : new Date();
    const now = new Date();
    const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalProjectDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const estimatedDaysRemaining = totalProjectDays - daysElapsed;

    return {
      projectId,
      projectName: project.Name,
      totalBudget,
      totalSpent,
      remainingBudget: Math.max(0, totalBudget - totalSpent),
      budgetUtilization: Math.round(budgetUtilization * 100) / 100,
      taskCount: tasks.length,
      completedTasks: completedCount,
      progressPercentage: Math.round(avgProgress * 100) / 100,
      averageTaskProgress: Math.round(avgProgress * 100) / 100,
      daysElapsed,
      estimatedDaysRemaining: Math.max(0, estimatedDaysRemaining),
    };
  } catch (error) {
    console.error('Error calculating project metrics:', error);
    throw error;
  }
}

/**
 * Get all task metrics for a project
 */
export async function getTaskMetrics(projectId: number): Promise<TaskMetrics[]> {
  try {
    const project = await prisma.project.findUnique({
      where: { ProjectID: projectId },
      include: {
        Tasks: {
          include: {
            Expenses: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const tasks = project.Tasks || [];

    return tasks.map((task: any) => {
      const actualCost = task.Expenses?.reduce((sum: number, exp: any) => sum + (exp.Cost || 0), 0) || 0;
      const estimatedCost = (task as any).estimatedCost || 0;
      const variance = estimatedCost > 0 ? actualCost - estimatedCost : 0;
      const progress = calculateTaskProgress(task as any);

      return {
        taskId: task.TaskID,
        title: task.Title,
        progress,
        estimatedCost,
        actualCost,
        variance,
        status: progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started',
      };
    });
  } catch (error) {
    console.error('Error getting task metrics:', error);
    throw error;
  }
}

/**
 * Get budget variance analysis
 */
export async function getBudgetVariance(projectId: number) {
  try {
    const metrics = await getTaskMetrics(projectId);

    const variance = {
      totalEstimated: metrics.reduce((sum, t) => sum + (t.estimatedCost || 0), 0),
      totalActual: metrics.reduce((sum, t) => sum + (t.actualCost || 0), 0),
      taskVariances: metrics
        .filter((t) => t.variance !== 0)
        .sort((a, b) => Math.abs(b.variance!) - Math.abs(a.variance!)),
      favorableVariance: metrics.filter((t: { variance?: number }) => (t.variance || 0) < 0).length, // under budget
      unfavorableVariance: metrics.filter((t: { variance?: number }) => (t.variance || 0) > 0).length, // over budget
    };

    variance.totalActual = Math.round(variance.totalActual * 100) / 100;
    variance.totalEstimated = Math.round(variance.totalEstimated * 100) / 100;

    return variance;
  } catch (error) {
    console.error('Error calculating budget variance:', error);
    throw error;
  }
}

/**
 * Generate burndown progress over time
 * Returns mock data - in production, would use audit history
 */
export async function generateBurndownChart(projectId: number): Promise<BurndownData[]> {
  try {
    const metrics = await getProjectMetrics(projectId);

    // Generate data points for each week
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days

    const burndownData: BurndownData[] = [];
    const daysPerDataPoint = 7; // Weekly data points

    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i * daysPerDataPoint);

      // Planned progress (linear)
      const plannedProgress = (i + 1) * 20; // 20% per week for 5 weeks

      // Actual progress (simulated based on current metrics)
      const actualProgress = Math.min(100, metrics.progressPercentage * (0.8 + Math.random() * 0.4));

      burndownData.push({
        date: date.toISOString().split('T')[0],
        plannedProgress: Math.min(100, plannedProgress),
        actualProgress: Math.round(actualProgress * 100) / 100,
      });
    }

    return burndownData;
  } catch (error) {
    console.error('Error generating burndown chart:', error);
    throw error;
  }
}

/**
 * Get approval queue metrics
 */
export async function getApprovalQueueMetrics(projectId?: number) {
  try {
    const workflows = await prisma.approvalWorkflow.findMany({
      where: projectId
        ? {
            expense: {
              Task: {
                ProjectID: projectId,
              },
            },
          }
        : undefined,
      include: {
        expense: true,
      },
    });

    const metrics = {
      totalPending: workflows.filter(
        (w: { level1_status: string; level2_status: string; level3_status: string; level4_status: string }) => w.level1_status === 'Pending' || w.level2_status === 'Pending' || w.level3_status === 'Pending' || w.level4_status === 'Pending'
      ).length,
      level1Pending: workflows.filter((w: { level1_status: string }) => w.level1_status === 'Pending').length,
      level2Pending: workflows.filter((w: { level2_status: string }) => w.level2_status === 'Pending').length,
      level3Pending: workflows.filter((w: { level3_status: string }) => w.level3_status === 'Pending').length,
      level4Pending: workflows.filter((w: { level4_status: string }) => w.level4_status === 'Pending').length,
      approved: workflows.filter(
        (w: { level1_status: string; level2_status: string; level3_status: string; level4_status: string }) => w.level1_status === 'Approved' && w.level2_status === 'Approved' && w.level3_status === 'Approved' && w.level4_status === 'Approved'
      ).length,
      rejected: workflows.filter(
        (w: { level1_status: string; level2_status: string; level3_status: string; level4_status: string }) => w.level1_status === 'Rejected' || w.level2_status === 'Rejected' || w.level3_status === 'Rejected' || w.level4_status === 'Rejected'
      ).length,
      paymentBlocked: workflows.filter((w: { paymentBlockedUntil: Date | null }) => w.paymentBlockedUntil !== null).length,
    };

    return metrics;
  } catch (error) {
    console.error('Error getting approval metrics:', error);
    throw error;
  }
}

/**
 * Get reconciliation metrics
 */
export async function getReconciliationMetrics(projectId?: number) {
  try {
    const audits = await prisma.reconciliationAudit.findMany({
      where: projectId
        ? {
            expense: {
              Task: {
                ProjectID: projectId,
              },
            },
          }
        : undefined,
    });

    const metrics = {
      total: audits.length,
      matched: audits.filter((a: { status: string }) => a.status === 'Matched').length,
      discrepancies: audits.filter((a: { status: string }) => a.status === 'Discrepancy').length,
      pending: audits.filter((a: { status: string }) => a.status === 'Pending').length,
      resolved: audits.filter((a: { status: string }) => a.status === 'Resolved').length,
      discrepancyRate: audits.length > 0 ? ((audits.filter((a: { status: string }) => a.status === 'Discrepancy').length / audits.length) * 100).toFixed(2) : '0',
    };

    return metrics;
  } catch (error) {
    console.error('Error getting reconciliation metrics:', error);
    throw error;
  }
}
