import React, { useState, useEffect, useCallback } from 'react';
import { UserRole } from '../../types';
import type { User, DashboardStats } from '../../types';
import DashboardSummary from './DashboardSummary';
import TaskProgress from './TaskProgress';
import BudgetTracker from './BudgetTracker';
import ValidationStatus from './ValidationStatus';
import RecentActivity from './RecentActivity';
import SiteOverview from './SiteOverview';
import DocumentOverview from './DocumentOverview';
import { ProjectList } from '../Projects/ProjectList';
import { ResourceList } from '../Resources/ResourceList';
import DocumentList from '../Documents/DocumentList';
import './Dashboard.css';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  token: string;
}

const useDashboardStats = (token: string) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export const AdminDashboard: React.FC<DashboardProps> = ({ user, onLogout, token }) => {
  const { stats, loading, error } = useDashboardStats(token);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, {user.name}</p>
      </div>

      {loading && <div className="loading">Loading dashboard...</div>}
      {error && <div className="error">Error: {error}</div>}

      {stats && (
        <>
          <DashboardSummary stats={stats} />

          <div className="dashboard-grid">
            <div className="grid-item span-2">
              <TaskProgress tasks={stats.tasks} />
            </div>
            <div className="grid-item">
              <BudgetTracker budget={stats.budget} expenses={stats.expenses} />
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="grid-item">
              <ValidationStatus validations={stats.validations} />
            </div>
            <div className="grid-item">
              <DocumentOverview documents={stats.documents} />
            </div>
          </div>

          <RecentActivity measurements={stats.measurements} projects={stats.projects} />

          <div className="dashboard-sections">
            <div className="section-card">
              <ProjectList user={user} token={token} />
            </div>
            <div className="section-card">
              <ResourceList user={user} token={token} />
            </div>
          </div>

          <div className="section-card full-width">
            <DocumentList token={token} />
          </div>
        </>
      )}

      <div className="dashboard-actions">
        <button className="btn btn--secondary" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export const SupervisorDashboard: React.FC<DashboardProps> = ({ user, onLogout, token }) => {
  const { stats, loading, error } = useDashboardStats(token);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Supervisor Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, {user.name}</p>
      </div>

      {loading && <div className="loading">Loading dashboard...</div>}
      {error && <div className="error">Error: {error}</div>}

      {stats && (
        <>
          <DashboardSummary stats={stats} />

          <div className="dashboard-grid">
            <div className="grid-item span-2">
              <TaskProgress tasks={stats.tasks} />
            </div>
            <div className="grid-item">
              <BudgetTracker budget={stats.budget} expenses={stats.expenses} />
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="grid-item">
              <ValidationStatus validations={stats.validations} />
            </div>
            <div className="grid-item">
              <DocumentOverview documents={stats.documents} />
            </div>
          </div>

          <RecentActivity measurements={stats.measurements} projects={stats.projects} />

          <div className="dashboard-sections">
            <div className="section-card">
              <ProjectList user={user} token={token} />
            </div>
            <div className="section-card">
              <ResourceList user={user} token={token} />
            </div>
          </div>
        </>
      )}

      <div className="dashboard-actions">
        <button className="btn btn--secondary" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export const FinanceDashboard: React.FC<DashboardProps> = ({ user, onLogout, token }) => {
  const { stats, loading, error } = useDashboardStats(token);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Finance Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, {user.name}</p>
      </div>

      {loading && <div className="loading">Loading dashboard...</div>}
      {error && <div className="error">Error: {error}</div>}

      {stats && (
        <>
          <div className="kpi-grid kpi-compact">
            <div className="kpi-card" style={{ borderLeftColor: '#10b981' }}>
              <div className="kpi-icon" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>💰</div>
              <div className="kpi-content">
                <span className="kpi-value">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(stats.budget.totalBudget)}
                </span>
                <span className="kpi-label">Total Budget</span>
              </div>
            </div>
            <div className="kpi-card" style={{ borderLeftColor: '#f59e0b' }}>
              <div className="kpi-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>📊</div>
              <div className="kpi-content">
                <span className="kpi-value">{stats.budget.utilization}%</span>
                <span className="kpi-label">Budget Utilized</span>
              </div>
            </div>
            <div className="kpi-card" style={{ borderLeftColor: '#3b82f6' }}>
              <div className="kpi-icon" style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}>🧾</div>
              <div className="kpi-content">
                <span className="kpi-value">{stats.expenses.total}</span>
                <span className="kpi-label">Total Expenses</span>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="grid-item span-2">
              <BudgetTracker budget={stats.budget} expenses={stats.expenses} />
            </div>
            <div className="grid-item">
              <ValidationStatus validations={stats.validations} />
            </div>
          </div>

          <div className="section-card full-width">
            <DocumentList token={token} />
          </div>
        </>
      )}

      <div className="dashboard-actions">
        <button className="btn btn--secondary" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export const ConstructionDashboard: React.FC<DashboardProps> = ({ user, onLogout, token }) => {
  const { stats, loading, error } = useDashboardStats(token);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Construction Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, {user.name}</p>
      </div>

      {loading && <div className="loading">Loading dashboard...</div>}
      {error && <div className="error">Error: {error}</div>}

      {stats && (
        <>
          <SiteOverview
            sites={stats.sites}
            measurements={stats.measurements}
            validations={stats.validations}
          />

          <div className="dashboard-grid">
            <div className="grid-item">
              <TaskProgress tasks={stats.tasks} />
            </div>
            <div className="grid-item">
              <ValidationStatus validations={stats.validations} />
            </div>
          </div>

          <RecentActivity measurements={stats.measurements} projects={stats.projects} />
        </>
      )}

      <div className="dashboard-actions">
        <button className="btn btn--secondary" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export const UserDashboard: React.FC<DashboardProps> = ({ user, onLogout, token }) => {
  const { stats, loading, error } = useDashboardStats(token);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, {user.name}</p>
      </div>

      {loading && <div className="loading">Loading dashboard...</div>}
      {error && <div className="error">Error: {error}</div>}

      {stats && (
        <>
          <DashboardSummary stats={stats} />

          <div className="dashboard-grid">
            <div className="grid-item">
              <TaskProgress tasks={stats.tasks} />
            </div>
            <div className="grid-item">
              <SiteOverview
                sites={stats.sites}
                measurements={stats.measurements}
                validations={stats.validations}
              />
            </div>
          </div>
        </>
      )}

      <div className="dashboard-actions">
        <button className="btn btn--secondary" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export const DashboardSwitcher: React.FC<DashboardProps> = ({ user, onLogout, token }) => {
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
};
