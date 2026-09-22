import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '../../test/utils';
import { AdminDashboard, SupervisorDashboard, FinanceDashboard, ConstructionDashboard, UserDashboard, DashboardSwitcher } from './Dashboards';
import { mockUser, mockAdminUser, mockSupervisorUser, createMockUser } from '../../test/utils';
import { UserRole } from '../../types';
import userEvent from '@testing-library/user-event';

const mockOnLogout = vi.fn();
const mockToken = 'test-token';

const mockDashboardStats = {
  projects: { total: 3, recent: [] },
  tasks: { total: 10, byStatus: { NotStarted: 2, InProgress: 3, Completed: 5 }, completionRate: 50 },
  budget: { totalBudget: 100000, totalExpenses: 45000, utilization: 45 },
  expenses: { total: 15, totalCost: 45000 },
  resources: { total: 8 },
  documents: { total: 20, byCategory: { JURIDIQUE: 5, FINANCE: 4, SUIVI: 6, TECHNIQUE: 3, ADMIN: 2 } },
  sites: { total: 65, territories: 4 },
  measurements: { total: 120, recent: [] },
  validations: { total: 30, byStatus: { Pending: 5, Approved: 20, Rejected: 5 }, recent: [] },
};

const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch.mockImplementation((url: string) => {
    if (url === '/api/dashboard/stats') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockDashboardStats) });
    }
    if (url === '/api/projects') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    }
    if (url === '/api/resources') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    }
    if (url === '/api/documents/stats') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ total: 0, byCategory: {}, byPhase: {}, byTerritory: {} }) });
    }
    if (url?.includes('/api/documents')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AdminDashboard', () => {
  it('renders admin dashboard with correct title', async () => {
    render(<AdminDashboard user={mockAdminUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Key Metrics')).toBeInTheDocument();
    });
  });

  it('calls onLogout when logout button is clicked', async () => {
    const user = userEvent.setup();
    render(<AdminDashboard user={mockAdminUser} onLogout={mockOnLogout} token={mockToken} />);
    await waitFor(() => {
      expect(screen.getByText('Key Metrics')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /logout/i }));
    expect(mockOnLogout).toHaveBeenCalled();
  });

  it('displays KPI cards after loading', async () => {
    render(<AdminDashboard user={mockAdminUser} onLogout={mockOnLogout} token={mockToken} />);
    await waitFor(() => {
      expect(screen.getByText('Task Completion')).toBeInTheDocument();
      expect(screen.getByText('Budget Used')).toBeInTheDocument();
    });
  });
});

describe('SupervisorDashboard', () => {
  it('renders supervisor dashboard with correct title', async () => {
    render(<SupervisorDashboard user={mockSupervisorUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(screen.getByText('Supervisor Dashboard')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Key Metrics')).toBeInTheDocument();
    });
  });

  it('calls onLogout when logout button is clicked', async () => {
    const user = userEvent.setup();
    render(<SupervisorDashboard user={mockSupervisorUser} onLogout={mockOnLogout} token={mockToken} />);
    await waitFor(() => {
      expect(screen.getByText('Key Metrics')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /logout/i }));
    expect(mockOnLogout).toHaveBeenCalled();
  });
});

describe('FinanceDashboard', () => {
  const financeUser = createMockUser({ role: UserRole.FINANCE, name: 'Finance User' });

  it('renders finance dashboard with correct title and user name', async () => {
    render(<FinanceDashboard user={financeUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(screen.getByText('Finance Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome, Finance User')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Budget Overview')).toBeInTheDocument();
    });
  });

  it('calls onLogout when logout button is clicked', async () => {
    const user = userEvent.setup();
    render(<FinanceDashboard user={financeUser} onLogout={mockOnLogout} token={mockToken} />);
    await waitFor(() => {
      expect(screen.getByText('Budget Overview')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /logout/i }));
    expect(mockOnLogout).toHaveBeenCalled();
  });
});

describe('ConstructionDashboard', () => {
  const constructionUser = createMockUser({ role: UserRole.CONSTRUCTION, name: 'Construction User' });

  it('renders construction dashboard with correct title and user name', async () => {
    render(<ConstructionDashboard user={constructionUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(screen.getByText('Construction Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome, Construction User')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Construction Sites Overview')).toBeInTheDocument();
    });
  });

  it('calls onLogout when logout button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConstructionDashboard user={constructionUser} onLogout={mockOnLogout} token={mockToken} />);
    await waitFor(() => {
      expect(screen.getByText('Construction Sites Overview')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /logout/i }));
    expect(mockOnLogout).toHaveBeenCalled();
  });
});

describe('UserDashboard', () => {
  it('renders user dashboard with correct title and user name', async () => {
    render(<UserDashboard user={mockUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Key Metrics')).toBeInTheDocument();
    });
  });

  it('calls onLogout when logout button is clicked', async () => {
    const user = userEvent.setup();
    render(<UserDashboard user={mockUser} onLogout={mockOnLogout} token={mockToken} />);
    await waitFor(() => {
      expect(screen.getByText('Key Metrics')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /logout/i }));
    expect(mockOnLogout).toHaveBeenCalled();
  });
});

describe('DashboardSwitcher', () => {
  it('renders AdminDashboard for admin users', async () => {
    render(<DashboardSwitcher user={mockAdminUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('renders SupervisorDashboard for supervisor users', async () => {
    render(<DashboardSwitcher user={mockSupervisorUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(screen.getByText('Supervisor Dashboard')).toBeInTheDocument();
  });

  it('renders FinanceDashboard for finance users', async () => {
    const financeUser = createMockUser({ role: UserRole.FINANCE });
    render(<DashboardSwitcher user={financeUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(screen.getByText('Finance Dashboard')).toBeInTheDocument();
  });

  it('renders ConstructionDashboard for construction users', async () => {
    const constructionUser = createMockUser({ role: UserRole.CONSTRUCTION });
    render(<DashboardSwitcher user={constructionUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(screen.getByText('Construction Dashboard')).toBeInTheDocument();
  });

  it('renders UserDashboard for regular users', async () => {
    render(<DashboardSwitcher user={mockUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
