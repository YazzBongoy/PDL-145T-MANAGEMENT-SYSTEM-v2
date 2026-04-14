import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
/**
 * Audit Middleware - Automatically logs all operations
 * To use: attach auditLog data to request, then call logAudit() after operation
 */
export const auditMiddleware = (req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    // Override json method to capture the response and log audit
    res.json = function (data) {
        // Log audit after successful operation
        if (req.auditLog && res.statusCode < 400) {
            logAudit(req.auditLog).catch((err) => {
                console.error('Audit logging failed:', err);
            });
        }
        return originalJson.call(this, data);
    };
    next();
};
/**
 * Log an audit entry
 */
export async function logAudit(auditData) {
    try {
        await prisma.auditLog.create({
            data: {
                entityType: auditData.entityType,
                entityId: auditData.entityId || 0,
                action: auditData.action,
                userId: auditData.userId || 0,
                changes: auditData.changes || undefined,
                reason: auditData.reason,
            },
        });
    }
    catch (error) {
        console.error('Error creating audit log:', error);
    }
}
/**
 * Log expense history changes
 */
export async function logExpenseHistory(expenseId, fieldName, oldValue, newValue, changedBy) {
    try {
        await prisma.expenseHistory.create({
            data: {
                expenseId,
                fieldName,
                oldValue,
                newValue,
                changedBy,
            },
        });
    }
    catch (error) {
        console.error('Error logging expense history:', error);
    }
}
/**
 * Get audit trail for an entity
 */
export async function getAuditTrail(entityType, entityId) {
    try {
        return await prisma.auditLog.findMany({
            where: {
                entityType,
                entityId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                timestamp: 'desc',
            },
        });
    }
    catch (error) {
        console.error('Error fetching audit trail:', error);
        return [];
    }
}
/**
 * Get expense history
 */
export async function getExpenseHistory(expenseId) {
    try {
        return await prisma.expenseHistory.findMany({
            where: { expenseId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                changedAt: 'desc',
            },
        });
    }
    catch (error) {
        console.error('Error fetching expense history:', error);
        return [];
    }
}
