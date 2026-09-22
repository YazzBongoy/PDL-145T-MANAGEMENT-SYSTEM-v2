import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import { config } from './config/env.js';

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

// Initialize Express app
const app = express();

// Initialize Prisma client (singleton)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (config.nodeEnv !== 'production') globalForPrisma.prisma = prisma;

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

// Start server
async function startServer(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database');

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`API endpoints available at http://localhost:${config.port}/api/`);
    });
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1);
  }
}

startServer();

export { app, prisma };
