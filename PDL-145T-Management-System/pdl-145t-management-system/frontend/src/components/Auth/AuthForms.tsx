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
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
      <button type="button" onClick={onShowRegister}>
        Register
      </button>
    </form>
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
    <form onSubmit={handleSubmit} className="register-form">
      <h2>Register</h2>
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <select value={role} onChange={e => setRole(e.target.value as UserRole)}>
        <option value={UserRole.USER}>User</option>
        <option value={UserRole.ADMIN}>Admin</option>
        <option value={UserRole.SUPERVISOR}>Supervisor</option>
        <option value={UserRole.FINANCE}>Finance</option>
        <option value={UserRole.CONSTRUCTION}>Construction</option>
      </select>
      <button type="submit">Register</button>
      <button type="button" onClick={onShowLogin}>
        Back to Login
      </button>
    </form>
  );
}
