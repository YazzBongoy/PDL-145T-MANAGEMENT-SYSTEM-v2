import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import jwt from 'jsonwebtoken';
import { JWTPayload, AuthenticatedRequest } from '../types/express.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Validation middleware factory
export function validateSchema<T extends ZodSchema>(
  schema: T,
  target: 'body' | 'params' | 'query' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[target];
      const validatedData = schema.parse(dataToValidate);
      
      // Replace the original data with validated data
      (req as any)[target] = validatedData;
      
      next();
    } catch (error) {
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
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid token.' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
    return;
  }
}

// Role-based access control middleware
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    
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
export function errorHandler(err: Error, _req: Request, res: Response, next: NextFunction): void {
  console.error('Error:', err);
  
  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    console.error('Prisma error details:', (err as any).code, (err as any).meta);
    res.status(400).json({ error: 'Database operation failed', code: (err as any).code, details: (err as any).meta });
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
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Rate limiting middleware (basic implementation)
const requestCounts: { [key: string]: { count: number; resetTime: number } } = {};

export function rateLimit(windowMs: number = 15 * 60 * 1000, max: number = 100) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    if (!requestCounts[clientId] || now > requestCounts[clientId].resetTime) {
      requestCounts[clientId] = {
        count: 1,
        resetTime: now + windowMs,
      };
    } else {
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
