import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { execSync } from 'child_process';

// Import routes
import measurementRoutes from './routes/measurementRoutes.js';
import validationRoutes from './routes/validationRoutes.js';
import tasksRoutes from './routes/taskRoutes.js';
import expensesRoutes from './routes/expensesRoutes.js';
import resourcesRoutes from './routes/resourcesRoutes.js';
import sprintRoutes from './routes/sprintRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import approvalRoutes from './routes/approvalRoutes.js';
import reconciliationRoutes from './routes/reconciliationRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import programRoutes from './routes/programRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import constructionStepsRoutes from './routes/constructionStepsRoutes.js';

// Import middleware and types
import { authenticateJWT, requireAdminOrSupervisor, errorHandler } from './middleware/index.js';
import { AuthenticatedRequest } from './types/express.js';

// Initialize environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8001;

// Initialize Prisma client
const prisma = new PrismaClient();

// Middleware - CORS configuration for Render.com and local development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://pdl145t-frontend.onrender.com',
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Store prisma client in app locals for route access
app.locals.prisma = prisma;

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the PDL-145T Management System API' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Emergency migration endpoint (for Render deployment issues)
app.post('/api/admin/migrate', async (req, res) => {
  try {
    // First: Run prisma migrate deploy
    let migrateOutput = '';
    try {
      migrateOutput = execSync('npx prisma migrate deploy', {
        cwd: '/opt/render/project/src/backend',
        encoding: 'utf-8',
        stdio: 'pipe'
      });
    } catch (migrateError: any) {
      migrateOutput = migrateError.stdout || migrateError.message;
    }
    
    // Second: Always run db push to ensure schema is in sync
    let pushOutput = '';
    try {
      pushOutput = execSync('npx prisma db push --accept-data-loss', {
        cwd: '/opt/render/project/src/backend',
        encoding: 'utf-8',
        stdio: 'pipe'
      });
    } catch (pushError: any) {
      pushOutput = pushError.stdout || pushError.message;
    }
    
    res.json({
      success: true,
      message: 'Migrations and schema sync completed',
      migrateOutput: migrateOutput,
      pushOutput: pushOutput
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Migration process failed',
      details: error?.message || 'Unknown error'
    });
  }
});

// FORCE RESET - Drop and recreate all tables
app.post('/api/admin/reset-schema', async (req, res) => {
  try {
    const results: any = { steps: [] };
    
    // Step 1: Drop migration history
    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS "_prisma_migrations" CASCADE`;
      results.steps.push({ step: 1, action: 'Drop _prisma_migrations', status: 'success' });
    } catch (e: any) {
      results.steps.push({ step: 1, action: 'Drop _prisma_migrations', status: 'skipped', error: e.message });
    }
    
    // Step 2: Drop all tables in schema
    const tables = ['Reconciliation', 'ApprovalHistory', 'ApprovalAction', 'AuditLog', 
                    'Expense', 'Device', 'Resource', 'Measurement', 'Validation', 
                    'SubTask', 'Task', 'Sprint', 'Report', 'ProjectResource', 
                    'Project', 'Program', 'User', 'Session'];
    
    for (const table of tables) {
      try {
        await prisma.$executeRaw`DROP TABLE IF EXISTS "${table}" CASCADE`;
        results.steps.push({ step: 2, action: `Drop ${table}`, status: 'success' });
      } catch (e: any) {
        results.steps.push({ step: 2, action: `Drop ${table}`, status: 'skipped' });
      }
    }
    
    // Step 3: Run prisma migrate reset --force
    let resetOutput = '';
    try {
      resetOutput = execSync('npx prisma migrate reset --force --skip-generate', {
        cwd: '/opt/render/project/src/backend',
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 120000
      });
      results.steps.push({ step: 3, action: 'prisma migrate reset', status: 'success', output: resetOutput.substring(0, 500) });
    } catch (e: any) {
      resetOutput = e.stdout || e.message;
      results.steps.push({ step: 3, action: 'prisma migrate reset', status: 'error', output: resetOutput.substring(0, 500) });
    }
    
    // Step 4: Run prisma db push as fallback
    let pushOutput = '';
    try {
      pushOutput = execSync('npx prisma db push --accept-data-loss', {
        cwd: '/opt/render/project/src/backend',
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 120000
      });
      results.steps.push({ step: 4, action: 'prisma db push', status: 'success', output: pushOutput.substring(0, 500) });
    } catch (e: any) {
      pushOutput = e.stdout || e.message;
      results.steps.push({ step: 4, action: 'prisma db push', status: 'error', output: pushOutput.substring(0, 500) });
    }
    
    res.json({
      success: true,
      message: 'Schema reset attempted - check steps for details',
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Schema reset failed',
      details: error?.message || 'Unknown error'
    });
  }
});

// Debug endpoint - capture exact errors from Prisma
app.get('/api/admin/debug', async (req, res) => {
  const debug: any = {
    timestamp: new Date().toISOString(),
    tests: {}
  };
  
  // Test 1: Simple query
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    debug.tests.rawQuery = { success: true, result };
  } catch (e: any) {
    debug.tests.rawQuery = { success: false, error: e.message, code: e.code };
  }
  
  // Test 2: Prisma model query
  try {
    const result = await prisma.program.findMany({ take: 1 });
    debug.tests.programQuery = { success: true, count: result.length };
  } catch (e: any) {
    debug.tests.programQuery = { 
      success: false, 
      error: e.message, 
      code: e.code,
      meta: e.meta
    };
  }
  
  // Test 3: Create without relations
  try {
    const testProg = await prisma.program.create({
      data: {
        Name: 'TEST-DEBUG',
        Description: 'Debug test'
      }
    });
    debug.tests.programCreate = { success: true, id: testProg.ProgramID };
    // Cleanup
    await prisma.program.delete({ where: { ProgramID: testProg.ProgramID } });
  } catch (e: any) {
    debug.tests.programCreate = { 
      success: false, 
      error: e.message, 
      code: e.code,
      meta: e.meta
    };
  }
  
  res.json(debug);
});

// Diagnostic endpoint - check database state
app.get('/api/admin/diagnostic', async (req, res) => {
  try {
    // Check if tables exist by querying them
    const results: any = {};
    
    try {
      const programs: any = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Program"`;
      results.programs = { exists: true, count: Number(programs[0]?.count || 0) };
    } catch (e: any) {
      results.programs = { exists: false, error: e.message };
    }
    
    try {
      const projects: any = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Project"`;
      results.projects = { exists: true, count: Number(projects[0]?.count || 0) };
    } catch (e: any) {
      results.projects = { exists: false, error: e.message };
    }
    
    try {
      const users: any = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "User"`;
      results.users = { exists: true, count: Number(users[0]?.count || 0) };
    } catch (e: any) {
      results.users = { exists: false, error: e.message };
    }
    
    res.json({
      database: 'connected',
      tables: results
    });
  } catch (error: any) {
    res.status(500).json({
      database: 'error',
      error: error.message
    });
  }
});

// API routes
app.use('/api/measurements', measurementRoutes);
app.use('/api/validations', validationRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/reconciliation', reconciliationRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/construction-steps', constructionStepsRoutes);

// User registration
app.post('/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required.' });
    return;
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Email already registered.' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: role || 'USER' },
  });
  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// User login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Database operation failed', details: error instanceof Error ? error.message : String(error) });
  }
});

// Middleware functions are now imported from ./middleware/index.js

// Example protected route
app.get('/me', authenticateJWT, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const user = await prisma.user.findUnique({ where: { id: authReq.user.userId } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// Create Project
app.post('/api/projects', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const { Name, StartDate, EndDate, TotalBudget, ProgramID } = req.body;
  if (!Name || !StartDate || !TotalBudget || !ProgramID) {
    res.status(400).json({ error: 'Name, StartDate, TotalBudget, and ProgramID are required.' });
    return;
  }
  const project = await prisma.project.create({
    data: {
      Name,
      StartDate: new Date(StartDate),
      EndDate: EndDate ? new Date(EndDate) : null,
      TotalBudget: Number(TotalBudget),
      ProgramID: Number(ProgramID),
    },
  });
  res.status(201).json(project);
});

// List Projects
app.get('/api/projects', authenticateJWT, async (req, res) => {
  const projects = await prisma.project.findMany({ orderBy: { CreatedAt: 'desc' } });
  res.json(projects);
});

// Get Project Details
app.get('/api/projects/:id', authenticateJWT, async (req, res) => {
  const id = Number(req.params.id);
  const project = await prisma.project.findUnique({ where: { ProjectID: id } });
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json(project);
});

// Update Project
app.put('/api/projects/:id', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const id = Number(req.params.id);
  const { Name, StartDate, EndDate, TotalBudget } = req.body;
  const project = await prisma.project.findUnique({ where: { ProjectID: id } });
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  const updated = await prisma.project.update({
    where: { ProjectID: id },
    data: {
      Name: Name ?? project.Name,
      StartDate: StartDate ? new Date(StartDate) : project.StartDate,
      EndDate: EndDate ? new Date(EndDate) : project.EndDate,
      TotalBudget: TotalBudget !== undefined ? Number(TotalBudget) : project.TotalBudget,
    },
  });
  res.json(updated);
});

// Delete Project
app.delete('/api/projects/:id', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const id = Number(req.params.id);
  const project = await prisma.project.findUnique({ where: { ProjectID: id } });
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  await prisma.project.delete({ where: { ProjectID: id } });
  res.json({ success: true });
});

// Create Task
app.post('/api/projects/:projectId/tasks', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const projectId = Number(req.params.projectId);
  const { Name, Description, Duration, AssignedTo, CompletionStatus } = req.body;
  if (!Name) {
    res.status(400).json({ error: 'Name is required.' });
    return;
  }
  const task = await prisma.task.create({
    data: {
      ProjectID: projectId,
      Name,
      Description: Description || null,
      Duration: Duration ? Number(Duration) : null,
      AssignedTo: AssignedTo || null,
      CompletionStatus: CompletionStatus || 'NotStarted',
    },
  });
  res.status(201).json(task);
});

// List Tasks by Project
app.get('/api/projects/:projectId/tasks', authenticateJWT, async (req, res) => {
  const projectId = Number(req.params.projectId);
  const tasks = await prisma.task.findMany({ where: { ProjectID: projectId }, orderBy: { CreatedAt: 'desc' } });
  res.json(tasks);
});

// Get Task Details
app.get('/api/tasks/:id', authenticateJWT, async (req, res) => {
  const id = Number(req.params.id);
  const task = await prisma.task.findUnique({ where: { TaskID: id } });
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(task);
});

// Update Task (construction users can update status, admin/supervisor can update all fields)
app.put('/api/tasks/:id', authenticateJWT, async (req, res) => {
  const id = Number(req.params.id);
  const { Description, Duration, AssignedTo, CompletionStatus } = req.body;
  const task = await prisma.task.findUnique({ where: { TaskID: id } });
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  const updated = await prisma.task.update({
    where: { TaskID: id },
    data: {
      Description: Description ?? task.Description,
      Duration: Duration !== undefined ? Number(Duration) : task.Duration,
      AssignedTo: AssignedTo ?? task.AssignedTo,
      CompletionStatus: CompletionStatus ?? task.CompletionStatus,
    },
  });
  res.json(updated);
});

// Delete Task
app.delete('/api/tasks/:id', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const id = Number(req.params.id);
  const task = await prisma.task.findUnique({ where: { TaskID: id } });
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  await prisma.task.delete({ where: { TaskID: id } });
  res.json({ success: true });
});

// Create Resource
app.post('/api/resources', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const { Name, Type, Quantity, Description, Location, SerialNumber, Cost, PurchaseDate, LastMaintenance, NextMaintenance, Status } = req.body;
  if (!Name || !Type) {
    res.status(400).json({ error: 'Name and Type are required.' });
    return;
  }
  const resource = await prisma.resource.create({
    data: {
      Name,
      Type,
      Quantity: Quantity !== undefined ? Number(Quantity) : 1,
      Description: Description || null,
      Location: Location || null,
      SerialNumber: SerialNumber || null,
      Cost: Cost !== undefined ? Number(Cost) : null,
      PurchaseDate: PurchaseDate ? new Date(PurchaseDate) : null,
      LastMaintenance: LastMaintenance ? new Date(LastMaintenance) : null,
      NextMaintenance: NextMaintenance ? new Date(NextMaintenance) : null,
      Status: Status || 'active',
    },
  });
  res.status(201).json(resource);
});

// List Resources
app.get('/api/resources', authenticateJWT, async (req, res) => {
  const resources = await prisma.resource.findMany({ orderBy: { CreatedAt: 'desc' } });
  res.json(resources);
});

// Update Resource
app.put('/api/resources/:id', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const id = Number(req.params.id);
  const { Name, Type, Quantity, Description, Location, SerialNumber, Cost, PurchaseDate, LastMaintenance, NextMaintenance, Status } = req.body;
  const resource = await prisma.resource.findUnique({ where: { ResourceID: id } });
  if (!resource) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }
  const updated = await prisma.resource.update({
    where: { ResourceID: id },
    data: {
      Name: Name ?? resource.Name,
      Type: Type ?? resource.Type,
      Quantity: Quantity !== undefined ? Number(Quantity) : resource.Quantity,
      Description: Description !== undefined ? Description : resource.Description,
      Location: Location !== undefined ? Location : resource.Location,
      SerialNumber: SerialNumber !== undefined ? SerialNumber : resource.SerialNumber,
      Cost: Cost !== undefined ? Number(Cost) : resource.Cost,
      PurchaseDate: PurchaseDate !== undefined ? (PurchaseDate ? new Date(PurchaseDate) : null) : resource.PurchaseDate,
      LastMaintenance: LastMaintenance !== undefined ? (LastMaintenance ? new Date(LastMaintenance) : null) : resource.LastMaintenance,
      NextMaintenance: NextMaintenance !== undefined ? (NextMaintenance ? new Date(NextMaintenance) : null) : resource.NextMaintenance,
      Status: Status ?? resource.Status,
    },
  });
  res.json(updated);
});

// Delete Resource
app.delete('/api/resources/:id', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const id = Number(req.params.id);
  const resource = await prisma.resource.findUnique({ where: { ResourceID: id } });
  if (!resource) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }
  await prisma.resource.delete({ where: { ResourceID: id } });
  res.json({ success: true });
});

// Create Expense (linked to Task)
app.post('/api/tasks/:taskId/expenses', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const taskId = Number(req.params.taskId);
  const { Description, Cost, Date } = req.body;
  if (!Cost || !Date) {
    res.status(400).json({ error: 'Cost and Date are required.' });
    return;
  }
  const expense = await prisma.expense.create({
    data: {
      TaskID: taskId,
      Description: Description || null,
      Cost: Number(Cost),
      Date: new Date(Date),
    },
  });
  res.status(201).json(expense);
});

// List Expenses by Task
app.get('/api/tasks/:taskId/expenses', authenticateJWT, async (req, res) => {
  const taskId = Number(req.params.taskId);
  const expenses = await prisma.expense.findMany({ where: { TaskID: taskId }, orderBy: { Date: 'desc' } });
  res.json(expenses);
});

// Update Expense
app.put('/api/expenses/:id', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const id = Number(req.params.id);
  const { Description, Cost, Date } = req.body;
  const expense = await prisma.expense.findUnique({ where: { ExpenseID: id } });
  if (!expense) {
    res.status(404).json({ error: 'Expense not found' });
    return;
  }
  const updated = await prisma.expense.update({
    where: { ExpenseID: id },
    data: {
      Description: Description ?? expense.Description,
      Cost: Cost !== undefined ? Number(Cost) : expense.Cost,
      Date: Date ? new Date(Date) : expense.Date,
    },
  });
  res.json(updated);
});

// Delete Expense
app.delete('/api/expenses/:id', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
  const id = Number(req.params.id);
  const expense = await prisma.expense.findUnique({ where: { ExpenseID: id } });
  if (!expense) {
    res.status(404).json({ error: 'Expense not found' });
    return;
  }
  await prisma.expense.delete({ where: { ExpenseID: id } });
  res.json({ success: true });
});

// Error handling middleware
app.use(errorHandler);

// Start server
async function startServer(): Promise<void> {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Successfully connected to the database');
    
    // Start the server
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API endpoints available at http://localhost:${PORT}/api/`);
    });
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1);
  }
}

startServer();

export { app, prisma };

// Global type declarations are now in ./types/express.ts
