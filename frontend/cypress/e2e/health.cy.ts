describe('Health Check', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display healthy status', () => {
    cy.intercept('GET', '/api/health', {
      statusCode: 200,
      body: {
        status: 'healthy',
        timestamp: '2024-01-01T12:00:00Z',
        uptime: 3600,
      },
    }).as('healthCheck');

    cy.wait('@healthCheck');
    cy.get('.health-status').should('be.visible');
    cy.get('.status-indicator').should('contain', 'Status: healthy');
    cy.get('p').should('contain', 'Uptime: 3600 seconds');
  });

  it('should display error when health check fails', () => {
    cy.intercept('GET', '/api/health', {
      statusCode: 500,
      body: { error: 'Service unavailable' },
    }).as('healthCheckError');

    cy.wait('@healthCheckError');
    cy.get('.error').should('be.visible');
    cy.get('.error p').should('contain', 'Error:');
    cy.get('button').contains('Retry').should('be.visible');
  });

  it('should refresh health status when refresh button is clicked', () => {
    cy.intercept('GET', '/api/health', {
      statusCode: 200,
      body: {
        status: 'healthy',
        timestamp: '2024-01-01T12:00:00Z',
        uptime: 3600,
      },
    }).as('initialHealthCheck');

    cy.intercept('GET', '/api/health', {
      statusCode: 200,
      body: {
        status: 'healthy',
        timestamp: '2024-01-01T12:01:00Z',
        uptime: 3660,
      },
    }).as('refreshHealthCheck');

    cy.wait('@initialHealthCheck');
    cy.get('p').should('contain', 'Uptime: 3600 seconds');

    cy.get('button').contains('Refresh').click();
    cy.wait('@refreshHealthCheck');
    cy.get('p').should('contain', 'Uptime: 3660 seconds');
  });

  it('should retry when retry button is clicked', () => {
    cy.intercept('GET', '/api/health', {
      statusCode: 500,
      body: { error: 'Service unavailable' },
    }).as('healthCheckError');

    cy.intercept('GET', '/api/health', {
      statusCode: 200,
      body: {
        status: 'healthy',
        timestamp: '2024-01-01T12:00:00Z',
        uptime: 3600,
      },
    }).as('healthCheckRetry');

    cy.wait('@healthCheckError');
    cy.get('.error').should('be.visible');

    cy.get('button').contains('Retry').click();
    cy.wait('@healthCheckRetry');
    cy.get('.health-status').should('be.visible');
    cy.get('.status-indicator').should('contain', 'Status: healthy');
  });

  it('should display loading state initially', () => {
    cy.intercept('GET', '/api/health', {
      delay: 1000,
      statusCode: 200,
      body: {
        status: 'healthy',
        timestamp: '2024-01-01T12:00:00Z',
        uptime: 3600,
      },
    }).as('healthCheckDelayed');

    cy.get('p').should('contain', 'Loading health status...');
    cy.wait('@healthCheckDelayed');
  });

  it('should format timestamp correctly', () => {
    cy.intercept('GET', '/api/health', {
      statusCode: 200,
      body: {
        status: 'healthy',
        timestamp: '2024-01-01T12:00:00Z',
        uptime: 3600,
      },
    }).as('healthCheck');

    cy.wait('@healthCheck');
    cy.get('p').should('contain', 'Timestamp:');
    // Note: The exact format depends on user's locale
    cy.get('p').should('contain', '2024');
  });

  it('should have correct CSS classes for status', () => {
    cy.intercept('GET', '/api/health', {
      statusCode: 200,
      body: {
        status: 'healthy',
        timestamp: '2024-01-01T12:00:00Z',
        uptime: 3600,
      },
    }).as('healthCheck');

    cy.wait('@healthCheck');
    cy.get('.status-indicator').should('have.class', 'healthy');
  });
});
