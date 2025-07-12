// Custom commands for authentication and common actions

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/');
  cy.get('input[placeholder="Email"]').type(email);
  cy.get('input[placeholder="Password"]').type(password);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.login('admin@example.com', 'password123');
});

Cypress.Commands.add('loginAsUser', () => {
  cy.login('user@example.com', 'password123');
});

// Mock API responses
Cypress.Commands.add('mockHealthCheck', () => {
  cy.intercept('GET', '/api/health', {
    statusCode: 200,
    body: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: 3600,
    },
  }).as('healthCheck');
});

Cypress.Commands.add('mockLogin', (user: any) => {
  cy.intercept('POST', '/auth/login', {
    statusCode: 200,
    body: {
      token: 'mock-token',
      user: user,
    },
  }).as('login');
});

Cypress.Commands.add('mockProjects', (projects: any[]) => {
  cy.intercept('GET', '/api/projects', {
    statusCode: 200,
    body: projects,
  }).as('getProjects');
});

Cypress.Commands.add('mockCreateProject', (project: any) => {
  cy.intercept('POST', '/api/projects', {
    statusCode: 201,
    body: project,
  }).as('createProject');
});

Cypress.Commands.add('mockUpdateProject', (project: any) => {
  cy.intercept('PUT', `/api/projects/${project.ProjectID}`, {
    statusCode: 200,
    body: project,
  }).as('updateProject');
});

Cypress.Commands.add('mockDeleteProject', (projectId: number) => {
  cy.intercept('DELETE', `/api/projects/${projectId}`, {
    statusCode: 204,
  }).as('deleteProject');
});

declare global {
  namespace Cypress {
    interface Chainable {
      mockHealthCheck(): Chainable<void>
      mockLogin(user: any): Chainable<void>
      mockProjects(projects: any[]): Chainable<void>
      mockCreateProject(project: any): Chainable<void>
      mockUpdateProject(project: any): Chainable<void>
      mockDeleteProject(projectId: number): Chainable<void>
    }
  }
}
