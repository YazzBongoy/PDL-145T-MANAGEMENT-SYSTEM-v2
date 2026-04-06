import { PrismaClient } from '@prisma/client';
import { getProjectMetrics, getTaskMetrics, getBudgetVariance } from './metricsService.js';

const prisma = new PrismaClient();

interface ReportOptions {
  projectId: number;
  startDate?: Date;
  endDate?: Date;
  includeAuditTrail?: boolean;
  includeApprovals?: boolean;
  includeReconciliation?: boolean;
}

interface ReportData {
  projectName: string;
  reportDate: string;
  projectMetrics: any;
  taskMetrics: any[];
  budgetVariance: any;
  auditTrail?: any[];
  approvalSummary?: any;
  reconciliationSummary?: any;
}

/**
 * Generate comprehensive project report
 */
export async function generateProjectReport(options: ReportOptions): Promise<ReportData> {
  try {
    const project = await prisma.project.findUnique({
      where: { ProjectID: options.projectId },
    });

    if (!project) {
      throw new Error(`Project ${options.projectId} not found`);
    }

    const projectMetrics = await getProjectMetrics(options.projectId);
    const taskMetrics = await getTaskMetrics(options.projectId);
    const budgetVariance = await getBudgetVariance(options.projectId);

    const reportData: ReportData = {
      projectName: project.Name,
      reportDate: new Date().toISOString(),
      projectMetrics,
      taskMetrics,
      budgetVariance,
    };

    // Add audit trail if requested
    if (options.includeAuditTrail) {
      const auditLogs = await prisma.auditLog.findMany({
        where: {
          entityType: 'Expense',
          timestamp: {
            gte: options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            lte: options.endDate || new Date(),
          },
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
      reportData.auditTrail = auditLogs;
    }

    // Add approval summary if requested
    if (options.includeApprovals) {
      const workflows = await prisma.approvalWorkflow.findMany({
        where: {
          expense: {
            Task: {
              ProjectID: options.projectId,
            },
          },
        },
        include: {
          expense: true,
        },
      });

      reportData.approvalSummary = {
        total: workflows.length,
        approved: workflows.filter(
          (w: { level1_status: string; level2_status: string; level3_status: string; level4_status: string }) =>
            w.level1_status === 'Approved' &&
            w.level2_status === 'Approved' &&
            w.level3_status === 'Approved' &&
            w.level4_status === 'Approved'
        ).length,
        pending: workflows.filter((w: { level1_status: string }) => w.level1_status === 'Pending').length,
        rejected: workflows.filter(
          (w: { level1_status: string; level2_status: string; level3_status: string; level4_status: string }) =>
            w.level1_status === 'Rejected' ||
            w.level2_status === 'Rejected' ||
            w.level3_status === 'Rejected' ||
            w.level4_status === 'Rejected'
        ).length,
      };
    }

    // Add reconciliation summary if requested
    if (options.includeReconciliation) {
      const audits = await prisma.reconciliationAudit.findMany({
        where: {
          expense: {
            Task: {
              ProjectID: options.projectId,
            },
          },
        },
      });

      reportData.reconciliationSummary = {
        total: audits.length,
        matched: audits.filter((a: { status: string }) => a.status === 'Matched').length,
        discrepancies: audits.filter((a: { status: string }) => a.status === 'Discrepancy').length,
        pending: audits.filter((a: { status: string }) => a.status === 'Pending').length,
        resolved: audits.filter((a: { status: string }) => a.status === 'Resolved').length,
      };
    }

    return reportData;
  } catch (error) {
    console.error('Error generating project report:', error);
    throw error;
  }
}

/**
 * Generate Excel data structure
 */
export async function generateExcelData(options: ReportOptions) {
  const reportData = await generateProjectReport(options);

  const sheets: Record<string, any[]> = {};

  // Summary sheet
  sheets['Summary'] = [
    ['PROJECT REPORT'],
    ['Project Name:', reportData.projectName],
    ['Report Date:', reportData.reportDate],
    [],
    ['PROJECT METRICS'],
    ['Total Budget:', reportData.projectMetrics.totalBudget],
    ['Total Spent:', reportData.projectMetrics.totalSpent],
    ['Remaining Budget:', reportData.projectMetrics.remainingBudget],
    ['Budget Utilization:', `${reportData.projectMetrics.budgetUtilization}%`],
    ['Progress:', `${reportData.projectMetrics.progressPercentage}%`],
    ['Completed Tasks:', reportData.projectMetrics.completedTasks],
    ['Task Count:', reportData.projectMetrics.taskCount],
  ];

  // Tasks sheet
  sheets['Tasks'] = [
    ['Task ID', 'Title', 'Progress %', 'Estimated Cost', 'Actual Cost', 'Variance', 'Status'],
    ...reportData.taskMetrics.map((t) => [
      t.taskId,
      t.title,
      t.progress,
      t.estimatedCost || 0,
      t.actualCost,
      t.variance,
      t.status,
    ]),
  ];

  // Budget variance sheet
  if (reportData.budgetVariance) {
    sheets['Budget Variance'] = [
      ['Budget Analysis'],
      ['Total Estimated:', reportData.budgetVariance.totalEstimated],
      ['Total Actual:', reportData.budgetVariance.totalActual],
      ['Favorable Variance Count:', reportData.budgetVariance.favorableVariance],
      ['Unfavorable Variance Count:', reportData.budgetVariance.unfavorableVariance],
      [],
      ['Tasks with Variance', 'Amount', 'Type'],
      ...reportData.budgetVariance.taskVariances.map((t: any) => [
        t.title,
        t.variance,
        (t.variance as number) < 0 ? 'Favorable' : 'Unfavorable',
      ]),
    ];
  }

  // Audit trail sheet
  if (reportData.auditTrail && reportData.auditTrail.length > 0) {
    sheets['Audit Trail'] = [
      ['Date', 'User', 'Action', 'Entity', 'Reason'],
      ...reportData.auditTrail.map((log: any) => [
        new Date(log.timestamp).toLocaleString(),
        log.user.name,
        log.action,
        log.entityType,
        log.reason || '',
      ]),
    ];
  }

  // Approvals sheet
  if (reportData.approvalSummary) {
    sheets['Approvals'] = [
      ['APPROVAL SUMMARY'],
      ['Total Expenses:', reportData.approvalSummary.total],
      ['Approved:', reportData.approvalSummary.approved],
      ['Pending:', reportData.approvalSummary.pending],
      ['Rejected:', reportData.approvalSummary.rejected],
      [`Approval Rate: ${((reportData.approvalSummary.approved / reportData.approvalSummary.total) * 100).toFixed(1)}%`],
    ];
  }

  // Reconciliation sheet
  if (reportData.reconciliationSummary) {
    sheets['Reconciliation'] = [
      ['RECONCILIATION SUMMARY'],
      ['Total Audits:', reportData.reconciliationSummary.total],
      ['Matched:', reportData.reconciliationSummary.matched],
      ['Discrepancies:', reportData.reconciliationSummary.discrepancies],
      ['Pending:', reportData.reconciliationSummary.pending],
      ['Resolved:', reportData.reconciliationSummary.resolved],
      [`Match Rate: ${((reportData.reconciliationSummary.matched / reportData.reconciliationSummary.total) * 100).toFixed(1)}%`],
    ];
  }

  return sheets;
}

/**
 * Generate PDF data structure (returns formatted text for pdfkit)
 */
export async function generatePdfData(options: ReportOptions): Promise<string[]> {
  const reportData = await generateProjectReport(options);

  const lines: string[] = [];

  // Header
  lines.push('='.repeat(80));
  lines.push(`PROJECT REPORT: ${reportData.projectName}`);
  lines.push(`Report Generated: ${new Date(reportData.reportDate).toLocaleString()}`);
  lines.push('='.repeat(80));
  lines.push('');

  // Executive Summary
  lines.push('EXECUTIVE SUMMARY');
  lines.push('-'.repeat(80));
  lines.push(`Budget Status: $${reportData.projectMetrics.totalSpent.toLocaleString()} / $${reportData.projectMetrics.totalBudget.toLocaleString()}`);
  lines.push(`Budget Utilization: ${reportData.projectMetrics.budgetUtilization}%`);
  lines.push(`Project Progress: ${reportData.projectMetrics.progressPercentage}%`);
  lines.push(`Completed Tasks: ${reportData.projectMetrics.completedTasks} / ${reportData.projectMetrics.taskCount}`);
  lines.push('');

  // Financial Summary
  lines.push('FINANCIAL SUMMARY');
  lines.push('-'.repeat(80));
  lines.push(`Remaining Budget: $${reportData.projectMetrics.remainingBudget.toLocaleString()}`);
  lines.push(`Days Elapsed: ${reportData.projectMetrics.daysElapsed}`);
  if (reportData.projectMetrics.estimatedDaysRemaining) {
    lines.push(`Estimated Days Remaining: ${reportData.projectMetrics.estimatedDaysRemaining}`);
  }
  lines.push('');

  // Budget Variance
  if (reportData.budgetVariance) {
    lines.push('BUDGET VARIANCE ANALYSIS');
    lines.push('-'.repeat(80));
    lines.push(`Total Estimated: $${reportData.budgetVariance.totalEstimated.toLocaleString()}`);
    lines.push(`Total Actual: $${reportData.budgetVariance.totalActual.toLocaleString()}`);
    lines.push(`Favorable Variance Tasks: ${reportData.budgetVariance.favorableVariance}`);
    lines.push(`Unfavorable Variance Tasks: ${reportData.budgetVariance.unfavorableVariance}`);
    lines.push('');
  }

  // Task Summary
  lines.push('TASK SUMMARY');
  lines.push('-'.repeat(80));
  lines.push('ID | Title | Progress | Est. Cost | Act. Cost | Status');
  lines.push('-'.repeat(80));
  reportData.taskMetrics.forEach((task) => {
    const row = [
      task.taskId.toString(),
      task.title.substring(0, 20),
      `${task.progress}%`,
      `$${task.estimatedCost || 0}`,
      `$${task.actualCost}`,
      task.status,
    ].join(' | ');
    lines.push(row);
  });
  lines.push('');

  // Approval Summary
  if (reportData.approvalSummary) {
    lines.push('APPROVAL WORKFLOW SUMMARY');
    lines.push('-'.repeat(80));
    lines.push(`Total Expenses: ${reportData.approvalSummary.total}`);
    lines.push(`Approved: ${reportData.approvalSummary.approved}`);
    lines.push(`Pending: ${reportData.approvalSummary.pending}`);
    lines.push(`Rejected: ${reportData.approvalSummary.rejected}`);
    const approvalRate = reportData.approvalSummary.total > 0
      ? ((reportData.approvalSummary.approved / reportData.approvalSummary.total) * 100).toFixed(1)
      : '0';
    lines.push(`Approval Rate: ${approvalRate}%`);
    lines.push('');
  }

  // Reconciliation Summary
  if (reportData.reconciliationSummary) {
    lines.push('RECONCILIATION AUDIT SUMMARY');
    lines.push('-'.repeat(80));
    lines.push(`Total Audits: ${reportData.reconciliationSummary.total}`);
    lines.push(`Matched: ${reportData.reconciliationSummary.matched}`);
    lines.push(`Discrepancies: ${reportData.reconciliationSummary.discrepancies}`);
    lines.push(`Pending: ${reportData.reconciliationSummary.pending}`);
    lines.push(`Resolved: ${reportData.reconciliationSummary.resolved}`);
    const matchRate = reportData.reconciliationSummary.total > 0
      ? ((reportData.reconciliationSummary.matched / reportData.reconciliationSummary.total) * 100).toFixed(1)
      : '0';
    lines.push(`Match Rate: ${matchRate}%`);
    lines.push('');
  }

  lines.push('='.repeat(80));
  lines.push('END OF REPORT');
  lines.push('='.repeat(80));

  return lines;
}
