import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './components/ui/AppBar.css';
import { AppBar } from './components/ui/AppBar';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute';
import { DashboardSwitcher } from './components/Dashboard/Dashboards';
import { LoginForm, RegisterForm } from './components/Auth/AuthForms';
import { ResourceList } from './components/Resources/ResourceList';
import { DocumentList } from './components/Documents/DocumentList';
import { ProjectList } from './components/Projects/ProjectList';
import { MeasurementList } from './components/Measurements/MeasurementList';
import { ValidationList } from './components/Validations/ValidationList';
import { ReportList } from './components/Reports/ReportList';
import { useApi } from './hooks/useApi';
import type { HealthStatus } from './types';

function LoginView(): React.ReactElement {
  const { login, authError } = useAuth();
  const [showRegister, setShowRegister] = React.useState(false);
  const { register, registerError } = useAuth();

  if (showRegister) {
    return (
      <RegisterForm
        onRegister={register}
        onShowLogin={() => setShowRegister(false)}
        error={registerError}
      />
    );
  }

  return (
    <LoginForm
      onLogin={login}
      onShowRegister={() => setShowRegister(true)}
      error={authError}
    />
  );
}

function DashboardView(): React.ReactElement {
  const { user, logout, token } = useAuth();
  return <DashboardSwitcher user={user!} onLogout={logout} token={token!} />;
}

function ProjectsView(): React.ReactElement {
  const { user, token } = useAuth();
  return <ProjectList user={user!} token={token!} />;
}

function ResourcesView(): React.ReactElement {
  const { user, token } = useAuth();
  return <ResourceList user={user!} token={token!} />;
}

function DocumentsView(): React.ReactElement {
  const { token } = useAuth();
  return <DocumentList token={token!} />;
}

function MeasurementsView(): React.ReactElement {
  const { user, token } = useAuth();
  return <MeasurementList user={user!} token={token!} />;
}

function ValidationsView(): React.ReactElement {
  const { user, token } = useAuth();
  return <ValidationList user={user!} token={token!} />;
}

function ReportsView(): React.ReactElement {
  const { user, token } = useAuth();
  return <ReportList user={user!} token={token!} />;
}

function App(): React.ReactElement {
  const { user, logout } = useAuth();
  const { data: healthStatus, loading, error, refetch: refreshHealth } = useApi<HealthStatus>('/api/health');

  return (
    <div className="app">
      <AppBar user={user} onLogout={logout} />

      <main className="app__main">
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginView />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/projects" element={<ProjectsView />} />
            <Route path="/resources" element={<ResourcesView />} />
            <Route path="/documents" element={<DocumentsView />} />
            <Route path="/measurements" element={<MeasurementsView />} />
            <Route path="/validations" element={<ValidationsView />} />
            <Route path="/reports" element={<ReportsView />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

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
              <div className={`status-indicator ${(healthStatus.status ?? 'unknown').toLowerCase()}`}>
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
