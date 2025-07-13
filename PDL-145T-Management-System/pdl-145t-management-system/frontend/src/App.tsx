import React, { useState, useCallback } from 'react';
import './App.css';
import type { User, HealthStatus, LoginCredentials, RegisterData } from './types';
import { useApi } from './hooks/useApi';
import { DashboardSwitcher } from './components/Dashboard/Dashboards';
import { LoginForm, RegisterForm } from './components/Auth/AuthForms';

function App(): React.ReactElement {
  const [authError, setAuthError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const { data: healthStatus, loading, error, refetch: refreshHealth } = useApi<HealthStatus>('/api/health');
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  const handleLogin = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setAuthError(null);
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }
      const data = await res.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Login failed');
    }
  }, []);

  const handleLogout = useCallback((): void => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleRegister = useCallback(async (data: RegisterData): Promise<void> => {
    setRegisterError(null);
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const response = await res.json();
        throw new Error(response.error || 'Registration failed');
      }
      // Auto-login after registration
      await handleLogin({ email: data.email, password: data.password });
      setShowRegister(false);
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Registration failed');
    }
  }, [handleLogin]);

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__header-title">PDL-145T Management System</h1>
        <p className="app__header-subtitle">Welcome to the PDL-145T Management System frontend</p>
      </header>

      <main className="app__main">
        <section className="auth-section">
          {token && user ? (
            <DashboardSwitcher user={user} onLogout={handleLogout} token={token} />
          ) : showRegister ? (
            <RegisterForm
              onRegister={handleRegister}
              onShowLogin={() => setShowRegister(false)}
              error={registerError}
            />
          ) : (
            <LoginForm
              onLogin={handleLogin}
              onShowRegister={() => setShowRegister(true)}
              error={authError}
            />
          )}
        </section>
        
        <section className="health-check">
          <h2>Backend Health Status</h2>
          {loading && <p>Loading health status...</p>}
        {error && (
          <div className="error" role="alert" aria-live="polite">
            <p>Error: {error}</p>
            <button onClick={refreshHealth} className="btn btn--primary">Retry</button>
          </div>
        )}
          {healthStatus && (
            <div className="health-status" aria-live="polite">
              <div className={`status-indicator ${healthStatus.status.toLowerCase()}`}>
                Status: {healthStatus.status}
              </div>
              <p>Timestamp: {new Date(healthStatus.timestamp).toLocaleString()}</p>
              <p>Uptime: {Math.floor(healthStatus.uptime)} seconds</p>
              <button onClick={refreshHealth} className="btn btn--primary">Refresh</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
