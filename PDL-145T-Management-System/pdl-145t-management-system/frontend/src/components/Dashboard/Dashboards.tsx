import React from 'react';
import { UserRole } from '../../types';
import type { User } from '../../types';
import { ProjectList } from '../Projects/ProjectList';
import { ResourceList } from '../Resources/ResourceList';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  token: string;
}

export function AdminDashboard({ user, onLogout, token }: DashboardProps): React.ReactElement {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <ProjectList user={user} token={token} />
      <ResourceList user={user} token={token} />
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export function SupervisorDashboard({ user, onLogout, token }: DashboardProps): React.ReactElement {
  return (
    <div>
      <h2>Supervisor Dashboard</h2>
      <ProjectList user={user} token={token} />
      <ResourceList user={user} token={token} />
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

interface SimpleDashboardProps {
  user: User;
  onLogout: () => void;
}

export function FinanceDashboard({ user, onLogout }: SimpleDashboardProps): React.ReactElement {
  return (
    <div>
      <h2>Finance Dashboard</h2>
      <p>Welcome, {user.name}!</p>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export function ConstructionDashboard({ user, onLogout }: SimpleDashboardProps): React.ReactElement {
  return (
    <div>
      <h2>Construction Dashboard</h2>
      <p>Welcome, {user.name}!</p>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export function UserDashboard({ user, onLogout }: SimpleDashboardProps): React.ReactElement {
  return (
    <div>
      <h2>User Dashboard</h2>
      <p>Welcome, {user.name}!</p>
      <button onClick={onLogout}>Logout</button>
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
    return <FinanceDashboard user={user} onLogout={onLogout} />;
  case UserRole.CONSTRUCTION:
    return <ConstructionDashboard user={user} onLogout={onLogout} />;
  default:
    return <UserDashboard user={user} onLogout={onLogout} />;
  }
}
