import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Import routes
import measurementRoutes from './routes/measurementRoutes.js';
import validationRoutes from './routes/validationRoutes.js';
// import projectRoutes from './routes/projectRoutes.js';
// import taskRoutes from './routes/taskRoutes.js';
// import expenseRoutes from './routes/expenseRoutes.js';
// import resourceRoutes from './routes/resourceRoutes.js';
// import reportRoutes from './routes/reportRoutes.js';

// Import middleware and types
import { authenticateJWT, requireAdminOrSupervisor, errorHandler } from './middleware/index.js';
import { AuthenticatedRequest } from './types/express.js';

// Initialize environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3010;

// Initialize Prisma client
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

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

// API routes
app.use('/api/measurements', measurementRoutes);
app.use('/api/validations', validationRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/expenses', expenseRoutes);
// app.use('/api/resources', resourceRoutes);
// app.use('/api/reports', reportRoutes);

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
  const { Name, StartDate, EndDate, TotalBudget } = req.body;
  if (!Name || !StartDate || !TotalBudget) {
    res.status(400).json({ error: 'Name, StartDate, and TotalBudget are required.' });
    return;
  }
  const project = await prisma.project.create({
    data: {
      Name,
      StartDate: new Date(StartDate),
      EndDate: EndDate ? new Date(EndDate) : null,
      TotalBudget: Number(TotalBudget),
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
  const { Description, Duration, AssignedTo, CompletionStatus } = req.body;
  if (!Description) {
    res.status(400).json({ error: 'Description is required.' });
    return;
  }
  const task = await prisma.task.create({
    data: {
      ProjectID: projectId,
      Description,
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

// Update Task
app.put('/api/tasks/:id', authenticateJWT, requireAdminOrSupervisor, async (req, res) => {
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
  const { Type, Quantity } = req.body;
  if (!Type || Quantity === undefined) {
    res.status(400).json({ error: 'Type and Quantity are required.' });
    return;
  }
  const resource = await prisma.resource.create({
    data: {
      Type,
      Quantity: Number(Quantity),
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
  const { Type, Quantity } = req.body;
  const resource = await prisma.resource.findUnique({ where: { ResourceID: id } });
  if (!resource) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }
  const updated = await prisma.resource.update({
    where: { ResourceID: id },
    data: {
      Type: Type ?? resource.Type,
      Quantity: Quantity !== undefined ? Number(Quantity) : resource.Quantity,
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
