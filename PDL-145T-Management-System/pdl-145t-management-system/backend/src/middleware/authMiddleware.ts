import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to verify user is authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // In a real app, this would verify JWT token
  // For now, we'll check if user data exists in request
  const user = (req as any).user;

  if (!user || !user.id) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  next();
}

/**
 * Middleware to verify user has required role(s)
 */
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !user.role) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}

/**
 * User roles mapping to approval levels
 */
export const roleToApprovalLevel: Record<string, number> = {
  FINANCE: 1, // RL (Responsable Logistique)
  SUPERVISOR: 2, // RC (Responsable Comptable)
  ADMIN: 3, // CQ (Coordinateur Qualité)
  CFEF: 4, // CFEF Commission
};

/**
 * Get approval level for a user role
 */
export function getApprovalLevelForRole(role: string): number {
  return roleToApprovalLevel[role] || -1;
}

/**
 * Middleware to ensure user can approve at a specific level
 */
export function canApproveAtLevel(requiredLevel: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !user.role) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const userLevel = getApprovalLevelForRole(user.role);

    if (userLevel !== requiredLevel) {
      return res.status(403).json({
        success: false,
        error: `User role cannot approve at level ${requiredLevel}. Required role has approval level ${userLevel}`,
      });
    }

    next();
  };
}
