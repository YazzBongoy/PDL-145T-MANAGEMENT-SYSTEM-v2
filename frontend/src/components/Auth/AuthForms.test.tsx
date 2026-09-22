import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/utils';
import { LoginForm, RegisterForm } from './AuthForms';
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

    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
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
    expect(screen.getByText(errorMessage).closest('.alert--error')).toBeInTheDocument();
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

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const loginButton = screen.getByRole('button', { name: 'Sign In' });

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

    const registerButton = screen.getByRole('button', { name: 'Create Account' });
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

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

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

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

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

    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
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
    expect(screen.getByText(errorMessage).closest('.alert--error')).toBeInTheDocument();
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

    await user.type(screen.getByPlaceholderText('John Doe'), 'John Doe');
    await user.type(screen.getByPlaceholderText('your@email.com'), 'john@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockOnRegister).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
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

  it('requires name, email, and password fields', () => {
    render(
      <RegisterForm
        onRegister={mockOnRegister}
        onShowLogin={mockOnShowLogin}
        error={null}
      />
    );

    expect(screen.getByPlaceholderText('John Doe')).toBeRequired();
    expect(screen.getByPlaceholderText('your@email.com')).toBeRequired();
    expect(screen.getByPlaceholderText('••••••••')).toBeRequired();
  });

  it('has correct input types', () => {
    render(
      <RegisterForm
        onRegister={mockOnRegister}
        onShowLogin={mockOnShowLogin}
        error={null}
      />
    );

    expect(screen.getByPlaceholderText('John Doe')).toHaveAttribute('type', 'text');
    expect(screen.getByPlaceholderText('your@email.com')).toHaveAttribute('type', 'email');
    expect(screen.getByPlaceholderText('••••••••')).toHaveAttribute('type', 'password');
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
