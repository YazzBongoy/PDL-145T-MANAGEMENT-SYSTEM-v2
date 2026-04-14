import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
/**
 * Factory functions for creating test data
 */
export const createTestUser = async (overrides = {}) => {
    const defaults = {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        role: 'USER',
    };
    const userData = { ...defaults, ...overrides };
    const { password, ...rest } = userData;
    const passwordHash = await bcrypt.hash(password, 10);
    return prisma.user.create({
        data: {
            ...rest,
            passwordHash,
            role: rest.role,
        },
    });
};
export const createTestAdminUser = async (overrides = {}) => {
    return createTestUser({ role: 'ADMIN', ...overrides });
};
export const createTestSupervisorUser = async (overrides = {}) => {
    return createTestUser({ role: 'SUPERVISOR', ...overrides });
};
export const createTestConstructionUser = async (overrides = {}) => {
    return createTestUser({ role: 'CONSTRUCTION', ...overrides });
};
export const createTestFinanceUser = async (overrides = {}) => {
    return createTestUser({ role: 'FINANCE', ...overrides });
};
export const createTestProject = async (userId, overrides = {}) => {
    const defaults = {
        Name: `Test Project ${Date.now()}`,
        StartDate: new Date(),
        EndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        TotalBudget: 100000,
    };
    return prisma.project.create({
        data: { ...defaults, ...overrides },
    });
};
export const createAuthToken = (userId, role = 'USER', options = {}) => {
    return jwt.sign({ userId, role }, JWT_SECRET, {
        expiresIn: '24h',
        ...options,
    });
};
/**
 * Database cleanup utilities
 */
export const cleanupDatabase = async () => {
    try {
        // Delete in reverse order of dependencies to avoid FK constraint issues
        await prisma.measurement.deleteMany({});
        await prisma.expense.deleteMany({});
        await prisma.task.deleteMany({});
        await prisma.resource.deleteMany({});
        await prisma.project.deleteMany({});
        await prisma.user.deleteMany({});
    }
    catch (error) {
        console.error('Error cleaning up database:', error);
    }
};
export const disconnectDatabase = async () => {
    await prisma.$disconnect();
};
/**
 * Request helpers
 */
export const getAuthHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
});
/**
 * Assertion helpers
 */
export const expectUnauthorized = (response) => {
    expect(response.status).toBe(401);
    expect(response.body.error).toBeDefined();
};
export const expectForbidden = (response) => {
    expect(response.status).toBe(403);
    expect(response.body.error).toBeDefined();
};
export const expectBadRequest = (response) => {
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
};
export const expectNotFound = (response) => {
    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
};
export const expectSuccess = (response, statusCode = 200) => {
    expect(response.status).toBe(statusCode);
};
/**
 * Mock utilities
 */
export const mockApiResponse = (data, status = 200) => ({
    status,
    body: data,
    json: async () => data,
});
export const mockApiError = (error, status = 500) => ({
    status,
    body: { error },
    json: async () => ({ error }),
});
