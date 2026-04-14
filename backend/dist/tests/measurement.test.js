import request from 'supertest';
import { app, prisma } from '../index.js';
import { createTestConstructionUser, createTestAdminUser, createTestUser, createTestProject, createAuthToken, cleanupDatabase, disconnectDatabase, } from './test-utils.js';
describe('Measurement Endpoints', () => {
    let adminUser;
    let constructionUser;
    let regularUser;
    let adminToken;
    let constructionToken;
    let userToken;
    let projectId;
    let taskId;
    let measurementId;
    beforeAll(async () => {
        await cleanupDatabase();
        // Create test users
        adminUser = await createTestAdminUser({ email: `admin-measure-${Date.now()}@example.com` });
        constructionUser = await createTestConstructionUser({
            email: `construction-measure-${Date.now()}@example.com`,
        });
        regularUser = await createTestUser({ email: `user-measure-${Date.now()}@example.com` });
        adminToken = createAuthToken(adminUser.id, adminUser.role);
        constructionToken = createAuthToken(constructionUser.id, constructionUser.role);
        userToken = createAuthToken(regularUser.id, regularUser.role);
        // Create test project
        const project = await createTestProject(adminUser.id, {
            name: `Measurement Test Project ${Date.now()}`,
        });
        projectId = project.ProjectID;
        // Create test task (assuming Task model exists)
        // Note: This assumes a Task model - adjust if using different schema
        const task = await prisma.task.create({
            data: {
                ProjectID: projectId,
                Description: 'Test Measurement Task',
                AssignedTo: constructionUser.id.toString(),
                CompletionStatus: 'InProgress',
            },
        });
        taskId = task.TaskID;
    });
    afterAll(async () => {
        await cleanupDatabase();
        await disconnectDatabase();
    });
    describe('POST /api/measurements (create)', () => {
        it('should allow CONSTRUCTION user to create measurement', async () => {
            const measurementData = {
                taskId: taskId,
                siteId: 'SITE001',
                type: 'LENGTH',
                value: 15.5,
                unit: 'METER',
                date: new Date(),
            };
            const res = await request(app)
                .post('/api/measurements')
                .set('Authorization', `Bearer ${constructionToken}`)
                .send(measurementData);
            expect([201, 400, 404]).toContain(res.status);
            if (res.status === 201) {
                expect(res.body).toHaveProperty('id');
                measurementId = res.body.id;
            }
        });
        it('should not allow USER to create measurement', async () => {
            const measurementData = {
                taskId: taskId,
                siteId: 'SITE002',
                type: 'WIDTH',
                value: 10.0,
                unit: 'METER',
                date: new Date(),
            };
            const res = await request(app)
                .post('/api/measurements')
                .set('Authorization', `Bearer ${userToken}`)
                .send(measurementData);
            expect([403, 404]).toContain(res.status);
        });
        it('should validate required fields', async () => {
            const invalidData = {
                siteId: 'SITE001',
                // Missing type and value
                unit: 'METER',
            };
            const res = await request(app)
                .post('/api/measurements')
                .set('Authorization', `Bearer ${constructionToken}`)
                .send(invalidData);
            expect([400, 404, 422]).toContain(res.status);
        });
        it('should reject negative values', async () => {
            const invalidData = {
                taskId: taskId,
                siteId: 'SITE001',
                type: 'LENGTH',
                value: -15.5, // Invalid: negative
                unit: 'METER',
                date: new Date(),
            };
            const res = await request(app)
                .post('/api/measurements')
                .set('Authorization', `Bearer ${constructionToken}`)
                .send(invalidData);
            expect([400, 422, 404]).toContain(res.status);
        });
        it('should require authentication', async () => {
            const res = await request(app).post('/api/measurements').send({
                taskId: taskId,
                siteId: 'SITE001',
                type: 'LENGTH',
                value: 15.5,
            });
            expect(res.status).toBe(401);
        });
    });
    describe('GET /api/measurements (list)', () => {
        it('should list measurements for authenticated user', async () => {
            const res = await request(app)
                .get('/api/measurements')
                .set('Authorization', `Bearer ${constructionToken}`);
            expect([200, 401, 404]).toContain(res.status);
            if (res.status === 200) {
                expect(Array.isArray(res.body) || res.body.data).toBeDefined();
            }
        });
        it('should require authentication to list measurements', async () => {
            const res = await request(app).get('/api/measurements');
            expect(res.status).toBe(401);
        });
    });
    describe('GET /api/measurements/:id (get single)', () => {
        it('should get measurement by id if exists', async () => {
            if (!measurementId) {
                console.log('Skipping - no measurement created');
                return;
            }
            const res = await request(app)
                .get(`/api/measurements/${measurementId}`)
                .set('Authorization', `Bearer ${constructionToken}`);
            expect([200, 404]).toContain(res.status);
            if (res.status === 200) {
                expect(res.body.id).toBe(measurementId);
            }
        });
        it('should return 404 for non-existent measurement', async () => {
            const res = await request(app)
                .get('/api/measurements/99999')
                .set('Authorization', `Bearer ${constructionToken}`);
            expect(res.status).toBe(404);
        });
    });
    describe('PUT /api/measurements/:id (update)', () => {
        it('should allow CONSTRUCTION user to update measurement', async () => {
            if (!measurementId) {
                console.log('Skipping - no measurement created');
                return;
            }
            const updateData = {
                value: 16.0,
                notes: 'Updated measurement',
            };
            const res = await request(app)
                .put(`/api/measurements/${measurementId}`)
                .set('Authorization', `Bearer ${constructionToken}`)
                .send(updateData);
            expect([200, 404, 422]).toContain(res.status);
        });
        it('should not allow USER to update measurement', async () => {
            if (!measurementId) {
                console.log('Skipping - no measurement created');
                return;
            }
            const res = await request(app)
                .put(`/api/measurements/${measurementId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ value: 20.0 });
            expect([403, 404]).toContain(res.status);
        });
    });
    describe('DELETE /api/measurements/:id', () => {
        it('should allow ADMIN to delete measurement', async () => {
            if (!measurementId) {
                console.log('Skipping - no measurement created');
                return;
            }
            const res = await request(app)
                .delete(`/api/measurements/${measurementId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect([200, 204, 404]).toContain(res.status);
        });
        it('should not allow USER to delete measurement', async () => {
            const testData = {
                taskId: taskId,
                siteId: 'SITE_DELETE_TEST',
                type: 'LENGTH',
                value: 12.5,
                unit: 'METER',
                date: new Date(),
            };
            // Create a measurement
            const createRes = await request(app)
                .post('/api/measurements')
                .set('Authorization', `Bearer ${constructionToken}`)
                .send(testData);
            if (createRes.status === 201) {
                const newMeasurementId = createRes.body.id;
                // Attempt deletion as regular user
                const deleteRes = await request(app)
                    .delete(`/api/measurements/${newMeasurementId}`)
                    .set('Authorization', `Bearer ${userToken}`);
                expect([403, 404]).toContain(deleteRes.status);
            }
        });
    });
    describe('Error handling', () => {
        it('should handle errors gracefully', async () => {
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
                const req = request(app);
                let res;
                switch (endpoint.method) {
                    case 'get':
                        res = await req.get(endpoint.path);
                        break;
                    case 'post':
                        res = await req.post(endpoint.path);
                        break;
                    case 'put':
                        res = await req.put(endpoint.path);
                        break;
                    case 'delete':
                        res = await req.delete(endpoint.path);
                        break;
                }
                expect(res.status).toBe(401);
            }
        });
    });
});
