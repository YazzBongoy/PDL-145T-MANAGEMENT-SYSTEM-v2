import { PrismaClient } from '@prisma/client';
import { logAudit, logExpenseHistory } from '../middleware/auditMiddleware.js';

const prisma = new PrismaClient();

// Local type definitions until Prisma client is generated
type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
type ApprovalLevel = 'LEVEL_1_RL' | 'LEVEL_2_RC' | 'LEVEL_3_CQ' | 'LEVEL_4_CFEF';
type UserRole = 'USER' | 'ADMIN' | 'SUPERVISOR' | 'FINANCE' | 'CONSTRUCTION';

interface ApprovalRequest {
  expenseId: number;
  level: number; // 1, 2, 3, or 4
  userId: number;
  userRole: UserRole;
  status: 'Approved' | 'Rejected';
  notes: string;
}

/**
 * Get approval queue for a user based on their role
 */
export async function getApprovalQueue(userRole: UserRole, userId?: number) {
  const whereCondition: Record<string, any> = {};

  // Filter by role
  switch (userRole) {
    case 'FINANCE': // RL - Responsable Logistique
      whereCondition.currentLevel = 'LEVEL_1_RL';
      whereCondition.level1_status = 'Pending';
      break;
    case 'SUPERVISOR': // RC - Responsable Comptable
      whereCondition.currentLevel = 'LEVEL_2_RC';
      whereCondition.level2_status = 'Pending';
      break;
    case 'ADMIN': // CQ - Coordinateur Qualité
      whereCondition.currentLevel = 'LEVEL_3_CQ';
      whereCondition.level3_status = 'Pending';
      break;
    // CFEF Commission handled separately (multiple admins)
  }

  try {
    const workflows = await prisma.approvalWorkflow.findMany({
      where: whereCondition,
      include: {
        expense: {
          include: {
            Task: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return workflows;
  } catch (error) {
    console.error('Error fetching approval queue:', error);
    return [];
  }
}

/**
 * Process approval at a specific level
 */
export async function approveExpense(request: ApprovalRequest) {
  const { expenseId, level, userId, userRole, status, notes } = request;

  try {
    // Validate user role matches the level
    const validRoles: { [key in ApprovalLevel]: UserRole[] } = {
      'LEVEL_1_RL': ['FINANCE'], // RL
      'LEVEL_2_RC': ['SUPERVISOR'], // RC
      'LEVEL_3_CQ': ['ADMIN'], // CQ
      'LEVEL_4_CFEF': ['ADMIN', 'SUPERVISOR'], // CFEF Commission
    };

    const currentLevel = `LEVEL_${level}_${['RL', 'RC', 'CQ', 'CFEF'][level - 1]}` as ApprovalLevel;

    if (!validRoles[currentLevel]?.includes(userRole)) {
      throw new Error(`User role ${userRole} not authorized for level ${level}`);
    }

    const workflow = await prisma.approvalWorkflow.findUnique({
      where: { expenseId },
    });

    if (!workflow) {
      throw new Error(`No approval workflow found for expense ${expenseId}`);
    }

    const updateData: Record<string, any> = {};

    // Update the appropriate level
    if (level === 1) {
      updateData.level1_status = status;
      updateData.level1_approver = userId;
      updateData.level1_date = new Date();
      updateData.level1_notes = notes;
    } else if (level === 2) {
      updateData.level2_status = status;
      updateData.level2_approver = userId;
      updateData.level2_date = new Date();
      updateData.level2_notes = notes;
    } else if (level === 3) {
      updateData.level3_status = status;
      updateData.level3_approver = userId;
      updateData.level3_date = new Date();
      updateData.level3_notes = notes;
    } else if (level === 4) {
      updateData.level4_status = status;
      updateData.level4_approver = userId;
      updateData.level4_date = new Date();
      updateData.level4_notes = notes;

      // If CFEF approves, unlock payment
      if (status === 'Approved') {
        updateData.paymentBlockedUntil = null;
      }
    }

    // If rejected, revert to level 1
    if (status === 'Rejected') {
      updateData.currentLevel = 'LEVEL_1_RL';
      updateData.level1_status = 'Pending';
      updateData.level1_approver = null;
      updateData.level1_date = null;
      updateData.level1_notes = null;
      updateData.level2_status = 'Pending';
      updateData.level3_status = 'Pending';
      updateData.level4_status = 'Pending';
    } else {
      // Move to next level if approved
      updateData.currentLevel = getNextLevel(level);
    }

    const updated = await prisma.approvalWorkflow.update({
      where: { expenseId },
      data: updateData,
    });

    // Log the approval action
    await logAudit({
      entityType: 'ApprovalWorkflow',
      entityId: expenseId,
      action: status === 'Rejected' ? 'REJECT' : 'APPROVE',
      userId,
      changes: { level, status, reason: notes },
      reason: notes,
    });

    // Log expense history
    const levelStatusKey = `level${level}_status` as const;
    const oldStatus = (workflow as any)[levelStatusKey];
    await logExpenseHistory(
      expenseId,
      `approval_level_${level}`,
      oldStatus,
      status,
      userId,
    );

    return updated;
  } catch (error) {
    console.error('Error processing approval:', error);
    throw error;
  }
}

/**
 * Get next approval level
 */
function getNextLevel(currentLevel: number): ApprovalLevel {
  const levels: ApprovalLevel[] = [
    'LEVEL_1_RL',
    'LEVEL_2_RC',
    'LEVEL_3_CQ',
    'LEVEL_4_CFEF',
  ];
  return levels[currentLevel] || 'LEVEL_4_CFEF';
}

/**
 * Get approval workflow status for an expense
 */
export async function getApprovalStatus(expenseId: number) {
  try {
    const workflow = await prisma.approvalWorkflow.findUnique({
      where: { expenseId },
      include: {
        expense: true,
        level1User: { select: { id: true, name: true, email: true } },
        level2User: { select: { id: true, name: true, email: true } },
        level3User: { select: { id: true, name: true, email: true } },
        level4User: { select: { id: true, name: true, email: true } },
      },
    });

    if (!workflow) {
      throw new Error(`No approval workflow found for expense ${expenseId}`);
    }

    // Build human-readable status
    const status = {
      expense: workflow.expense,
      currentLevel: workflow.currentLevel,
      paymentBlocked: !!workflow.paymentBlockedUntil,
      levels: {
        level1_RL: {
          status: workflow.level1_status,
          approver: workflow.level1User,
          date: workflow.level1_date,
          notes: workflow.level1_notes,
        },
        level2_RC: {
          status: workflow.level2_status,
          approver: workflow.level2User,
          date: workflow.level2_date,
          notes: workflow.level2_notes,
        },
        level3_CQ: {
          status: workflow.level3_status,
          approver: workflow.level3User,
          date: workflow.level3_date,
          notes: workflow.level3_notes,
        },
        level4_CFEF: {
          status: workflow.level4_status,
          approver: workflow.level4User,
          date: workflow.level4_date,
          notes: workflow.level4_notes,
        },
      },
      createdAt: workflow.createdAt,
      completedAt: workflow.completedAt,
    };

    return status;
  } catch (error) {
    console.error('Error getting approval status:', error);
    throw error;
  }
}

/**
 * Check if expense is payment ready (CFEF approved)
 */
export async function isPaymentReady(expenseId: number): Promise<boolean> {
  try {
    const workflow = await prisma.approvalWorkflow.findUnique({
      where: { expenseId },
    });

    if (!workflow) {
      return false;
    }

    return (
      workflow.level1_status === 'Approved' &&
      workflow.level2_status === 'Approved' &&
      workflow.level3_status === 'Approved' &&
      workflow.level4_status === 'Approved' &&
      !workflow.paymentBlockedUntil
    );
  } catch (error) {
    console.error('Error checking payment ready:', error);
    return false;
  }
}
