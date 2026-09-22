describe('Authentication System - Integration Tests', () => {
  const API_BASE = 'http://localhost:8000/api';
  const APP_URL = 'http://localhost:3001';
  
  const DEMO_USER = {
    email: 'demo@example.com',
    password: 'demo12345',
  };

  const TEST_USER = {
    name: 'Test User ' + Date.now(),
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123',
  };

  // ========== API Tests ==========
  describe('API - Authentication Endpoints', () => {
    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', () => {
        cy.request('POST', `${API_BASE}/auth/login`, DEMO_USER)
          .should((res) => {
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message', 'Login successful');
            expect(res.body).to.have.property('user');
            expect(res.body).to.have.property('token');
            expect(res.body.user.email).to.equal(DEMO_USER.email);
          });
      });

      it('should return 401 with invalid credentials', () => {
        cy.request({
          method: 'POST',
          url: `${API_BASE}/auth/login`,
          body: {
            email: 'invalid@example.com',
            password: 'wrongpassword',
          },
          failOnStatusCode: false,
        }).should((res) => {
          expect(res.status).to.equal(401);
          expect(res.body.error).to.include('Invalid');
        });
      });

      it('should return 400 with invalid email format', () => {
        cy.request({
          method: 'POST',
          url: `${API_BASE}/auth/login`,
          body: {
            email: 'not-an-email',
            password: 'password',
          },
          failOnStatusCode: false,
        }).should((res) => {
          expect(res.status).to.equal(400);
        });
      });
    });

    describe('POST /api/auth/register', () => {
      it('should register new user successfully', () => {
        const uniqueUser = { name: 'Test User', email: `test-${Date.now()}@example.com`, password: 'TestPassword123' };
        cy.request('POST', `${API_BASE}/auth/register`, uniqueUser)
          .should((res) => {
            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('message', 'User registered successfully');
            expect(res.body).to.have.property('user');
            expect(res.body).to.have.property('token');
            expect(res.body.user.email).to.equal(uniqueUser.email);
            expect(res.body.user.role).to.equal('USER');
          });
      });

      it('should reject duplicate email', () => {
        const dupUser = { name: 'Dup User', email: `dup-${Date.now()}@example.com`, password: 'TestPassword123' };
        // Register first
        cy.request('POST', `${API_BASE}/auth/register`, dupUser);
        
        // Try to register again with same email
        cy.request({
          method: 'POST',
          url: `${API_BASE}/auth/register`,
          body: dupUser,
          failOnStatusCode: false,
        }).should((res) => {
          expect(res.status).to.equal(400);
          expect(res.body.error).to.include('Email already registered');
        });
      });

      it('should validate required fields', () => {
        cy.request({
          method: 'POST',
          url: `${API_BASE}/auth/register`,
          body: {
            name: 'Test',
            email: 'test@example.com',
            // missing password
          },
          failOnStatusCode: false,
        }).should((res) => {
          expect(res.status).to.equal(400);
        });
      });
    });

    describe('GET /api/auth/me', () => {
      let token: string;

      beforeEach(() => {
        cy.request('POST', `${API_BASE}/auth/login`, DEMO_USER).then((res) => {
          token = res.body.token;
        });
      });

      it('should get current user with valid token', () => {
        cy.request({
          method: 'GET',
          url: `${API_BASE}/auth/me`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).should((res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('user');
          expect(res.body.user.email).to.equal(DEMO_USER.email);
        });
      });

      it('should return 401 without token', () => {
        cy.request({
          method: 'GET',
          url: `${API_BASE}/auth/me`,
          failOnStatusCode: false,
        }).should((res) => {
          expect(res.status).to.equal(401);
        });
      });

      it('should return 401 with invalid token', () => {
        cy.request({
          method: 'GET',
          url: `${API_BASE}/auth/me`,
          headers: {
            Authorization: 'Bearer invalid-token',
          },
          failOnStatusCode: false,
        }).should((res) => {
          expect(res.status).to.equal(401);
        });
      });
    });
  });

  // ========== Frontend UI Tests ==========
  describe('Frontend - Login Page', () => {
    beforeEach(() => {
      cy.visit(APP_URL);
    });

    it('should display Sign In form', () => {
      cy.contains('Sign In').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
    });

    it('should have working email input', () => {
      cy.get('input[type="email"]')
        .type(DEMO_USER.email)
        .should('have.value', DEMO_USER.email);
    });

    it('should have working password input', () => {
      cy.get('input[type="password"]')
        .first()
        .type('password123')
        .should('have.value', 'password123');
    });

    it('should display demo credentials hint', () => {
      cy.contains('demo@example.com').should('be.visible');
    });
  });

  describe('Frontend - Login Flow', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.visit(APP_URL);
    });

    it('should login successfully with demo credentials', () => {
      cy.get('input[type="email"]').type(DEMO_USER.email);
      cy.get('input[type="password"]').first().type(DEMO_USER.password);
      cy.contains('button', 'Sign In').click();

      // After login, the dashboard should appear
      cy.wait(2000);
      cy.window().then((win) => {
        const auth = win.localStorage.getItem('auth');
        expect(auth).to.not.be.null;
        const authData = JSON.parse(auth!);
        expect(authData).to.have.property('token');
        expect(authData).to.have.property('user');
        expect(authData.user.email).to.equal(DEMO_USER.email);
      });
    });

    it('should show error with wrong credentials', () => {
      cy.get('input[type="email"]').type('wrong@example.com');
      cy.get('input[type="password"]').first().type('wrongpassword');
      cy.contains('button', 'Sign In').click();
      cy.wait(1500);
      cy.get('.alert--error, [role="alert"]').should('be.visible');
    });
  });

  describe('Frontend - Register Flow', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.visit(APP_URL);
    });

    it('should toggle to register mode via Create Account button', () => {
      cy.contains('button', 'Create Account').click();
      cy.wait(300);
      cy.contains('Create Account').should('be.visible');
    });

    it('should have name field in register mode', () => {
      cy.contains('button', 'Create Account').click();
      cy.get('input[placeholder="John Doe"]').should('be.visible');
    });
  });

  describe('Frontend - Token Persistence', () => {
    it('should persist auth in localStorage after login', () => {
      cy.clearLocalStorage();
      cy.visit(APP_URL);
      cy.get('input[type="email"]').type(DEMO_USER.email);
      cy.get('input[type="password"]').first().type(DEMO_USER.password);
      cy.contains('button', 'Sign In').click();

      cy.wait(2000);
      cy.window().then((win) => {
        const auth = win.localStorage.getItem('auth');
        expect(auth).to.not.be.null;
        const authData = JSON.parse(auth!);
        expect(authData.token).to.be.a('string');
        expect(authData.token.length).to.be.greaterThan(0);
      });
    });
  });

  describe('API - Health Check', () => {
    it('should verify API is healthy', () => {
      cy.request('GET', `${API_BASE}/health`).should((res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('status', 'healthy');
      });
    });
  });
});
