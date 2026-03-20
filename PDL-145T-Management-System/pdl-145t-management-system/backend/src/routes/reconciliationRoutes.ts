import { Router, Request, Response } from 'express';
import {
  createReconciliationAudit,
  matchInvoiceToPO,
  reportDiscrepancy,
  resolveDiscrepancy,
  getPendingReconciliations,
  getReconciliationHistory,
  generateReconciliationReport,
  getActiveDiscrepancies,
} from '../services/reconciliationService';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

/**
 * POST /api/reconciliation/audit
 * Create a new reconciliation audit entry
 */
router.post('/audit', requireAuth, requireRole(['ADMIN', 'CQ']), async (req: Request, res: Response) => {
  try {
    const { expenseId, invoiceId, purchaseOrderId } = req.body;
    const userId = (req as any).user.id;

    // Validate required fields
    if (!expenseId || !invoiceId) {
      return res.status(400).json({
        success: false,
        error: 'expenseId and invoiceId are required',
      });
    }

    const audit = await createReconciliationAudit({
      expenseId,
      invoiceId,
      purchaseOrderId,
      auditedBy: userId,
    });

    res.status(201).json({
      success: true,
      message: 'Reconciliation audit created',
      data: audit,
    });
  } catch (error) {
    console.error('Error creating reconciliation audit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create reconciliation audit',
    });
  }
});

/**
 * GET /api/reconciliation/pending
 * Get pending reconciliations
 */
router.get('/pending', requireAuth, requireRole(['ADMIN', 'CQ']), async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const pending = await getPendingReconciliations(limit);

    res.json({
      success: true,
      data: pending,
      count: pending.length,
    });
  } catch (error) {
    console.error('Error fetching pending reconciliations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending reconciliations',
    });
  }
});

/**
 * GET /api/reconciliation/discrepancies
 * Get active discrepancies
 */
router.get('/discrepancies', requireAuth, requireRole(['ADMIN', 'CQ']), async (req: Request, res: Response) => {
  try {
    const discrepancies = await getActiveDiscrepancies();

    res.json({
      success: true,
      data: discrepancies,
      count: discrepancies.length,
    });
  } catch (error) {
    console.error('Error fetching discrepancies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch discrepancies',
    });
  }
});

/**
 * POST /api/reconciliation/:auditId/match
 * Match invoice to purchase order
 */
router.post('/:auditId/match', requireAuth, requireRole(['ADMIN', 'CQ']), async (req: Request, res: Response) => {
  try {
    const { auditId } = req.params;
    const { invoiceId, purchaseOrderId } = req.body;
    const userId = (req as any).user.id;

    // Validate required fields
    if (!invoiceId || !purchaseOrderId) {
      return res.status(400).json({
        success: false,
        error: 'invoiceId and purchaseOrderId are required',
      });
    }

    const result = await matchInvoiceToPO(
      parseInt(auditId, 10),
      invoiceId,
      purchaseOrderId,
      userId,
    );

    if (result.matched) {
      res.json({
        success: true,
        message: 'Invoice successfully matched to PO',
        data: result,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invoice matching failed',
        data: result,
      });
    }
  } catch (error) {
    console.error('Error matching invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to match invoice',
    });
  }
});

/**
 * POST /api/reconciliation/:auditId/discrepancy
 * Report a discrepancy
 */
router.post('/:auditId/discrepancy', requireAuth, requireRole(['ADMIN', 'CQ']), async (req: Request, res: Response) => {
  try {
    const { auditId } = req.params;
    const { discrepancyReason } = req.body;
    const userId = (req as any).user.id;

    if (!discrepancyReason) {
      return res.status(400).json({
        success: false,
        error: 'discrepancyReason is required',
      });
    }

    const audit = await reportDiscrepancy(
      parseInt(auditId, 10),
      discrepancyReason,
      userId,
    );

    res.json({
      success: true,
      message: 'Discrepancy reported',
      data: audit,
    });
  } catch (error) {
    console.error('Error reporting discrepancy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to report discrepancy',
    });
  }
});

/**
 * PATCH /api/reconciliation/:auditId/resolve
 * Resolve a discrepancy
 */
router.patch('/:auditId/resolve', requireAuth, requireRole(['ADMIN', 'CQ']), async (req: Request, res: Response) => {
  try {
    const { auditId } = req.params;
    const { resolutionNotes } = req.body;
    const userId = (req as any).user.id;

    if (!resolutionNotes) {
      return res.status(400).json({
        success: false,
        error: 'resolutionNotes are required',
      });
    }

    const audit = await resolveDiscrepancy(
      parseInt(auditId, 10),
      resolutionNotes,
      userId,
    );

    res.json({
      success: true,
      message: 'Discrepancy resolved',
      data: audit,
    });
  } catch (error) {
    console.error('Error resolving discrepancy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve discrepancy',
    });
  }
});

/**
 * GET /api/reconciliation/expense/:expenseId/history
 * Get reconciliation history for an expense
 */
router.get('/expense/:expenseId/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const { expenseId } = req.params;
    const history = await getReconciliationHistory(parseInt(expenseId, 10));

    res.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    console.error('Error fetching reconciliation history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reconciliation history',
    });
  }
});

/**
 * GET /api/reconciliation/report
 * Generate bi-weekly reconciliation report
 */
router.get('/report', requireAuth, requireRole(['ADMIN', 'SUPERVISOR']), async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate query parameters are required (ISO format)',
      });
    }

    const report = await generateReconciliationReport(
      new Date(startDate as string),
      new Date(endDate as string),
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error generating reconciliation report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate reconciliation report',
    });
  }
});

export default router;
