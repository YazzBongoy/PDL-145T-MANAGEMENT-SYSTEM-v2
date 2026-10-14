import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { prisma } from './prisma.js';

// Import routes
import measurementRoutes from './routes/measurementRoutes.js';
import validationRoutes from './routes/validationRoutes.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import resourceAssignmentRoutes from './routes/resourceAssignmentRoutes.js';

// Import middleware and types
import { authenticateJWT, errorHandler, rateLimit, cacheControl } from './middleware/index.js';
import { AuthenticatedRequest } from './types/express.js';

// Initialize Express app.
// This module builds the app only; the HTTP listener lives in index.ts so that
// tests can import the app (supertest) without binding a port.
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json());

// Test route
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to the PDL-145T Management System API' });
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', rateLimit(15 * 60 * 1000, 100), authRoutes);
app.use('/api/projects', cacheControl(30), projectRoutes);
app.use('/api/tasks', cacheControl(30), taskRoutes);
app.use('/api/expenses', cacheControl(30), expenseRoutes);
app.use('/api/resources', cacheControl(60), resourceRoutes);
app.use('/api/assignments', cacheControl(30), resourceAssignmentRoutes);
app.use('/api/measurements', cacheControl(15), measurementRoutes);
app.use('/api/validations', cacheControl(15), validationRoutes);
app.use('/api/documents', cacheControl(30), documentRoutes);
app.use('/api/reports', cacheControl(30), reportRoutes);
app.use('/api/dashboard', cacheControl(10), dashboardRoutes);

// Protected route: get current user
app.get('/me', authenticateJWT, async (req: Request, res: Response) => {
  const authReq = req as unknown as AuthenticatedRequest;
  const user = await prisma.user.findUnique({ where: { id: authReq.user.id } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// Error handling middleware
app.use(errorHandler);

export { app };
export default app;
