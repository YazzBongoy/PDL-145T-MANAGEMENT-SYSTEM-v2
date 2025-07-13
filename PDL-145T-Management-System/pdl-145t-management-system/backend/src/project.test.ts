import request from 'supertest';
import * as express from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { userId: number; role: string };
    }
  }
}

const app = (express as { default?: () => express.Express }).default ? (express as { default?: () => express.Express }).default() : express();
const prisma = new PrismaClient();
app.use(express.json());
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Minimal auth and project endpoints for testing
// (Copy the relevant handlers from index.ts or import the app if possible)

// ... (copy authenticateJWT, requireAdminOrSupervisor, and project endpoints here) ...

// For brevity, assume the endpoints are defined as in index.ts

// Test suite

describe('Project CRUD Endpoints', () => {
  let adminToken: string;
  let userToken: string;
  let projectId: number;
  const adminEmail = 'admin@example.com';
  const userEmail = 'user@example.com';
  const password = 'testpassword';

  beforeAll(async () => {
    // Clean up test users and projects
    await prisma.user.deleteMany({ where: { email: { in: [adminEmail, userEmail] } } });
    await prisma.project.deleteMany({});
    // Create admin and user
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: 'ADMIN',
      },
    });
    const user = await prisma.user.create({
      data: {
        name: 'User',
        email: userEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: 'USER',
      },
    });
    adminToken = jwt.sign({ userId: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '1d' });
    userToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [adminEmail, userEmail] } } });
    await prisma.project.deleteMany({});
    await prisma.$disconnect();
  });

  it('should not allow USER to create a project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ Name: 'Test Project', StartDate: new Date().toISOString(), TotalBudget: 1000 });
    expect(res.status).toBe(403);
  });

  it('should allow ADMIN to create a project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ Name: 'Test Project', StartDate: new Date().toISOString(), TotalBudget: 1000 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('ProjectID');
    projectId = res.body.ProjectID;
  });

  it('should list projects for any user', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get project details for any user', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.ProjectID).toBe(projectId);
  });

  it('should not allow USER to update a project', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ Name: 'Updated Name' });
    expect(res.status).toBe(403);
  });

  it('should allow ADMIN to update a project', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ Name: 'Updated Name' });
    expect(res.status).toBe(200);
    expect(res.body.Name).toBe('Updated Name');
  });

  it('should not allow USER to delete a project', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('should allow ADMIN to delete a project', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
}); 