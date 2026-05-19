import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
/**
 * Middleware to verify user is authenticated via JWT
 */
export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required',
        });
    }
    try {
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, JWT_SECRET);
        // Attach user data to request
        req.user = payload;
        next();
    }
    catch {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
        });
    }
}
/**
 * Middleware to verify user has required role(s)
 */
export function requireRole(allowedRoles) {
    return (req, res, next) => {
        const user = req.user;
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
export const roleToApprovalLevel = {
    FINANCE: 1, // RL (Responsable Logistique)
    SUPERVISOR: 2, // RC (Responsable Comptable)
    ADMIN: 3, // CQ (Coordinateur Qualité)
    CFEF: 4, // CFEF Commission
};
/**
 * Get approval level for a user role
 */
export function getApprovalLevelForRole(role) {
    return roleToApprovalLevel[role] || -1;
}
/**
 * Middleware to ensure user can approve at a specific level
 */
export function canApproveAtLevel(requiredLevel) {
    return (req, res, next) => {
        const user = req.user;
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
