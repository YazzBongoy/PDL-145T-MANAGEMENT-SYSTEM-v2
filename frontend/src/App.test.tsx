import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from './test/utils';
import App from './App';
import { createMockUser } from './test/utils';
import { UserRole } from './types';
import userEvent from '@testing-library/user-event';

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

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
  mockLocalStorage.getItem.mockReturnValue(null);
  mockFetch.mockImplementation((url: string, options?: { method?: string }) => {
    if (url === '/api/health') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'healthy', timestamp: '2024-01-01T00:00:00Z', uptime: 3600 }) });
    }
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
    if (url === '/api/auth/login' && options?.method === 'POST') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'test-token', user: createMockUser({ role: UserRole.ADMIN }) }) });
    }
    if (url === '/api/auth/register' && options?.method === 'POST') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, user: createMockUser({ role: UserRole.USER }), token: 'test-token' }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
  vi.stubGlobal('fetch', mockFetch);
});

describe('App', () => {
  it('renders app header and health check section', async () => {
    render(<App />);
    expect(screen.getByText('PDL-145T')).toBeInTheDocument();
    expect(screen.getByText('Management System')).toBeInTheDocument();
  });

  it('renders login form when no user is logged in', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('renders register form when register button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByPlaceholderText('your@email.com'), 'admin@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });

  it('handles login errors', async () => {
    mockFetch.mockImplementation((url: string, options?: { method?: string }) => {
      if (url === '/api/health') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'healthy', timestamp: '2024-01-01T00:00:00Z', uptime: 3600 }) });
      }
      if (url === '/api/auth/login' && options?.method === 'POST') {
        return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: 'Invalid credentials' }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByPlaceholderText('your@email.com'), 'wrong@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('handles successful registration', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    await user.type(screen.getByPlaceholderText('John Doe'), 'New User');
    await user.type(screen.getByPlaceholderText('your@email.com'), 'new@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('handles registration errors', async () => {
    mockFetch.mockImplementation((url: string, options?: { method?: string }) => {
      if (url === '/api/health') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'healthy', timestamp: '2024-01-01T00:00:00Z', uptime: 3600 }) });
      }
      if (url === '/api/auth/register' && options?.method === 'POST') {
        return Promise.resolve({ ok: false, status: 400, json: () => Promise.resolve({ error: 'Email already exists' }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    await user.type(screen.getByPlaceholderText('John Doe'), 'Test User');
    await user.type(screen.getByPlaceholderText('your@email.com'), 'existing@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  it('renders dashboard when user is logged in', async () => {
    const mockUser = createMockUser({ role: UserRole.ADMIN });
    mockLocalStorage.getItem.mockImplementation((key: string): string | null => {
      if (key === 'auth') return JSON.stringify({ token: 'test-token', user: mockUser });
      return null;
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });

  it('renders health status when available', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Status: healthy')).toBeInTheDocument();
    });
  });

  it('renders health error when health check fails', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/health') {
        return Promise.reject(new Error('Health check failed'));
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Health check failed/)).toBeInTheDocument();
    });
  });

  it('handles logout correctly', async () => {
    const mockUser = createMockUser({ role: UserRole.ADMIN });
    mockLocalStorage.getItem.mockImplementation((key: string): string | null => {
      if (key === 'auth') return JSON.stringify({ token: 'test-token', user: mockUser });
      return null;
    });
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Logout'));
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth');
  });

  it('navigates back to login from register form', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back to Login' }));
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
  });
});
