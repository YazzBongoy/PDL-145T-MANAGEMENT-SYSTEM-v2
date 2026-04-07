import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/utils';
import { LoginForm, RegisterForm } from './AuthForms';
import { UserRole } from '../../types';
import userEvent from '@testing-library/user-event';

describe('LoginForm', () => {
  const mockOnLogin = vi.fn();
  const mockOnShowRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(
      <LoginForm
        onLogin={mockOnLogin}
        onShowRegister={mockOnShowRegister}
        error={null}
      />
    );

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Invalid credentials';
    render(
      <LoginForm
        onLogin={mockOnLogin}
        onShowRegister={mockOnShowRegister}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass('error');
  });

  it('calls onLogin with correct credentials on form submission', async () => {
    const user = userEvent.setup();
    render(
      <LoginForm
        onLogin={mockOnLogin}
        onShowRegister={mockOnShowRegister}
        error={null}
      />
    );

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('calls onShowRegister when register button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <LoginForm
        onLogin={mockOnLogin}
        onShowRegister={mockOnShowRegister}
        error={null}
      />
    );

    const registerButton = screen.getByRole('button', { name: 'Register' });
    await user.click(registerButton);

    expect(mockOnShowRegister).toHaveBeenCalled();
  });

  it('requires email and password fields', () => {
    render(
      <LoginForm
        onLogin={mockOnLogin}
        onShowRegister={mockOnShowRegister}
        error={null}
      />
    );

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('has correct input types', () => {
    render(
      <LoginForm
        onLogin={mockOnLogin}
        onShowRegister={mockOnShowRegister}
        error={null}
      />
    );

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('matches snapshot', () => {
    const { container } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onShowRegister={mockOnShowRegister}
        error={null}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('RegisterForm', () => {
  const mockOnRegister = vi.fn();
  const mockOnShowLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders register form correctly', () => {
    render(
      <RegisterForm
        onRegister={mockOnRegister}
        onShowLogin={mockOnShowLogin}
        error={null}
      />
    );

    expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to Login' })).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Email already exists';
    render(
      <RegisterForm
        onRegister={mockOnRegister}
        onShowLogin={mockOnShowLogin}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass('error');
  });

  it('calls onRegister with correct data on form submission', async () => {
    const user = userEvent.setup();
    render(
      <RegisterForm
        onRegister={mockOnRegister}
        onShowLogin={mockOnShowLogin}
        error={null}
      />
    );

    await user.type(screen.getByPlaceholderText('Name'), 'John Doe');
    await user.type(screen.getByPlaceholderText('Email'), 'john@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.selectOptions(screen.getByRole('combobox'), UserRole.ADMIN);
    await user.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(mockOnRegister).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.ADMIN,
      });
    });
  });

  it('calls onShowLogin when back to login button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <RegisterForm
        onRegister={mockOnRegister}
        onShowLogin={mockOnShowLogin}
        error={null}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Back to Login' }));

    expect(mockOnShowLogin).toHaveBeenCalled();
  });

  it('has all role options in select', () => {
    render(
      <RegisterForm
        onRegister={mockOnRegister}
        onShowLogin={mockOnShowLogin}
        error={null}
      />
    );
    
    expect(screen.getByRole('option', { name: 'User' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Supervisor' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Finance' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Construction' })).toBeInTheDocument();
  });

  it('defaults to USER role', () => {
    render(
      <RegisterForm
        onRegister={mockOnRegister}
        onShowLogin={mockOnShowLogin}
        error={null}
      />
    );

    const roleSelect = screen.getByRole('combobox') as HTMLSelectElement;
    expect(roleSelect.value).toBe(UserRole.USER);
  });

  it('requires name, email, and password fields', () => {
    render(
      <RegisterForm
        onRegister={mockOnRegister}
        onShowLogin={mockOnShowLogin}
        error={null}
      />
    );

    expect(screen.getByPlaceholderText('Name')).toBeRequired();
    expect(screen.getByPlaceholderText('Email')).toBeRequired();
    expect(screen.getByPlaceholderText('Password')).toBeRequired();
  });

  it('has correct input types', () => {
    render(
      <RegisterForm
        onRegister={mockOnRegister}
        onShowLogin={mockOnShowLogin}
        error={null}
      />
    );

    expect(screen.getByPlaceholderText('Name')).toHaveAttribute('type', 'text');
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');
  });

  it('matches snapshot', () => {
    const { container } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onShowLogin={mockOnShowLogin}
        error={null}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
