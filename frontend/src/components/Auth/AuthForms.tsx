import React, { useState } from 'react';
import { 
  AlertTriangle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Key,
  PenTool,
  CheckCircle,
  ArrowLeft,
  User
} from 'lucide-react';
import { UserRole } from '../../types';
import type { LoginCredentials, RegisterData } from '../../types';
import './AuthForms.css';

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onShowRegister: () => void;
  error: string | null;
  isLoading?: boolean;
}

export function LoginForm({ onLogin, onShowRegister, error, isLoading = false }: LoginFormProps): React.ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{email?: string; password?: string}>({});

  const validateFields = (): boolean => {
    const errors: {email?: string; password?: string} = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (validateFields() && !isLoading) {
      setFieldErrors({});
      await onLogin({ email, password });
    }
  };

  return (
    <div className="form-container">
      <div className="card card--primary">
        <div className="card__header">
          <h2 className="auth-title">Sign In</h2>
          <p className="auth-subtitle">Welcome back! Please enter your credentials</p>
        </div>
        <div className="card__body">
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div id="login-error" className="alert alert--error" role="alert" aria-live="polite">
                <AlertTriangle className="alert-icon" size={16} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={16} aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className={`input ${fieldErrors.email ? 'error' : ''}`}
                  placeholder="your@email.com"
                  aria-invalid={!!(error || fieldErrors.email)}
                  aria-describedby={error ? 'login-error' : undefined}
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={16} aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className={`input ${fieldErrors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  aria-invalid={!!(error || fieldErrors.password)}
                  aria-describedby={error ? 'login-error' : undefined}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
              <p className="form-help-text">Enter your password to access the system</p>
            </div>
            <div className="button-group">
              <button 
                type="submit" 
                className={`btn btn--primary btn--full ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="form-spinner"></span>
                    Signing In...
                  </>
                ) : (
                  <>
                    <Key className="btn-icon" size={16} aria-hidden="true" /> Sign In
                  </>
                )}
              </button>
              <button 
                type="button" 
                onClick={onShowRegister} 
                className="btn btn--outline btn--full"
                disabled={isLoading}
              >
                <PenTool className="btn-icon" size={16} aria-hidden="true" /> Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface RegisterFormProps {
  onRegister: (data: RegisterData) => Promise<void>;
  onShowLogin: () => void;
  error: string | null;
  isLoading?: boolean;
}

export function RegisterForm({ onRegister, onShowLogin, error, isLoading = false }: RegisterFormProps): React.ReactElement {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{name?: string; email?: string; password?: string}>({});

  const validateFields = (): boolean => {
    const errors: {name?: string; email?: string; password?: string} = {};
    
    if (!name.trim()) {
      errors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (validateFields() && !isLoading) {
      setFieldErrors({});
      await onRegister({ name, email, password, role });
    }
  };

  return (
    <div className="form-container">
      <div className="card card--secondary">
        <div className="card__header">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join the PDL-145T Management System</p>
        </div>
        <div className="card__body">
          <form onSubmit={handleSubmit} className="register-form">
            {error && (
              <div id="register-error" className="alert alert--error" role="alert" aria-live="polite">
                <AlertTriangle className="alert-icon" size={16} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <User className="input-icon" size={16} aria-hidden="true" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className={`input ${fieldErrors.name ? 'error' : ''}`}
                  placeholder="John Doe"
                  aria-invalid={!!(error || fieldErrors.name)}
                  aria-describedby={error ? 'register-error' : undefined}
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={16} aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className={`input ${fieldErrors.email ? 'error' : ''}`}
                  placeholder="your@email.com"
                  aria-invalid={!!(error || fieldErrors.email)}
                  aria-describedby={error ? 'register-error' : undefined}
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={16} aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className={`input ${fieldErrors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  aria-invalid={!!(error || fieldErrors.password)}
                  aria-describedby={error ? 'register-error' : undefined}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
              <p className="form-help-text">Password must be at least 8 characters</p>
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select 
                id="role" 
                value={role} 
                onChange={e => setRole(e.target.value as UserRole)} 
                className="select"
              >
                <option value={UserRole.USER}>User</option>
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.SUPERVISOR}>Supervisor</option>
                <option value={UserRole.FINANCE}>Finance</option>
                <option value={UserRole.CONSTRUCTION}>Construction</option>
              </select>
              <p className="form-help-text">Select your role in the organization</p>
            </div>
            <div className="button-group">
              <button 
                type="submit" 
                className={`btn btn--primary btn--full ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="form-spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="btn-icon" size={16} aria-hidden="true" /> Create Account
                  </>
                )}
              </button>
              <button 
                type="button" 
                onClick={onShowLogin} 
                className="btn btn--outline btn--full"
                disabled={isLoading}
              >
                <ArrowLeft className="btn-icon" size={16} aria-hidden="true" /> Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
