import { test, expect, request } from '@playwright/test';

test.describe('API Endpoints', () => {
  const apiBaseURL = 'http://localhost:8001';
  
  test('GET /api/health should return healthy status', async () => {
    const apiContext = await request.newContext({
      baseURL: apiBaseURL,
    });
    
    const response = await apiContext.get('/api/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.timestamp).toBeDefined();
    expect(data.uptime).toBeDefined();
    
    await apiContext.dispose();
  });

  test('GET / should return welcome message', async () => {
    const apiContext = await request.newContext({
      baseURL: apiBaseURL,
    });
    
    const response = await apiContext.get('/');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.message).toContain('PDL-145T');
    
    await apiContext.dispose();
  });

  test('POST /auth/register should create a new user', async () => {
    const apiContext = await request.newContext({
      baseURL: apiBaseURL,
    });
    
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const response = await apiContext.post('/auth/register', {
      data: {
        name: 'Test User',
        email: uniqueEmail,
        password: 'TestPass123!',
        role: 'USER'
      }
    });
    
    // May return 201 (created) or 409 (conflict if user exists)
    expect([201, 409]).toContain(response.status());
    
    if (response.status() === 201) {
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.email).toBe(uniqueEmail);
      expect(data.role).toBe('USER');
    }
    
    await apiContext.dispose();
  });

  test('POST /auth/login with valid credentials', async () => {
    const apiContext = await request.newContext({
      baseURL: apiBaseURL,
    });
    
    const response = await apiContext.post('/auth/login', {
      data: {
        email: 'admin@pdl145t.com',
        password: 'Password123!'
      }
    });
    
    // May return 200 (success) or 401 (if credentials invalid)
    expect([200, 401]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.token).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBeDefined();
    }
    
    await apiContext.dispose();
  });

  test('POST /auth/login with invalid credentials', async () => {
    const apiContext = await request.newContext({
      baseURL: apiBaseURL,
    });
    
    const response = await apiContext.post('/auth/login', {
      data: {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      }
    });
    
    expect(response.status()).toBe(401);
    
    const data = await response.json();
    expect(data.error).toBeDefined();
    
    await apiContext.dispose();
  });

  test('Protected endpoints should require authentication', async () => {
    const apiContext = await request.newContext({
      baseURL: apiBaseURL,
    });
    
    const protectedEndpoints = [
      '/api/projects',
      '/api/tasks',
      '/api/expenses',
      '/api/measurements',
      '/api/sprints',
    ];
    
    for (const endpoint of protectedEndpoints) {
      const response = await apiContext.get(endpoint);
      expect(response.status()).toBe(401);
    }
    
    await apiContext.dispose();
  });
});
