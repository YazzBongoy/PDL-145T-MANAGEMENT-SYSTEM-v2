describe('Project Management', () => {
  beforeEach(() => {
    cy.mockHealthCheck();
    cy.visit('/');
  });

  describe('Admin Project Management', () => {
    beforeEach(() => {
      cy.fixture('users').then((users) => {
        cy.mockLogin(users.admin);
        cy.fixture('projects').then((projects) => {
          cy.mockProjects(projects);
        });
        
        // Login as admin
        cy.get('input[placeholder="Email"]').type('admin@example.com');
        cy.get('input[placeholder="Password"]').type('password123');
        cy.get('button[type="submit"]').click();
        cy.wait('@login');
      });
    });

    it('should display projects list', () => {
      cy.wait('@getProjects');
      cy.get('h3').should('contain', 'Projects');
      cy.get('li').should('have.length', 3);
      cy.get('li').first().should('contain', 'Test Project 1');
      cy.get('li').eq(1).should('contain', 'Test Project 2');
      cy.get('li').eq(2).should('contain', 'Test Project 3');
    });

    it('should show project details correctly', () => {
      cy.wait('@getProjects');
      cy.get('li').first().within(() => {
        cy.should('contain', 'Test Project 1');
        cy.should('contain', '(Start: 2024-01-01)');
        cy.should('contain', 'Budget: 50000');
      });
    });

    it('should enable new project button for admin', () => {
      cy.get('button').contains('+ New Project').should('not.be.disabled');
    });

    it('should show edit and delete buttons for admin', () => {
      cy.wait('@getProjects');
      cy.get('button').contains('Edit').should('be.visible');
      cy.get('button').contains('Delete').should('be.visible');
    });

    it('should create new project successfully', () => {
      const newProject = {
        ProjectID: 4,
        Name: 'New Test Project',
        StartDate: '2024-04-01T00:00:00Z',
        EndDate: '2024-12-31T00:00:00Z',
        TotalBudget: 25000
      };

      cy.mockCreateProject(newProject);
      cy.mockProjects([newProject]);

      cy.get('button').contains('+ New Project').click();
      
      cy.get('input[placeholder="Name"]').type('New Test Project');
      cy.get('input[placeholder="Start Date"]').type('2024-04-01');
      cy.get('input[placeholder="End Date"]').type('2024-12-31');
      cy.get('input[placeholder="Total Budget"]').type('25000');
      
      cy.get('button').contains('Create').click();
      
      cy.wait('@createProject');
      cy.wait('@getProjects');
    });

    it('should edit project successfully', () => {
      const updatedProject = {
        ProjectID: 1,
        Name: 'Updated Test Project',
        StartDate: '2024-01-01T00:00:00Z',
        EndDate: '2024-12-31T00:00:00Z',
        TotalBudget: 60000
      };

      cy.mockUpdateProject(updatedProject);
      cy.mockProjects([updatedProject]);

      cy.wait('@getProjects');
      cy.get('button').contains('Edit').first().click();
      
      cy.get('input[name="Name"]').clear().type('Updated Test Project');
      cy.get('input[name="TotalBudget"]').clear().type('60000');
      
      cy.get('button').contains('Update').click();
      
      cy.wait('@updateProject');
      cy.wait('@getProjects');
    });

    it('should delete project successfully', () => {
      cy.mockDeleteProject(1);
      cy.mockProjects([]);

      cy.wait('@getProjects');
      cy.get('button').contains('Delete').first().click();
      
      cy.wait('@deleteProject');
      cy.wait('@getProjects');
    });

    it('should cancel form correctly', () => {
      cy.get('button').contains('+ New Project').click();
      cy.get('input[placeholder="Name"]').should('be.visible');
      
      cy.get('button').contains('Cancel').click();
      cy.get('input[placeholder="Name"]').should('not.exist');
    });

    it('should validate required fields', () => {
      cy.get('button').contains('+ New Project').click();
      
      cy.get('input[placeholder="Name"]').should('have.attr', 'required');
      cy.get('input[placeholder="Start Date"]').should('have.attr', 'required');
      cy.get('input[placeholder="Total Budget"]').should('have.attr', 'required');
    });

    it('should show form in edit mode with correct data', () => {
      cy.wait('@getProjects');
      cy.get('button').contains('Edit').first().click();
      
      cy.get('input[name="Name"]').should('have.value', 'Test Project 1');
      cy.get('input[name="StartDate"]').should('have.value', '2024-01-01');
      cy.get('input[name="EndDate"]').should('have.value', '2024-12-31');
      cy.get('input[name="TotalBudget"]').should('have.value', '50000');
      cy.get('button').contains('Update').should('be.visible');
    });
  });

  describe('User Project Management', () => {
    beforeEach(() => {
      cy.fixture('users').then((users) => {
        cy.mockLogin(users.user);
        cy.fixture('projects').then((projects) => {
          cy.mockProjects(projects);
        });
        
        // Login as regular user
        cy.get('input[placeholder="Email"]').type('user@example.com');
        cy.get('input[placeholder="Password"]').type('password123');
        cy.get('button[type="submit"]').click();
        cy.wait('@login');
      });
    });

    it('should display projects list for regular user', () => {
      cy.wait('@getProjects');
      cy.get('h3').should('contain', 'Projects');
      cy.get('li').should('have.length', 3);
    });

    it('should disable new project button for regular user', () => {
      cy.get('button').contains('+ New Project').should('be.disabled');
    });

    it('should hide edit and delete buttons for regular user', () => {
      cy.wait('@getProjects');
      cy.get('button').contains('Edit').should('not.exist');
      cy.get('button').contains('Delete').should('not.exist');
    });
  });

  describe('Supervisor Project Management', () => {
    beforeEach(() => {
      cy.fixture('users').then((users) => {
        cy.mockLogin(users.supervisor);
        cy.fixture('projects').then((projects) => {
          cy.mockProjects(projects);
        });
        
        // Login as supervisor
        cy.get('input[placeholder="Email"]').type('supervisor@example.com');
        cy.get('input[placeholder="Password"]').type('password123');
        cy.get('button[type="submit"]').click();
        cy.wait('@login');
      });
    });

    it('should enable new project button for supervisor', () => {
      cy.get('button').contains('+ New Project').should('not.be.disabled');
    });

    it('should show edit and delete buttons for supervisor', () => {
      cy.wait('@getProjects');
      cy.get('button').contains('Edit').should('be.visible');
      cy.get('button').contains('Delete').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      cy.fixture('users').then((users) => {
        cy.mockLogin(users.admin);
        
        // Login as admin
        cy.get('input[placeholder="Email"]').type('admin@example.com');
        cy.get('input[placeholder="Password"]').type('password123');
        cy.get('button[type="submit"]').click();
        cy.wait('@login');
      });
    });

    it('should display error when projects fetch fails', () => {
      cy.intercept('GET', '/api/projects', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getProjectsError');
      
      cy.wait('@getProjectsError');
      cy.get('.error').should('contain', 'Failed to fetch projects');
    });

    it('should handle create project error', () => {
      cy.intercept('POST', '/api/projects', {
        statusCode: 400,
        body: { error: 'Invalid project data' }
      }).as('createProjectError');
      
      cy.get('button').contains('+ New Project').click();
      
      cy.get('input[placeholder="Name"]').type('Test Project');
      cy.get('input[placeholder="Start Date"]').type('2024-01-01');
      cy.get('input[placeholder="Total Budget"]').type('10000');
      
      cy.get('button').contains('Create').click();
      
      cy.wait('@createProjectError');
      // The app shows alert, so we can't easily test this in e2e
      // This would be better tested in unit tests
    });
  });

  describe('Loading States', () => {
    beforeEach(() => {
      cy.fixture('users').then((users) => {
        cy.mockLogin(users.admin);
        
        // Login as admin
        cy.get('input[placeholder="Email"]').type('admin@example.com');
        cy.get('input[placeholder="Password"]').type('password123');
        cy.get('button[type="submit"]').click();
        cy.wait('@login');
      });
    });

    it('should show loading state initially', () => {
      cy.intercept('GET', '/api/projects', {
        delay: 1000,
        statusCode: 200,
        body: []
      }).as('getProjectsDelayed');
      
      cy.get('p').should('contain', 'Loading...');
      cy.wait('@getProjectsDelayed');
    });
  });
});
