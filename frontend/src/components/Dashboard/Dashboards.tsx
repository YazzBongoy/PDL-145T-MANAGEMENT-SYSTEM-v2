import React from 'react';
import { UserRole } from '../../types';
import type { User } from '../../types';
import { ProjectList } from '../Projects/ProjectList';
import { ResourceList } from '../Resources/ResourceList';
import { FinanceDashboard as FinanceDashboardFull } from './FinanceDashboard';
import './Dashboard.css';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  token: string;
}

export function AdminDashboard({ user, onLogout, token }: DashboardProps): React.ReactElement {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <ProjectList user={user} token={token} />
        </div>
        <div className="dashboard-card">
          <ResourceList user={user} token={token} />
        </div>
      </div>
      <div className="dashboard-actions">
        <button onClick={onLogout} className="btn btn--secondary">Logout</button>
      </div>
    </div>
  );
}

export function SupervisorDashboard({ user, onLogout, token }: DashboardProps): React.ReactElement {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Supervisor Dashboard</h2>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <ProjectList user={user} token={token} />
        </div>
        <div className="dashboard-card">
          <ResourceList user={user} token={token} />
        </div>
      </div>
      <div className="dashboard-actions">
        <button onClick={onLogout} className="btn btn--secondary">Logout</button>
      </div>
    </div>
  );
}

export function FinanceDashboard({ user, onLogout, token }: DashboardProps): React.ReactElement {
  return (
    <div className="dashboard-container">
      <FinanceDashboardFull user={user} token={token} />
      <div className="dashboard-actions">
        <button onClick={onLogout} className="btn btn--secondary">Logout</button>
      </div>
    </div>
  );
}

export function ConstructionDashboard({ user, onLogout, token: _token }: DashboardProps): React.ReactElement {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Construction Dashboard</h2>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <p>Welcome, {user.name}!</p>
        </div>
      </div>
      <div className="dashboard-actions">
        <button onClick={onLogout} className="btn btn--secondary">Logout</button>
      </div>
    </div>
  );
}

export function UserDashboard({ user, onLogout, token: _token }: DashboardProps): React.ReactElement {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>User Dashboard</h2>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <p>Welcome, {user.name}!</p>
        </div>
      </div>
      <div className="dashboard-actions">
        <button onClick={onLogout} className="btn btn--secondary">Logout</button>
      </div>
    </div>
  );
}

interface DashboardSwitcherProps {
  user: User;
  onLogout: () => void;
  token: string;
}

export function DashboardSwitcher({ user, onLogout, token }: DashboardSwitcherProps): React.ReactElement {
  switch (user.role) {
  case UserRole.ADMIN:
    return <AdminDashboard user={user} onLogout={onLogout} token={token} />;
  case UserRole.SUPERVISOR:
    return <SupervisorDashboard user={user} onLogout={onLogout} token={token} />;
  case UserRole.FINANCE:
    return <FinanceDashboard user={user} onLogout={onLogout} token={token} />;
  case UserRole.CONSTRUCTION:
    return <ConstructionDashboard user={user} onLogout={onLogout} token={token} />;
  default:
    return <UserDashboard user={user} onLogout={onLogout} token={token} />;
  }
}
