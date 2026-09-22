import React from 'react';
import type { DashboardStats } from '../../types';

interface BudgetTrackerProps {
  budget: DashboardStats['budget'];
  expenses: DashboardStats['expenses'];
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ budget, expenses }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const remaining = budget.totalBudget - budget.totalExpenses;
  const utilizationColor =
    budget.utilization > 90 ? '#ef4444' :
    budget.utilization > 70 ? '#f59e0b' : '#10b981';

  return (
    <div className="budget-tracker-card">
      <h3 className="section-title">Budget Overview</h3>
      <div className="budget-main">
        <div className="budget-gauge">
          <div className="gauge-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={utilizationColor}
                strokeWidth="10"
                strokeDasharray={`${budget.utilization * 3.14} 314`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="gauge-label">
              <span className="gauge-value" style={{ color: utilizationColor }}>
                {budget.utilization}%
              </span>
              <span className="gauge-text">used</span>
            </div>
          </div>
        </div>
        <div className="budget-details">
          <div className="budget-row">
            <span className="budget-label">Total Budget</span>
            <span className="budget-value">{formatCurrency(budget.totalBudget)}</span>
          </div>
          <div className="budget-row">
            <span className="budget-label">Total Spent</span>
            <span className="budget-value spent">{formatCurrency(budget.totalExpenses)}</span>
          </div>
          <div className="budget-row">
            <span className="budget-label">Remaining</span>
            <span className="budget-value remaining" style={{ color: remaining >= 0 ? '#10b981' : '#ef4444' }}>
              {formatCurrency(remaining)}
            </span>
          </div>
          <div className="budget-row">
            <span className="budget-label">Total Expenses</span>
            <span className="budget-value">{expenses.total} transactions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;
