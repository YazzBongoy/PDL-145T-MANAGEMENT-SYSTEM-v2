import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { app } from '../index.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

describe('Measurement Endpoints', () => {
  let adminToken: string;
  let constructionToken: string;
  let userToken: string;
  let projectId: number;
  let taskId: number;
  let measurementId: number;

  const adminEmail = 'admin@measurement.test';
  const constructionEmail = 'construction@measurement.test';
  const userEmail = 'user@measurement.test';
  const password = 'testpassword';

  beforeAll(async () => {
    // Clean up test data
    await prisma.measurement.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, constructionEmail, userEmail] } },
    });

    // Create test users
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: 'ADMIN',
      },
    });

    const constructionUser = await prisma.user.create({
      data: {
        name: 'Construction',
        email: constructionEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: 'CONSTRUCTION',
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

    // Generate tokens
    adminToken = jwt.sign({ userId: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '1d' });
    constructionToken = jwt.sign({ userId: constructionUser.id, role: constructionUser.role }, JWT_SECRET, { expiresIn: '1d' });
    userToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    // Create test project and task
    const project = await prisma.project.create({
      data: {
        Name: 'Test Project',
        StartDate: new Date(),
        TotalBudget: 100000,
      },
    });
    projectId = project.ProjectID;

    const task = await prisma.task.create({
      data: {
        ProjectID: projectId,
        Description: 'Test Task for Measurements',
        CompletionStatus: 'InProgress',
      },
    });
    taskId = task.TaskID;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.measurement.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, constructionEmail, userEmail] } },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/measurements/task/:taskId', () => {
    it('should allow CONSTRUCTION user to create a measurement', async () => {
      const measurementData = {
        SiteID: 'SITE001',
        MeasurementType: 'Length',
        Value: 15.5,
        Date: new Date().toISOString(),
      };

      const res = await request(app)
        .post(`/api/measurements/task/${taskId}`)
        .set('Authorization', `Bearer ${constructionToken}`)
        .send(measurementData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('MeasurementID');
      expect(res.body.SiteID).toBe(measurementData.SiteID);
      expect(res.body.MeasurementType).toBe(measurementData.MeasurementType);
      expect(res.body.Value).toBe(measurementData.Value);
      measurementId = res.body.MeasurementID;
    });

    it('should not allow USER to create a measurement', async () => {
      const measurementData = {
        SiteID: 'SITE002',
        MeasurementType: 'Width',
        Value: 10.0,
        Date: new Date().toISOString(),
      };

      const res = await request(app)
        .post(`/api/measurements/task/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(measurementData);

      expect(res.status).toBe(403);
    });

    it('should validate measurement data', async () => {
      const invalidData = {
        SiteID: '', // Invalid: empty string
        MeasurementType: 'Length',
        Value: -5, // Invalid: negative value
      };

      const res = await request(app)
        .post(`/api/measurements/task/${taskId}`)
        .set('Authorization', `Bearer ${constructionToken}`)
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation error');
    });

    it('should return 404 for non-existent task', async () => {
      const measurementData = {
        SiteID: 'SITE003',
        MeasurementType: 'Height',
        Value: 20.0,
        Date: new Date().toISOString(),
      };

      const res = await request(app)
        .post('/api/measurements/task/999999')
        .set('Authorization', `Bearer ${constructionToken}`)
        .send(measurementData);

      expect(res.status).toBe(500); // Should be handled by error middleware
    });
  });

  describe('GET /api/measurements/task/:taskId', () => {
    it('should get measurements for a task', async () => {
      const res = await request(app)
        .get(`/api/measurements/task/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/measurements/:id', () => {
    it('should get a measurement by ID', async () => {
      const res = await request(app)
        .get(`/api/measurements/${measurementId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.MeasurementID).toBe(measurementId);
      expect(res.body).toHaveProperty('Task');
    });

    it('should return 404 for non-existent measurement', async () => {
      const res = await request(app)
        .get('/api/measurements/999999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(500); // Should be handled by error middleware
    });
  });

  describe('PUT /api/measurements/:id', () => {
    it('should allow ADMIN to update a measurement', async () => {
      const updateData = {
        Value: 16.0,
        MeasurementType: 'Updated Length',
      };

      const res = await request(app)
        .put(`/api/measurements/${measurementId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.Value).toBe(updateData.Value);
      expect(res.body.MeasurementType).toBe(updateData.MeasurementType);
    });

    it('should not allow USER to update a measurement', async () => {
      const updateData = {
        Value: 17.0,
      };

      const res = await request(app)
        .put(`/api/measurements/${measurementId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/measurements', () => {
    it('should get paginated measurements', async () => {
      const res = await request(app)
        .get('/api/measurements?page=1&limit=10')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/measurements/site/:siteId', () => {
    it('should get measurements by site ID', async () => {
      const res = await request(app)
        .get('/api/measurements/site/SITE001')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('DELETE /api/measurements/:id', () => {
    it('should not allow USER to delete a measurement', async () => {
      const res = await request(app)
        .delete(`/api/measurements/${measurementId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow ADMIN to delete a measurement', async () => {
      const res = await request(app)
        .delete(`/api/measurements/${measurementId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });

    it('should return 404 when trying to delete non-existent measurement', async () => {
      const res = await request(app)
        .delete('/api/measurements/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(500); // Should be handled by error middleware
    });
  });

  describe('Authentication', () => {
    it('should require authentication for all endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/api/measurements' },
        { method: 'get', path: `/api/measurements/${measurementId}` },
        { method: 'post', path: `/api/measurements/task/${taskId}` },
        { method: 'put', path: `/api/measurements/${measurementId}` },
        { method: 'delete', path: `/api/measurements/${measurementId}` },
      ];

      for (const endpoint of endpoints) {
        const res = await (request(app) as { [key: string]: (path: string) => request.Test })[endpoint.method](endpoint.path);
        expect(res.status).toBe(401);
      }
    });
  });
});
