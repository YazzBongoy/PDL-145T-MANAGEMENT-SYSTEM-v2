import { Router, Request, Response } from 'express';
import {
  getApprovalQueue,
  approveExpense,
  getApprovalStatus,
  isPaymentReady,
} from '../services/approvalService';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

interface ApprovalRequest {
  level: number;
  status: 'Approved' | 'Rejected';
  notes: string;
}

/**
 * GET /api/approvals/pending
 * Get pending approvals for current user
 */
router.get('/pending', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const queue = await getApprovalQueue(userRole, userId);

    res.json({
      success: true,
      data: queue,
      count: queue.length,
    });
  } catch (error) {
    console.error('Error fetching approval queue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch approval queue',
    });
  }
});

/**
 * GET /api/approvals/:expenseId/status
 * Get full approval status for an expense
 */
router.get('/:expenseId/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const { expenseId } = req.params;
    const status = await getApprovalStatus(parseInt(expenseId, 10));

    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Approval workflow not found',
      });
    }

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Error fetching approval status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch approval status',
    });
  }
});

/**
 * PATCH /api/approvals/:expenseId/level/:level/:action
 * Approve or reject at a specific level
 * action: "approve" or "reject"
 */
router.patch(
  '/:expenseId/level/:level/:action',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { expenseId, level, action } = req.params;
      const { notes } = req.body;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      // Validate action
      if (!['approve', 'reject'].includes(action.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Use "approve" or "reject"',
        });
      }

      // Validate notes provided
      if (!notes || notes.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Justification notes required for all approval decisions',
        });
      }

      const approvalRequest = {
        expenseId: parseInt(expenseId, 10),
        level: parseInt(level, 10),
        userId,
        userRole,
        status: action.toLowerCase() === 'approve' ? ('Approved' as const) : ('Rejected' as const),
        notes,
      };

      const result = await approveExpense(approvalRequest);

      res.json({
        success: true,
        message: `Expense ${action.toLowerCase()}ed at level ${level}`,
        data: result,
      });
    } catch (error) {
      console.error('Error processing approval:', error);
      const message = (error as Error).message;
      res.status(400).json({
        success: false,
        error: message || 'Failed to process approval',
      });
    }
  },
);

/**
 * GET /api/approvals/:expenseId/payment-ready
 * Check if expense is ready for payment
 */
router.get('/:expenseId/payment-ready', requireAuth, async (req: Request, res: Response) => {
  try {
    const { expenseId } = req.params;
    const ready = await isPaymentReady(parseInt(expenseId, 10));

    res.json({
      success: true,
      data: {
        expenseId: parseInt(expenseId, 10),
        paymentReady: ready,
      },
    });
  } catch (error) {
    console.error('Error checking payment ready:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check payment status',
    });
  }
});

/**
 * GET /api/approvals/level/:level/queue
 * Get approval queue for a specific level (admin only)
 */
router.get('/level/:level/queue', requireAuth, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { level } = req.params;
    const levelMap: Record<string, string> = {
      '1': 'RL',
      '2': 'RC',
      '3': 'CQ',
      '4': 'CFEF',
    };

    const role = levelMap[level];
    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Invalid approval level (1-4)',
      });
    }

    // Get all pending at this level (not filtered by userId)
    const prisma = (req.app.locals.prisma);
    const pending = await prisma.approvalWorkflow.findMany({
      where: {
        [`level${level}_status`]: 'Pending',
      },
      include: {
        expense: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json({
      success: true,
      level: parseInt(level, 10),
      role,
      data: pending,
      count: pending.length,
    });
  } catch (error) {
    console.error('Error fetching level queue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch approval queue',
    });
  }
});

export default router;
