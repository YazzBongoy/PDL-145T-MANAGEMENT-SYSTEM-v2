import React from 'react';
import type { DashboardStats } from '../../types';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon, color, subtitle }) => (
  <div className="kpi-card" style={{ borderLeftColor: color }}>
    <div className="kpi-icon" style={{ backgroundColor: color + '20', color }}>
      {icon}
    </div>
    <div className="kpi-content">
      <span className="kpi-value">{value}</span>
      <span className="kpi-label">{label}</span>
      {subtitle && <span className="kpi-subtitle">{subtitle}</span>}
    </div>
  </div>
);

interface DashboardSummaryProps {
  stats: DashboardStats;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="dashboard-summary">
      <h3 className="section-title">Key Metrics</h3>
      <div className="kpi-grid">
        <KpiCard
          label="Projects"
          value={stats.projects.total}
          icon="📁"
          color="#3b82f6"
          subtitle={`${stats.tasks.total} tasks total`}
        />
        <KpiCard
          label="Task Completion"
          value={`${stats.tasks.completionRate}%`}
          icon="✅"
          color="#10b981"
          subtitle={`${stats.tasks.byStatus.Completed}/${stats.tasks.total} done`}
        />
        <KpiCard
          label="Budget Used"
          value={`${stats.budget.utilization}%`}
          icon="💰"
          color={stats.budget.utilization > 90 ? '#ef4444' : stats.budget.utilization > 70 ? '#f59e0b' : '#10b981'}
          subtitle={`${formatCurrency(stats.budget.totalExpenses)} / ${formatCurrency(stats.budget.totalBudget)}`}
        />
        <KpiCard
          label="Sites"
          value={stats.sites.total}
          icon="🏗️"
          color="#8b5cf6"
          subtitle={`${stats.sites.territories} territories`}
        />
        <KpiCard
          label="Measurements"
          value={stats.measurements.total}
          icon="📐"
          color="#06b6d4"
          subtitle=" recorded"
        />
        <KpiCard
          label="Validations"
          value={stats.validations.total}
          icon="🔍"
          color="#f59e0b"
          subtitle={`${stats.validations.byStatus.Pending} pending`}
        />
        <KpiCard
          label="Documents"
          value={stats.documents.total}
          icon="📄"
          color="#64748b"
          subtitle=" in system"
        />
        <KpiCard
          label="Expenses"
          value={stats.expenses.total}
          icon="🧾"
          color="#ec4899"
          subtitle={formatCurrency(stats.expenses.totalCost)}
        />
      </div>
    </div>
  );
};

export default DashboardSummary;
