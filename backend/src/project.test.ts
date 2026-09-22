import request from 'supertest';
import { app, prisma } from './index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config/env.js';

describe('Project CRUD Endpoints', () => {
  let adminToken: string;
  let userToken: string;
  let projectId: number;
  const adminEmail = 'admin@project.test';
  const userEmail = 'user@project.test';
  const password = 'testpassword';

  beforeAll(async () => {
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({ where: { email: { in: [adminEmail, userEmail] } } });

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
    adminToken = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, config.jwtSecret, { expiresIn: '1d' });
    userToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '1d' });
  });

  afterAll(async () => {
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({ where: { email: { in: [adminEmail, userEmail] } } });
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
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.total).toBeGreaterThan(0);
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
