import React, { useState, useCallback } from 'react';
import './App.css';
import './components/ui/AppBar.css';
import { AppBar } from './components/ui/AppBar';
import type { User, LoginCredentials, RegisterData } from './types';
import { getApiUrl } from './api/config';
import { useTheme } from './hooks/useTheme';
import { DashboardSwitcher } from './components/Dashboard/Dashboards';
import { LoginForm, RegisterForm } from './components/Auth/AuthForms';
import { DevicesView } from './components/Devices';
import { ReportsView } from './components/Reports';
import { SettingsView } from './components/Settings';
import { ProgramsView } from './components/Programs';
import { ProjectsView } from './components/Projects/ProjectsView';
import { TasksView } from './components/Tasks/TasksView';
import { EnterprisesView } from './components/Enterprises/EnterprisesView';
import { ContractsView } from './components/Contracts/ContractsView';
import { DocumentsView } from './components/Documents/DocumentsView';
import { AdvancedReportsView, NotificationsView, PermissionsView, UserManagementView } from './components/Phase3';
import { SitesView } from './components/Sites/SitesView';
import { ResourceList } from './components/Resources/ResourceList';

function App(): React.ReactElement {
  const [authError, setAuthError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  useTheme(); // Initialize theme
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  const handleLogin = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setAuthError(null);
    try {
      const res = await fetch(getApiUrl('/auth/login'), {
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
    setCurrentView('dashboard');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleViewChange = useCallback((view: string): void => {
    setCurrentView(view);
  }, []);

  const renderContent = (): React.ReactElement => {
    if (!token || !user) {
      return showRegister ? (
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
      );
    }

    switch (currentView) {
      case 'devices':
        return <DevicesView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      case 'programs':
        return <ProgramsView />;
      case 'projects':
        return <ProjectsView onNavigateToTasks={(projectId) => { setSelectedProjectId(projectId); setCurrentView('tasks'); }} />;
      case 'tasks':
        return <TasksView initialProjectId={selectedProjectId} />;
      case 'enterprises':
        return <EnterprisesView />;
      case 'contracts':
        return <ContractsView />;
      case 'documents':
        return <DocumentsView />;
      case 'users':
        return <UserManagementView />;
      case 'notifications':
        return <NotificationsView />;
      case 'permissions':
        return <PermissionsView />;
      case 'advanced-reports':
        return <AdvancedReportsView />;
      case 'measurements':
        return <SitesView />;
      case 'resources':
        return <ResourceList user={user} token={token} />;
      case 'dashboard':
      default:
        return <DashboardSwitcher user={user} onLogout={handleLogout} token={token} />;
    }
  };

  const handleRegister = useCallback(async (data: RegisterData): Promise<void> => {
    setRegisterError(null);
    try {
      const res = await fetch(getApiUrl('/auth/register'), {
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
      <AppBar 
        user={user} 
        onLogout={handleLogout} 
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      <main className="app__main">
        <section className="auth-section">
          {renderContent()}
        </section>
      </main>
    </div>
  );
}

export default App;
