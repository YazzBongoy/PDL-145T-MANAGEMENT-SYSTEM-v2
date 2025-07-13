import React, { useState } from 'react';
import { UserRole } from '../../types';
import type { LoginCredentials, RegisterData } from '../../types';

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onShowRegister: () => void;
  error: string | null;
}

export function LoginForm({ onLogin, onShowRegister, error }: LoginFormProps): React.ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    await onLogin({ email, password });
  };

  return (
    <div className="container">
      <div className="card">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Login</h2>
          {error && <div id="login-error" className="alert--error" role="alert" aria-live="polite">{error}</div>}
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="input"
            aria-invalid={!!error}
            aria-describedby={error ? 'login-error' : undefined}
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="input"
            aria-invalid={!!error}
            aria-describedby={error ? 'login-error' : undefined}
          />
          <div className="button-group">
            <button type="submit" className="btn btn--primary">Login</button>
            <button type="button" onClick={onShowRegister} className="btn btn--secondary">
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface RegisterFormProps {
  onRegister: (data: RegisterData) => Promise<void>;
  onShowLogin: () => void;
  error: string | null;
}

export function RegisterForm({ onRegister, onShowLogin, error }: RegisterFormProps): React.ReactElement {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    await onRegister({ name, email, password, role });
  };

  return (
    <div className="container">
      <div className="card">
        <form onSubmit={handleSubmit} className="register-form">
          <h2>Register</h2>
          {error && <div id="register-error" className="alert--error" role="alert" aria-live="polite">{error}</div>}
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="input"
            aria-invalid={!!error}
            aria-describedby={error ? 'register-error' : undefined}
          />
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="input"
            aria-invalid={!!error}
            aria-describedby={error ? 'register-error' : undefined}
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="input"
            aria-invalid={!!error}
            aria-describedby={error ? 'register-error' : undefined}
          />
          <label htmlFor="role">Role</label>
          <select id="role" value={role} onChange={e => setRole(e.target.value as UserRole)} className="select">
            <option value={UserRole.USER}>User</option>
            <option value={UserRole.ADMIN}>Admin</option>
            <option value={UserRole.SUPERVISOR}>Supervisor</option>
            <option value={UserRole.FINANCE}>Finance</option>
            <option value={UserRole.CONSTRUCTION}>Construction</option>
          </select>
          <div className="button-group">
            <button type="submit" className="btn btn--primary">Register</button>
            <button type="button" onClick={onShowLogin} className="btn btn--secondary">
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
