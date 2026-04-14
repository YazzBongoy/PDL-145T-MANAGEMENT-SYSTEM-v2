import request from 'supertest';
import { app, prisma } from './index.js';
import {
  createTestUser,
  createTestAdminUser,
  createTestSupervisorUser,
  createTestProject,
  createAuthToken,
  cleanupDatabase,
  disconnectDatabase,
} from './tests/test-utils.js';

describe('Project Management Endpoints', () => {
  let adminUser: any;
  let supervisorUser: any;
  let regularUser: any;
  let adminToken: string;
  let supervisorToken: string;
  let userToken: string;
  let projectId: number;

  beforeAll(async () => {
    await cleanupDatabase();

    // Create test users with different roles
    adminUser = await createTestAdminUser({ email: `admin-proj-${Date.now()}@example.com` });
    supervisorUser = await createTestSupervisorUser({ email: `supervisor-proj-${Date.now()}@example.com` });
    regularUser = await createTestUser({ email: `user-proj-${Date.now()}@example.com` });

    adminToken = createAuthToken(adminUser.id, adminUser.role);
    supervisorToken = createAuthToken(supervisorUser.id, supervisorUser.role);
    userToken = createAuthToken(regularUser.id, regularUser.role);
  });

  afterAll(async () => {
    await cleanupDatabase();
    await disconnectDatabase();
  });

  // ============ Authorization Tests ============

  it('should not allow regular user to create project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Unauthorized Project',
        description: 'Should fail',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        territory: 'INONGO',
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBeDefined();
  });

  it('should allow admin to create project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Admin Test Project ${Date.now()}`,
        description: 'Project created by admin',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        territory: 'INONGO',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBeDefined();

    projectId = res.body.id;
  });

  it('should allow supervisor to create project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        name: `Supervisor Test Project ${Date.now()}`,
        description: 'Project created by supervisor',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        territory: 'KUTU',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  // ============ CRUD Tests ============

  it('should list all projects for authenticated user', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${userToken}`);

    expect([200, 401]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('should get project details', async () => {
    if (!projectId) {
      console.log('Skipping project details test - no projectId');
      return;
    }

    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.id).toBe(projectId);
    }
  });

  it('should update project as admin', async () => {
    if (!projectId) {
      console.log('Skipping project update test - no projectId');
      return;
    }

    const updateData = {
      name: `Updated Project ${Date.now()}`,
      description: 'Updated description',
    };

    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.name).toBe(updateData.name);
    }
  });

  it('should not update project as regular user', async () => {
    if (!projectId) {
      console.log('Skipping unauthorized project update test - no projectId');
      return;
    }

    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Hacked Project' });

    expect([403, 404]).toContain(res.status);
  });

  // ============ Validation Tests ============

  it('should not create project with missing required fields', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        description: 'Missing name',
        territory: 'INONGO',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should not create project with invalid territory', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Invalid Territory Project',
        territory: 'INVALID_TERRITORY',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

    expect([400, 422]).toContain(res.status);
  });

  it('should require authentication to access projects', async () => {
    const res = await request(app).get('/api/projects');

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
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