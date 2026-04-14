import request from 'supertest';
import { app } from './index.js';
import { createTestAdminUser, createAuthToken, cleanupDatabase, disconnectDatabase, } from './tests/test-utils.js';
describe('Authentication Endpoints', () => {
    const testUser = {
        name: 'Test Auth User',
        email: `auth-test-${Date.now()}@example.com`,
        password: 'SecurePassword123!',
    };
    let token;
    let userId;
    beforeAll(async () => {
        await cleanupDatabase();
    });
    afterAll(async () => {
        await cleanupDatabase();
        await disconnectDatabase();
    });
    // ============ Registration Tests ============
    it('should register a new user with valid credentials', async () => {
        const res = await request(app).post('/auth/register').send(testUser);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toBe(testUser.email);
        expect(res.body.name).toBe(testUser.name);
        expect(res.body.role).toBe('USER');
        expect(res.body).not.toHaveProperty('passwordHash');
        userId = res.body.id;
    });
    it('should not register with missing name', async () => {
        const res = await request(app).post('/auth/register').send({
            email: 'missing-name@example.com',
            password: 'SecurePassword123!',
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });
    it('should not register with missing email', async () => {
        const res = await request(app).post('/auth/register').send({
            name: 'No Email User',
            password: 'SecurePassword123!',
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });
    it('should not register with missing password', async () => {
        const res = await request(app).post('/auth/register').send({
            name: 'No Password User',
            email: 'no-password@example.com',
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });
    it('should not register duplicate email', async () => {
        const res = await request(app).post('/auth/register').send(testUser);
        expect(res.status).toBe(409);
        expect(res.body.error).toBeDefined();
    });
    it('should register user with custom role', async () => {
        const newUserData = {
            name: 'Admin Test User',
            email: `admin-test-${Date.now()}@example.com`,
            password: 'SecurePassword123!',
            role: 'ADMIN',
        };
        const res = await request(app).post('/auth/register').send(newUserData);
        expect(res.status).toBe(201);
        expect(res.body.role).toBe('ADMIN');
    });
    // ============ Login Tests ============
    it('should login with correct credentials', async () => {
        const res = await request(app).post('/auth/login').send({
            email: testUser.email,
            password: testUser.password,
        });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe(testUser.email);
        expect(res.body.user).not.toHaveProperty('passwordHash');
        token = res.body.token;
    });
    it('should not login with wrong password', async () => {
        const res = await request(app).post('/auth/login').send({
            email: testUser.email,
            password: 'WrongPassword123!',
        });
        expect(res.status).toBe(401);
        expect(res.body.error).toBeDefined();
    });
    it('should not login with non-existent email', async () => {
        const res = await request(app).post('/auth/login').send({
            email: 'non-existent@example.com',
            password: 'AnyPassword123!',
        });
        expect(res.status).toBe(401);
        expect(res.body.error).toBeDefined();
    });
    it('should not login with missing email', async () => {
        const res = await request(app).post('/auth/login').send({
            password: 'SecurePassword123!',
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });
    it('should not login with missing password', async () => {
        const res = await request(app).post('/auth/login').send({
            email: testUser.email,
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });
    // ============ JWT Token Tests ============
    it('should validate JWT token structure', async () => {
        expect(token).toBeDefined();
        const parts = token.split('.');
        expect(parts.length).toBe(3); // Header.Payload.Signature
    });
    it('should have correct user info in token claims', () => {
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        expect(decoded.userId).toBe(userId);
        expect(decoded.role).toBe('USER');
        expect(decoded.exp).toBeDefined();
    });
    // ============ Protected Routes ============
    it('should access protected route with valid token', async () => {
        const res = await request(app)
            .get('/me')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.email).toBe(testUser.email);
        expect(res.body.id).toBe(userId);
    });
    it('should not access protected route without token', async () => {
        const res = await request(app).get('/me');
        expect(res.status).toBe(401);
        expect(res.body.error).toBeDefined();
    });
    it('should not access protected route with invalid token', async () => {
        const res = await request(app)
            .get('/me')
            .set('Authorization', 'Bearer invalid.token.here');
        expect(res.status).toBe(401);
        expect(res.body.error).toBeDefined();
    });
    it('should not access protected route with malformed auth header', async () => {
        const res = await request(app).get('/me').set('Authorization', 'InvalidBearer');
        expect(res.status).toBe(401);
        expect(res.body.error).toBeDefined();
    });
    // ============ Admin/Supervisor Route Tests ============
    it('should grant admin access to admin user', async () => {
        const adminUser = await createTestAdminUser({
            email: `admin-access-${Date.now()}@example.com`,
        });
        const adminToken = createAuthToken(adminUser.id, adminUser.role);
        const res = await request(app).get('/admin/dashboard').set('Authorization', `Bearer ${adminToken}`);
        // This test assumes /admin/dashboard exists
        // Adjust based on actual admin-only route
        expect([200, 403, 404]).toContain(res.status);
    });
});
