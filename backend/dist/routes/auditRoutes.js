import { Router } from 'express';
import { getAuditTrail, getExpenseHistory } from '../middleware/auditMiddleware.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
const router = Router();
/**
 * GET /api/audit/logs/:entityType/:entityId
 * Get audit trail for an entity
 */
router.get('/logs/:entityType/:entityId', requireAuth, async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const trail = await getAuditTrail(entityType, parseInt(entityId, 10));
        res.json({
            success: true,
            data: trail,
        });
    }
    catch (error) {
        console.error('Error fetching audit trail:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch audit trail',
        });
    }
});
/**
 * GET /api/audit/expense/:expenseId/history
 * Get full change history for an expense
 */
router.get('/expense/:expenseId/history', requireAuth, async (req, res) => {
    try {
        const { expenseId } = req.params;
        const history = await getExpenseHistory(parseInt(expenseId, 10));
        res.json({
            success: true,
            data: history,
        });
    }
    catch (error) {
        console.error('Error fetching expense history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch expense history',
        });
    }
});
/**
 * GET /api/audit/search
 * Search audit logs by filters
 */
router.get('/search', requireAuth, requireRole(['ADMIN', 'SUPERVISOR']), async (req, res) => {
    try {
        const { entityType, action, userId, startDate, endDate } = req.query;
        const where = {};
        if (entityType)
            where.entityType = entityType;
        if (action)
            where.action = action;
        if (userId)
            where.userId = parseInt(userId, 10);
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate)
                where.timestamp.gte = new Date(startDate);
            if (endDate)
                where.timestamp.lte = new Date(endDate);
        }
        const logs = await (req.app.locals.prisma).auditLog.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { timestamp: 'desc' },
            take: 100,
        });
        res.json({
            success: true,
            data: logs,
            count: logs.length,
        });
    }
    catch (error) {
        console.error('Error searching audit logs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search audit logs',
        });
    }
});
export default router;
