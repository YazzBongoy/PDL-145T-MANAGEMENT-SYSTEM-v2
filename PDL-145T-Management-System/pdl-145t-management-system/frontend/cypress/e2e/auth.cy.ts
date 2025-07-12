describe('Authentication', () => {
  beforeEach(() => {
    cy.mockHealthCheck();
    cy.visit('/');
  });

  describe('Login Flow', () => {
    it('should display login form by default', () => {
      cy.get('h2').should('contain', 'Login');
      cy.get('input[placeholder="Email"]').should('be.visible');
      cy.get('input[placeholder="Password"]').should('be.visible');
      cy.get('button[type="submit"]').should('contain', 'Login');
    });

    it('should login successfully with valid credentials', () => {
      cy.fixture('users').then((users) => {
        cy.mockLogin(users.admin);
        cy.mockProjects([]);
        
        cy.get('input[placeholder="Email"]').type('admin@example.com');
        cy.get('input[placeholder="Password"]').type('password123');
        cy.get('button[type="submit"]').click();
        
        cy.wait('@login');
        cy.get('h2').should('contain', 'Admin Dashboard');
      });
    });

    it('should display error for invalid credentials', () => {
      cy.intercept('POST', '/auth/login', {
        statusCode: 401,
        body: { error: 'Invalid credentials' }
      }).as('loginError');
      
      cy.get('input[placeholder="Email"]').type('invalid@example.com');
      cy.get('input[placeholder="Password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@loginError');
      cy.get('.error').should('contain', 'Invalid credentials');
    });

    it('should require email and password fields', () => {
      cy.get('input[placeholder="Email"]').should('have.attr', 'required');
      cy.get('input[placeholder="Password"]').should('have.attr', 'required');
    });

    it('should have correct input types', () => {
      cy.get('input[placeholder="Email"]').should('have.attr', 'type', 'email');
      cy.get('input[placeholder="Password"]').should('have.attr', 'type', 'password');
    });
  });

  describe('Registration Flow', () => {
    it('should switch to registration form', () => {
      cy.get('button').contains('Register').click();
      cy.get('h2').should('contain', 'Register');
      cy.get('input[placeholder="Name"]').should('be.visible');
      cy.get('input[placeholder="Email"]').should('be.visible');
      cy.get('input[placeholder="Password"]').should('be.visible');
      cy.get('select').should('be.visible');
    });

    it('should register successfully with valid data', () => {
      cy.fixture('users').then((users) => {
        cy.intercept('POST', '/auth/register', {
          statusCode: 201,
          body: { success: true }
        }).as('register');
        
        cy.mockLogin(users.user);
        cy.mockProjects([]);
        
        cy.get('button').contains('Register').click();
        
        cy.get('input[placeholder="Name"]').type('New User');
        cy.get('input[placeholder="Email"]').type('newuser@example.com');
        cy.get('input[placeholder="Password"]').type('password123');
        cy.get('select').select('USER');
        cy.get('button[type="submit"]').click();
        
        cy.wait('@register');
        cy.wait('@login');
        cy.get('h2').should('contain', 'User Dashboard');
      });
    });

    it('should display error for invalid registration', () => {
      cy.intercept('POST', '/auth/register', {
        statusCode: 400,
        body: { error: 'Email already exists' }
      }).as('registerError');
      
      cy.get('button').contains('Register').click();
      
      cy.get('input[placeholder="Name"]').type('Test User');
      cy.get('input[placeholder="Email"]').type('existing@example.com');
      cy.get('input[placeholder="Password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@registerError');
      cy.get('.error').should('contain', 'Email already exists');
    });

    it('should have all role options', () => {
      cy.get('button').contains('Register').click();
      
      cy.get('select option').should('have.length', 5);
      cy.get('select option').eq(0).should('contain', 'User');
      cy.get('select option').eq(1).should('contain', 'Admin');
      cy.get('select option').eq(2).should('contain', 'Supervisor');
      cy.get('select option').eq(3).should('contain', 'Finance');
      cy.get('select option').eq(4).should('contain', 'Construction');
    });

    it('should navigate back to login form', () => {
      cy.get('button').contains('Register').click();
      cy.get('h2').should('contain', 'Register');
      
      cy.get('button').contains('Back to Login').click();
      cy.get('h2').should('contain', 'Login');
    });
  });

  describe('Logout Flow', () => {
    it('should logout successfully', () => {
      cy.fixture('users').then((users) => {
        cy.mockLogin(users.admin);
        cy.mockProjects([]);
        
        // Login first
        cy.get('input[placeholder="Email"]').type('admin@example.com');
        cy.get('input[placeholder="Password"]').type('password123');
        cy.get('button[type="submit"]').click();
        
        cy.wait('@login');
        cy.get('h2').should('contain', 'Admin Dashboard');
        
        // Logout
        cy.get('button').contains('Logout').click();
        cy.get('h2').should('contain', 'Login');
      });
    });
  });

  describe('Persistent Authentication', () => {
    it('should persist login state after page refresh', () => {
      cy.fixture('users').then((users) => {
        cy.mockLogin(users.admin);
        cy.mockProjects([]);
        
        // Login
        cy.get('input[placeholder="Email"]').type('admin@example.com');
        cy.get('input[placeholder="Password"]').type('password123');
        cy.get('button[type="submit"]').click();
        
        cy.wait('@login');
        
        // Set localStorage to simulate persistent login
        cy.window().then((win) => {
          win.localStorage.setItem('token', 'mock-token');
          win.localStorage.setItem('user', JSON.stringify(users.admin));
        });
        
        // Refresh page
        cy.reload();
        
        // Should still be logged in
        cy.get('h2').should('contain', 'Admin Dashboard');
      });
    });
  });
});
