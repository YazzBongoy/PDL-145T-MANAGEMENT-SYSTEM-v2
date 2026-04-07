import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test/utils';
import { AdminDashboard, SupervisorDashboard, FinanceDashboard, ConstructionDashboard, UserDashboard, DashboardSwitcher } from './Dashboards';
import { mockUser, mockAdminUser, mockSupervisorUser, createMockUser } from '../../test/utils';
import { UserRole } from '../../types';
import userEvent from '@testing-library/user-event';

const mockOnLogout = vi.fn();
const mockToken = 'test-token';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminDashboard', () => {
  it('renders admin dashboard with correct title', () => {
    render(<AdminDashboard user={mockAdminUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', async () => {
    const user = userEvent.setup();
    render(<AdminDashboard user={mockAdminUser} onLogout={mockOnLogout} token={mockToken} />);
    await user.click(screen.getByRole('button', { name: /logout/i }));
    expect(mockOnLogout).toHaveBeenCalled();
  });

  it('matches snapshot', () => {
    const { container } = render(<AdminDashboard user={mockAdminUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('SupervisorDashboard', () => {
  it('renders supervisor dashboard with correct title', () => {
    render(<SupervisorDashboard user={mockSupervisorUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(screen.getByText('Supervisor Dashboard')).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', async () => {
    const user = userEvent.setup();
    render(<SupervisorDashboard user={mockSupervisorUser} onLogout={mockOnLogout} token={mockToken} />);
    await user.click(screen.getByRole('button', { name: /logout/i }));
    expect(mockOnLogout).toHaveBeenCalled();
  });

  it('matches snapshot', () => {
    const { container } = render(<SupervisorDashboard user={mockSupervisorUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('FinanceDashboard', () => {
  const financeUser = createMockUser({ role: UserRole.FINANCE, name: 'Finance User' });

  it('renders finance dashboard with correct title and user name', () => {
    render(<FinanceDashboard user={financeUser} onLogout={mockOnLogout} />);
    expect(screen.getByText('Finance Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome, Finance User!')).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', async () => {
    const user = userEvent.setup();
    render(<FinanceDashboard user={financeUser} onLogout={mockOnLogout} />);
    await user.click(screen.getByRole('button', { name: /logout/i }));
    expect(mockOnLogout).toHaveBeenCalled();
  });

  it('matches snapshot', () => {
    const { container } = render(<FinanceDashboard user={financeUser} onLogout={mockOnLogout} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('ConstructionDashboard', () => {
  const constructionUser = createMockUser({ role: UserRole.CONSTRUCTION, name: 'Construction User' });

  it('renders construction dashboard with correct title and user name', () => {
    render(<ConstructionDashboard user={constructionUser} onLogout={mockOnLogout} />);
    expect(screen.getByText('Construction Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome, Construction User!')).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConstructionDashboard user={constructionUser} onLogout={mockOnLogout} />);
    await user.click(screen.getByRole('button', { name: /logout/i }));
    expect(mockOnLogout).toHaveBeenCalled();
  });

  it('matches snapshot', () => {
    const { container } = render(<ConstructionDashboard user={constructionUser} onLogout={mockOnLogout} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('UserDashboard', () => {
  it('renders user dashboard with correct title and user name', () => {
    render(<UserDashboard user={mockUser} onLogout={mockOnLogout} />);
    expect(screen.getByText('User Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome, Test User!')).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', async () => {
    const user = userEvent.setup();
    render(<UserDashboard user={mockUser} onLogout={mockOnLogout} />);
    await user.click(screen.getByRole('button', { name: /logout/i }));
    expect(mockOnLogout).toHaveBeenCalled();
  });

  it('matches snapshot', () => {
    const { container } = render(<UserDashboard user={mockUser} onLogout={mockOnLogout} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('DashboardSwitcher', () => {
  it('renders AdminDashboard for admin users', () => {
    render(<DashboardSwitcher user={mockAdminUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('renders SupervisorDashboard for supervisor users', () => {
    render(<DashboardSwitcher user={mockSupervisorUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(screen.getByText('Supervisor Dashboard')).toBeInTheDocument();
  });

  it('renders FinanceDashboard for finance users', () => {
    const financeUser = createMockUser({ role: UserRole.FINANCE });
    render(<DashboardSwitcher user={financeUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(screen.getByText('Finance Dashboard')).toBeInTheDocument();
  });

  it('renders ConstructionDashboard for construction users', () => {
    const constructionUser = createMockUser({ role: UserRole.CONSTRUCTION });
    render(<DashboardSwitcher user={constructionUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(screen.getByText('Construction Dashboard')).toBeInTheDocument();
  });

  it('renders UserDashboard for regular users', () => {
    render(<DashboardSwitcher user={mockUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(screen.getByText('User Dashboard')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<DashboardSwitcher user={mockUser} onLogout={mockOnLogout} token={mockToken} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

