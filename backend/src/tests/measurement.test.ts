import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

describe('Measurement Endpoints', () => {
  let adminToken: string;
  let constructionToken: string;
  let userToken: string;
  let projectId: number;
  let taskId: number;
  let measurementId: number;
  let siteId: string;
  let territoryId: number;

  const adminEmail = 'admin@measurement.test';
  const constructionEmail = 'construction@measurement.test';
  const userEmail = 'user@measurement.test';
  const password = 'testpassword';

  beforeAll(async () => {
    await prisma.measurement.deleteMany({});
    await prisma.validation.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.site.deleteMany({});
    await prisma.territory.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, constructionEmail, userEmail] } },
    });

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

    adminToken = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, config.jwtSecret, { expiresIn: '1d' });
    constructionToken = jwt.sign({ id: constructionUser.id, email: constructionUser.email, role: constructionUser.role }, config.jwtSecret, { expiresIn: '1d' });
    userToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '1d' });

    const territory = await prisma.territory.create({
      data: { Name: 'Test Territory' },
    });
    territoryId = territory.TerritoryID;

    const site = await prisma.site.create({
      data: {
        SiteID: 'SITE001',
        Name: 'Test Site',
        Type: 'CENTRE_DE_SANTE',
        Province: 'Mai-Ndombe',
        TerritoryID: territoryId,
      },
    });
    siteId = site.SiteID;

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
    await prisma.measurement.deleteMany({});
    await prisma.validation.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.site.deleteMany({});
    await prisma.territory.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, constructionEmail, userEmail] } },
    });
  });

  describe('POST /api/measurements/task/:taskId', () => {
    it('should allow CONSTRUCTION user to create a measurement', async () => {
      const measurementData = {
        SiteID: siteId,
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
      measurementId = res.body.MeasurementID;
    });

    it('should not allow USER to create a measurement', async () => {
      const measurementData = {
        SiteID: siteId,
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
      expect(Number(res.body.Value)).toBe(updateData.Value);
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
  });

  describe('Authentication', () => {
    it('should require authentication for all endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/api/measurements' },
        { method: 'post', path: `/api/measurements/task/${taskId}` },
      ];

      for (const endpoint of endpoints) {
        const res = await (request(app) as unknown as Record<string, (path: string) => request.Test>)[endpoint.method](endpoint.path);
        expect(res.status).toBe(401);
      }
    });
  });
});
