import { Router, Request, Response } from 'express';
import {
  getProjectMetrics,
  getTaskMetrics,
  getBudgetVariance,
  generateBurndownChart,
  getApprovalQueueMetrics,
  getReconciliationMetrics,
} from '../services/metricsService';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

/**
 * GET /api/metrics/project/:projectId
 * Get overall project metrics
 */
router.get('/project/:projectId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const metrics = await getProjectMetrics(parseInt(projectId, 10));

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error fetching project metrics:', error);
    const errorMsg = (error as Error).message;
    res.status(404).json({
      success: false,
      error: errorMsg || 'Failed to fetch project metrics',
    });
  }
});

/**
 * GET /api/metrics/project/:projectId/tasks
 * Get task-level metrics for a project
 */
router.get('/project/:projectId/tasks', requireAuth, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const taskMetrics = await getTaskMetrics(parseInt(projectId, 10));

    res.json({
      success: true,
      count: taskMetrics.length,
      data: taskMetrics,
    });
  } catch (error) {
    console.error('Error fetching task metrics:', error);
    const errorMsg = (error as Error).message;
    res.status(404).json({
      success: false,
      error: errorMsg || 'Failed to fetch task metrics',
    });
  }
});

/**
 * GET /api/metrics/project/:projectId/budget-variance
 * Get budget variance analysis
 */
router.get('/project/:projectId/budget-variance', requireAuth, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const variance = await getBudgetVariance(parseInt(projectId, 10));

    res.json({
      success: true,
      data: variance,
    });
  } catch (error) {
    console.error('Error calculating budget variance:', error);
    const errorMsg = (error as Error).message;
    res.status(404).json({
      success: false,
      error: errorMsg || 'Failed to calculate budget variance',
    });
  }
});

/**
 * GET /api/metrics/project/:projectId/burndown
 * Get burndown chart data
 */
router.get('/project/:projectId/burndown', requireAuth, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const burndownData = await generateBurndownChart(parseInt(projectId, 10));

    res.json({
      success: true,
      data: burndownData,
    });
  } catch (error) {
    console.error('Error generating burndown chart:', error);
    const errorMsg = (error as Error).message;
    res.status(404).json({
      success: false,
      error: errorMsg || 'Failed to generate burndown chart',
    });
  }
});

/**
 * GET /api/metrics/approvals
 * Get approval queue metrics
 */
router.get('/approvals', requireAuth, requireRole(['ADMIN', 'SUPERVISOR']), async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const metrics = await getApprovalQueueMetrics(projectId ? parseInt(projectId as string, 10) : undefined);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error fetching approval metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch approval metrics',
    });
  }
});

/**
 * GET /api/metrics/reconciliation
 * Get reconciliation metrics
 */
router.get('/reconciliation', requireAuth, requireRole(['ADMIN', 'SUPERVISOR']), async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const metrics = await getReconciliationMetrics(projectId ? parseInt(projectId as string, 10) : undefined);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error fetching reconciliation metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reconciliation metrics',
    });
  }
});

export default router;
