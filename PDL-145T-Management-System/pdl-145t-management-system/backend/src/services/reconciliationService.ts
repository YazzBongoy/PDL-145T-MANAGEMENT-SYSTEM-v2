import { PrismaClient } from '@prisma/client';
import { logAudit } from '../middleware/auditMiddleware.js';

const prisma = new PrismaClient();

// Local type definition until Prisma client is generated
type ReconciliationStatusType = 'Matched' | 'Discrepancy' | 'Pending' | 'Resolved';

interface ReconciliationData {
  expenseId: number;
  invoiceId: string;
  purchaseOrderId?: string;
  auditedBy: number;
}

interface MatchResult {
  invoiceId: string;
  purchaseOrderId: string;
  matched: boolean;
  discrepancy?: string;
}

/**
 * Create a reconciliation audit entry
 */
export async function createReconciliationAudit(data: ReconciliationData) {
  try {
    const audit = await prisma.reconciliationAudit.create({
      data: {
        expenseId: data.expenseId,
        invoiceId: data.invoiceId,
        purchaseOrderId: data.purchaseOrderId,
        auditedBy: data.auditedBy,
        status: 'Pending',
      },
    });

    // Log the audit creation
    await logAudit({
      entityType: 'ReconciliationAudit',
      entityId: data.expenseId,
      action: 'CREATE',
      userId: data.auditedBy,
      changes: { invoiceId: data.invoiceId },
      reason: 'Reconciliation audit initiated',
    });

    return audit;
  } catch (error) {
    console.error('Error creating reconciliation audit:', error);
    throw error;
  }
}

/**
 * Match invoice with purchase order
 */
export async function matchInvoiceToPO(
  auditId: number,
  invoiceId: string,
  purchaseOrderId: string,
  auditedBy: number,
): Promise<MatchResult> {
  const result: MatchResult = {
    invoiceId,
    purchaseOrderId,
    matched: true,
  };

  try {
    // In a real system, this would validate invoice details against PO
    // For now, we'll mark as matched
    await prisma.reconciliationAudit.update({
      where: { id: auditId },
      data: {
        purchaseOrderId,
        status: 'Matched',
        resolutionDate: new Date(),
        resolutionNotes: 'Matched to purchase order',
      },
    });

    // Log successful match
    await logAudit({
      entityType: 'ReconciliationAudit',
      entityId: auditId,
      action: 'APPROVE',
      userId: auditedBy,
      changes: { purchaseOrderId },
      reason: 'Invoice matched to PO',
    });
  } catch (error) {
    console.error('Error matching invoice to PO:', error);
    result.matched = false;
    result.discrepancy = (error as Error).message;
  }

  return result;
}

/**
 * Report a discrepancy
 */
export async function reportDiscrepancy(
  auditId: number,
  discrepancyReason: string,
  auditedBy: number,
) {
  try {
    const audit = await prisma.reconciliationAudit.update({
      where: { id: auditId },
      data: {
        status: 'Discrepancy',
        discrepancyReason,
      },
    });

    // Log the discrepancy
    await logAudit({
      entityType: 'ReconciliationAudit',
      entityId: auditId,
      action: 'UPDATE',
      userId: auditedBy,
      changes: { status: 'Discrepancy' },
      reason: discrepancyReason,
    });

    return audit;
  } catch (error) {
    console.error('Error reporting discrepancy:', error);
    throw error;
  }
}

/**
 * Resolve a discrepancy
 */
export async function resolveDiscrepancy(
  auditId: number,
  resolutionNotes: string,
  auditedBy: number,
) {
  try {
    const audit = await prisma.reconciliationAudit.update({
      where: { id: auditId },
      data: {
        status: 'Resolved',
        resolutionDate: new Date(),
        resolutionNotes,
      },
    });

    // Log the resolution
    await logAudit({
      entityType: 'ReconciliationAudit',
      entityId: auditId,
      action: 'APPROVE',
      userId: auditedBy,
      changes: { status: 'Resolved' },
      reason: resolutionNotes,
    });

    return audit;
  } catch (error) {
    console.error('Error resolving discrepancy:', error);
    throw error;
  }
}

/**
 * Get pending reconciliations
 */
export async function getPendingReconciliations(limit: number = 50) {
  try {
    return await prisma.reconciliationAudit.findMany({
      where: {
        status: {
          in: ['Pending', 'Discrepancy'],
        },
      },
      include: {
        expense: true,
        auditor: { select: { id: true, name: true, email: true } },
      },
      orderBy: {
        auditDate: 'asc',
      },
      take: limit,
    });
  } catch (error) {
    console.error('Error fetching pending reconciliations:', error);
    return [];
  }
}

/**
 * Get reconciliation audit history
 */
export async function getReconciliationHistory(expenseId: number) {
  try {
    return await prisma.reconciliationAudit.findMany({
      where: { expenseId },
      include: {
        auditor: { select: { id: true, name: true, email: true } },
      },
      orderBy: {
        auditDate: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching reconciliation history:', error);
    return [];
  }
}

/**
 * Generate reconciliation report (bi-weekly)
 */
export async function generateReconciliationReport(startDate: Date, endDate: Date) {
  try {
    const audits = await prisma.reconciliationAudit.findMany({
      where: {
        auditDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        expense: true,
        auditor: { select: { id: true, name: true, email: true } },
      },
    });

    const stats = {
      total: audits.length,
      matched: audits.filter((a: { status: string }) => a.status === 'Matched').length,
      discrepancies: audits.filter((a: { status: string }) => a.status === 'Discrepancy').length,
      pending: audits.filter((a: { status: string }) => a.status === 'Pending').length,
      resolved: audits.filter((a: { status: string }) => a.status === 'Resolved').length,
    };

    return {
      period: { startDate, endDate },
      statistics: stats,
      audits,
    };
  } catch (error) {
    console.error('Error generating reconciliation report:', error);
    throw error;
  }
}

/**
 * Get discrepancies requiring attention
 */
export async function getActiveDiscrepancies() {
  try {
    return await prisma.reconciliationAudit.findMany({
      where: {
        status: 'Discrepancy',
      },
      include: {
        expense: true,
        auditor: { select: { id: true, name: true, email: true } },
      },
      orderBy: {
        auditDate: 'asc',
      },
    });
  } catch (error) {
    console.error('Error fetching active discrepancies:', error);
    return [];
  }
}
