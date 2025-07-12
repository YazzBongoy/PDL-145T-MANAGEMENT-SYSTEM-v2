import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from './test/utils';
import App from './App';
import { mockApiResponse, mockApiError, createMockUser } from './test/utils';
import { UserRole } from './types';
import userEvent from '@testing-library/user-event';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('renders app header and health check section', () => {
    mockApiResponse({ status: 'healthy', timestamp: '2024-01-01T00:00:00Z', uptime: 3600 });
    
    render(<App />);

    expect(screen.getByText('PDL-145T Management System')).toBeInTheDocument();
    expect(screen.getByText('Welcome to the PDL-145T Management System frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend Health Status')).toBeInTheDocument();
  });

  it('renders login form when no user is logged in', () => {
    mockApiResponse({ status: 'healthy', timestamp: '2024-01-01T00:00:00Z', uptime: 3600 });
    
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('renders register form when register button is clicked', async () => {
    mockApiResponse({ status: 'healthy', timestamp: '2024-01-01T00:00:00Z', uptime: 3600 });
    
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Register' }));

    expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    mockApiResponse({ status: 'healthy', timestamp: '2024-01-01T00:00:00Z', uptime: 3600 });
    
    const mockUser = createMockUser({ role: UserRole.ADMIN });
    const loginResponse = { token: 'test-token', user: mockUser };
    
    // Mock the login API call
    mockApiResponse(loginResponse);
    
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByPlaceholderText('Email'), 'admin@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@example.com', password: 'password123' })
      });
    });
  });

  it('handles login errors', async () => {
    mockApiResponse({ status: 'healthy', timestamp: '2024-01-01T00:00:00Z', uptime: 3600 });
    
    // Mock failed login
    const errorResponse = {
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Invalid credentials' })
    };
    (global.fetch as any).mockResolvedValueOnce(errorResponse);
    
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByPlaceholderText('Email'), 'wrong@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('handles successful registration', async () => {
    mockApiResponse({ status: 'healthy', timestamp: '2024-01-01T00:00:00Z', uptime: 3600 });
    
    const mockUser = createMockUser({ name: 'New User', email: 'new@example.com' });
    const registerResponse = { success: true };
    const loginResponse = { token: 'test-token', user: mockUser };
    
    // Mock the register and login API calls
    mockApiResponse(registerResponse);
    mockApiResponse(loginResponse);
    
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Register' }));

    await user.type(screen.getByPlaceholderText('Name'), 'New User');
    await user.type(screen.getByPlaceholderText('Email'), 'new@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
          role: UserRole.USER
        })
      });
    });
  });

  it('handles registration errors', async () => {
    mockApiResponse({ status: 'healthy', timestamp: '2024-01-01T00:00:00Z', uptime: 3600 });
    
    // Mock failed registration
    const errorResponse = {
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Email already exists' })
    };
    (global.fetch as any).mockResolvedValueOnce(errorResponse);
    
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Register' }));

    await user.type(screen.getByPlaceholderText('Name'), 'Test User');
    await user.type(screen.getByPlaceholderText('Email'), 'existing@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  it('renders dashboard when user is logged in', () => {
    const mockUser = createMockUser({ role: UserRole.ADMIN });
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'test-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    mockApiResponse({ status: 'healthy', timestamp: '2024-01-01T00:00:00Z', uptime: 3600 });
    
    render(<App />);

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('renders health status when available', async () => {
    const healthData = {
      status: 'healthy',
      timestamp: '2024-01-01T00:00:00Z',
      uptime: 3600
    };
    mockApiResponse(healthData);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Status: healthy')).toBeInTheDocument();
      expect(screen.getByText('Uptime: 3600 seconds')).toBeInTheDocument();
    });
  });

  it('renders health error when health check fails', async () => {
    const errorMessage = 'Health check failed';
    mockApiError(errorMessage);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('refreshes health status when refresh button is clicked', async () => {
    const healthData = {
      status: 'healthy',
      timestamp: '2024-01-01T00:00:00Z',
      uptime: 3600
    };
    mockApiResponse(healthData);
    mockApiResponse({ ...healthData, uptime: 3700 });

    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Uptime: 3600 seconds')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Refresh'));

    await waitFor(() => {
      expect(screen.getByText('Uptime: 3700 seconds')).toBeInTheDocument();
    });
  });

  it('handles logout correctly', async () => {
    const mockUser = createMockUser({ role: UserRole.ADMIN });
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'test-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    mockApiResponse({ status: 'healthy', timestamp: '2024-01-01T00:00:00Z', uptime: 3600 });
    
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();

    await user.click(screen.getByText('Logout'));

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });

  it('navigates back to login from register form', async () => {
    mockApiResponse({ status: 'healthy', timestamp: '2024-01-01T00:00:00Z', uptime: 3600 });
    
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Register' }));
    expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back to Login' }));
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    mockApiResponse({ status: 'healthy', timestamp: '2024-01-01T00:00:00Z', uptime: 3600 });
    
    const { container } = render(<App />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
