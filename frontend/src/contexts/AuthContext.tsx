import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { User, LoginCredentials, RegisterData } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  authError: string | null;
  registerError: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readInitialAuth(): AuthState {
  try {
    const raw = localStorage.getItem('auth');
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw);
    return { token: parsed.token ?? null, user: parsed.user ?? null };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [auth, setAuth] = useState<AuthState>(readInitialAuth);
  const [authError, setAuthError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }
      const data = await res.json();
      setAuth({ token: data.token, user: data.user });
      localStorage.setItem('auth', JSON.stringify({ token: data.token, user: data.user }));
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Login failed');
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<void> => {
    setRegisterError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const response = await res.json();
        throw new Error(response.error || 'Registration failed');
      }
      await login({ email: data.email, password: data.password });
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Registration failed');
    }
  }, [login]);

  const logout = useCallback((): void => {
    setAuth({ token: null, user: null });
    localStorage.removeItem('auth');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...auth, login, register, logout, authError, registerError }),
    [auth, login, register, logout, authError, registerError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
