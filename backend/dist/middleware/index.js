import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
// Validation middleware factory
export function validateSchema(schema, target = 'body') {
    return (req, res, next) => {
        try {
            const dataToValidate = req[target];
            const validatedData = schema.parse(dataToValidate);
            // Replace the original data with validated data
            req[target] = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    error: 'Validation error',
                    details: error.issues.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                });
                return;
            }
            res.status(400).json({ error: 'Invalid request data' });
            return;
        }
    };
}
// Authentication middleware
export function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid token.' });
        return;
    }
    try {
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid or expired token.' });
        return;
    }
}
// Role-based access control middleware
export function requireRole(allowedRoles) {
    return (req, res, next) => {
        const authReq = req;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (!allowedRoles.includes(authReq.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        next();
    };
}
// Specific role middleware functions
export const requireAdmin = requireRole(['ADMIN']);
export const requireAdminOrSupervisor = requireRole(['ADMIN', 'SUPERVISOR']);
export const requireFinance = requireRole(['ADMIN', 'FINANCE']);
export const requireConstruction = requireRole(['ADMIN', 'CONSTRUCTION']);
// Error handling middleware
export function errorHandler(err, _req, res, next) {
    console.error('Error:', err);
    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        console.error('Prisma error details:', err.code, err.meta);
        res.status(400).json({ error: 'Database operation failed', code: err.code, details: err.meta });
        return;
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
    // Handle validation errors
    if (err instanceof ZodError) {
        res.status(400).json({
            error: 'Validation error',
            details: err.issues,
        });
        return;
    }
    // Default error response
    res.status(500).json({ error: 'Internal server error' });
    next(); // Required for Express error handler signature
}
// Async error wrapper
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
// Rate limiting middleware (basic implementation)
const requestCounts = {};
export function rateLimit(windowMs = 15 * 60 * 1000, max = 100) {
    return (req, res, next) => {
        const clientId = req.ip || 'unknown';
        const now = Date.now();
        if (!requestCounts[clientId] || now > requestCounts[clientId].resetTime) {
            requestCounts[clientId] = {
                count: 1,
                resetTime: now + windowMs,
            };
        }
        else {
            requestCounts[clientId].count++;
        }
        if (requestCounts[clientId].count > max) {
            res.status(429).json({
                error: 'Too many requests, please try again later',
            });
            return;
        }
        next();
    };
}
