import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/utils';
import { ProjectList } from './ProjectList';
import { mockApiResponse, mockApiError, mockAdminUser, mockUser, createMockProject } from '../../test/utils';
import userEvent from '@testing-library/user-event';

const mockToken = 'test-token';

describe('ProjectList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockApiResponse([]); // Mock empty response
    render(<ProjectList user={mockAdminUser} token={mockToken} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders projects list after successful fetch', async () => {
    const mockProjects = [
      createMockProject({ ProjectID: 1, Name: 'Project 1' }),
      createMockProject({ ProjectID: 2, Name: 'Project 2' })
    ];
    mockApiResponse(mockProjects);

    render(<ProjectList user={mockAdminUser} token={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('/api/projects', {
      headers: { Authorization: `Bearer ${mockToken}` }
    });
  });

  it('renders error state when fetch fails', async () => {
    const errorMessage = 'Failed to fetch projects';
    mockApiError(errorMessage);

    render(<ProjectList user={mockAdminUser} token={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows new project button for admin users', () => {
    mockApiResponse([]);
    render(<ProjectList user={mockAdminUser} token={mockToken} />);

    expect(screen.getByText('+ New Project')).toBeInTheDocument();
    expect(screen.getByText('+ New Project')).not.toBeDisabled();
  });

  it('disables new project button for regular users', () => {
    mockApiResponse([]);
    render(<ProjectList user={mockUser} token={mockToken} />);

    expect(screen.getByText('+ New Project')).toBeDisabled();
  });

  it('shows edit and delete buttons for admin users', async () => {
    const mockProjects = [createMockProject({ ProjectID: 1, Name: 'Test Project' })];
    mockApiResponse(mockProjects);

    render(<ProjectList user={mockAdminUser} token={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('hides edit and delete buttons for regular users', async () => {
    const mockProjects = [createMockProject({ ProjectID: 1, Name: 'Test Project' })];
    mockApiResponse(mockProjects);

    render(<ProjectList user={mockUser} token={mockToken} />);

    await waitFor(() => {
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });

  it('opens form when new project button is clicked', async () => {
    mockApiResponse([]);
    const user = userEvent.setup();
    render(<ProjectList user={mockAdminUser} token={mockToken} />);

    await user.click(screen.getByText('+ New Project'));

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Start Date')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('End Date')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Total Budget')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('creates new project on form submission', async () => {
    mockApiResponse([]); // Initial fetch
    mockApiResponse({ ProjectID: 1, Name: 'New Project' }); // Create response
    mockApiResponse([createMockProject({ ProjectID: 1, Name: 'New Project' })]); // Refetch

    const user = userEvent.setup();
    render(<ProjectList user={mockAdminUser} token={mockToken} />);

    await user.click(screen.getByText('+ New Project'));

    await user.type(screen.getByPlaceholderText('Name'), 'New Project');
    await user.type(screen.getByPlaceholderText('Start Date'), '2024-01-01');
    await user.type(screen.getByPlaceholderText('End Date'), '2024-12-31');
    await user.type(screen.getByPlaceholderText('Total Budget'), '10000');

    await user.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`
        },
        body: JSON.stringify({
          Name: 'New Project',
          StartDate: '2024-01-01',
          EndDate: '2024-12-31',
          TotalBudget: '10000'
        })
      });
    });
  });

  it('opens edit form when edit button is clicked', async () => {
    const mockProject = createMockProject({ 
      ProjectID: 1, 
      Name: 'Test Project',
      StartDate: '2024-01-01',
      EndDate: '2024-12-31',
      TotalBudget: 10000
    });
    mockApiResponse([mockProject]);

    const user = userEvent.setup();
    render(<ProjectList user={mockAdminUser} token={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit'));

    expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10000')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('deletes project when delete button is clicked and confirmed', async () => {
    const mockProject = createMockProject({ ProjectID: 1, Name: 'Test Project' });
    mockApiResponse([mockProject]); // Initial fetch
    mockApiResponse({ success: true }); // Delete response
    mockApiResponse([]); // Refetch after delete

    const user = userEvent.setup();
    render(<ProjectList user={mockAdminUser} token={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/projects/1', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${mockToken}` }
      });
    });
  });

  it('cancels form when cancel button is clicked', async () => {
    mockApiResponse([]);
    const user = userEvent.setup();
    render(<ProjectList user={mockAdminUser} token={mockToken} />);

    await user.click(screen.getByText('+ New Project'));
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();

    await user.click(screen.getByText('Cancel'));
    expect(screen.queryByPlaceholderText('Name')).not.toBeInTheDocument();
  });

  it('displays project details correctly', async () => {
    const mockProject = createMockProject({
      ProjectID: 1,
      Name: 'Test Project',
      StartDate: '2024-01-01T00:00:00Z',
      TotalBudget: 10000
    });
    mockApiResponse([mockProject]);

    render(<ProjectList user={mockAdminUser} token={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('(Start: 2024-01-01)')).toBeInTheDocument();
      expect(screen.getByText('Budget: 10000')).toBeInTheDocument();
    });
  });

  it('requires form fields to be filled', () => {
    mockApiResponse([]);
    render(<ProjectList user={mockAdminUser} token={mockToken} />);

    const user = userEvent.setup();
    
    // Click new project to open form
    user.click(screen.getByText('+ New Project'));

    // Check that required fields are marked as required
    expect(screen.getByPlaceholderText('Name')).toBeRequired();
    expect(screen.getByPlaceholderText('Start Date')).toBeRequired();
    expect(screen.getByPlaceholderText('Total Budget')).toBeRequired();
  });

  it('matches snapshot', async () => {
    const mockProjects = [createMockProject({ ProjectID: 1, Name: 'Test Project' })];
    mockApiResponse(mockProjects);

    const { container } = render(<ProjectList user={mockAdminUser} token={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    expect(container.firstChild).toMatchSnapshot();
  });
});
