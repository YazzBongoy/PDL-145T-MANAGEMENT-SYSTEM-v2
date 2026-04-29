import React, { useState, useEffect, useCallback } from 'react';
import type { Project, Expense, Task } from '../../types';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';
import './FinanceDashboard.css';
import { getApiUrl } from '../../api/config';

interface FinanceDashboardProps {
  user: { name: string };
  token: string;
}

interface ProjectWithExpenses extends Project {
  tasks?: TaskWithExpenses[];
}

interface TaskWithExpenses extends Task {
  Expenses?: Expense[];
}

interface FinanceSummary {
  totalBudget: number;
  totalExpenses: number;
  remainingBudget: number;
  budgetUtilization: number;
  projectCount: number;
  expenseCount: number;
}

export function FinanceDashboard({ user, token }: FinanceDashboardProps): React.ReactElement {
  const [projects, setProjects] = useState<ProjectWithExpenses[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const fetchFinanceData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      // Fetch all projects
      const projectsRes = await fetch(getApiUrl('/api/projects'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
      }

      // Fetch all expenses across all tasks
      const allExpenses: Expense[] = [];
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        for (const project of projectsData) {
          const tasksRes = await fetch(`/api/projects/${project.ProjectID}/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (tasksRes.ok) {
            const tasks = await tasksRes.json();
            for (const task of tasks) {
              const expensesRes = await fetch(`/api/tasks/${task.TaskID}/expenses`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (expensesRes.ok) {
                const taskExpenses = await expensesRes.json();
                allExpenses.push(...taskExpenses);
              }
            }
          }
        }
      }
      setExpenses(allExpenses);
    } catch (err) {
      console.error('Failed to fetch finance data:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const calculateSummary = useCallback((): FinanceSummary => {
    const totalBudget = projects.reduce((sum, p) => sum + Number(p.TotalBudget), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.Cost), 0);
    
    return {
      totalBudget,
      totalExpenses,
      remainingBudget: totalBudget - totalExpenses,
      budgetUtilization: totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0,
      projectCount: projects.length,
      expenseCount: expenses.length
    };
  }, [projects, expenses]);

  const getProjectExpenses = (projectId: number): number => {
    let total = 0;
    const project = projects.find(p => p.ProjectID === projectId);
    if (project?.tasks) {
      for (const task of project.tasks) {
        if (task.Expenses) {
          total += task.Expenses.reduce((sum, e) => sum + Number(e.Cost), 0);
        }
      }
    }
    // Also check global expenses for this project's tasks
    return total;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const summary = calculateSummary();

  const expenseByCategory = expenses.reduce((acc, expense) => {
    const category = expense.Description?.split(' ')[0] || 'Other';
    acc[category] = (acc[category] || 0) + Number(expense.Cost);
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="finance-dashboard">
        <div className="finance-header">
          <h2>Finance Dashboard</h2>
          <p>Welcome, {user.name}!</p>
        </div>
        <p>Loading financial data...</p>
      </div>
    );
  }

  return (
    <div className="finance-dashboard">
      <div className="finance-header">
        <h2>Finance Dashboard</h2>
        <p>Welcome, {user.name}! Monitor budgets and track expenses across all projects.</p>
      </div>

      {/* Summary Cards */}
      <div className="finance-summary-grid">
        <Card variant="outlined" className="summary-card">
          <div className="summary-value">{formatCurrency(summary.totalBudget)}</div>
          <div className="summary-label">Total Budget</div>
          <div className="summary-meta">Across {summary.projectCount} projects</div>
        </Card>

        <Card variant="outlined" className="summary-card">
          <div className="summary-value" style={{ color: '#dc2626' }}>
            {formatCurrency(summary.totalExpenses)}
          </div>
          <div className="summary-label">Total Expenses</div>
          <div className="summary-meta">{summary.expenseCount} transactions</div>
        </Card>

        <Card variant="outlined" className="summary-card">
          <div className="summary-value" style={{ color: summary.remainingBudget >= 0 ? '#16a34a' : '#dc2626' }}>
            {formatCurrency(summary.remainingBudget)}
          </div>
          <div className="summary-label">Remaining Budget</div>
          <div className="summary-meta">
            {summary.budgetUtilization.toFixed(1)}% utilized
          </div>
        </Card>

        <Card variant="outlined" className="summary-card">
          <div className="summary-value">
            {summary.budgetUtilization.toFixed(1)}%
          </div>
          <div className="summary-label">Budget Utilization</div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${Math.min(summary.budgetUtilization, 100)}%`,
                backgroundColor: summary.budgetUtilization > 90 ? '#dc2626' : summary.budgetUtilization > 75 ? '#f59e0b' : '#16a34a'
              }}
            />
          </div>
        </Card>
      </div>

      {/* Budget by Project */}
      <Card variant="outlined" className="mt-6">
        <CardHeader title="Budget by Project" level="h3" />
        <div className="project-budget-list">
          {projects.map(project => {
            const projectExpenses = getProjectExpenses(project.ProjectID);
            const utilization = Number(project.TotalBudget) > 0 
              ? (projectExpenses / Number(project.TotalBudget)) * 100 
              : 0;
            
            return (
              <div 
                key={project.ProjectID} 
                className="project-budget-item"
                onClick={() => setSelectedProject(selectedProject === project.ProjectID ? null : project.ProjectID)}
              >
                <div className="project-budget-header">
                  <div>
                    <h4>{project.Name}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(project.StartDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(Number(project.TotalBudget))}</div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(projectExpenses)} spent
                    </div>
                  </div>
                </div>
                <div className="project-progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min(utilization, 100)}%`,
                      backgroundColor: utilization > 90 ? '#dc2626' : utilization > 75 ? '#f59e0b' : '#16a34a'
                    }}
                  />
                </div>
                <div className="text-sm text-right mt-1">
                  {utilization.toFixed(1)}% utilized
                </div>
              </div>
            );
          })}
          {projects.length === 0 && (
            <p className="text-gray-500 text-center py-4">No projects found</p>
          )}
        </div>
      </Card>

      {/* Recent Expenses */}
      <Card variant="outlined" className="mt-6">
        <CardHeader title="Recent Expenses" level="h3" />
        <div className="expense-list">
          {expenses
            .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
            .slice(0, 10)
            .map(expense => (
              <div key={expense.ExpenseID} className="expense-item">
                <div className="expense-description">
                  {expense.Description || `Expense #${expense.ExpenseID}`}
                </div>
                <div className="expense-meta">
                  <span className="expense-date">
                    {new Date(expense.Date).toLocaleDateString()}
                  </span>
                  <span className="expense-amount">
                    {formatCurrency(Number(expense.Cost))}
                  </span>
                </div>
              </div>
            ))}
          {expenses.length === 0 && (
            <p className="text-gray-500 text-center py-4">No expenses recorded yet</p>
          )}
        </div>
      </Card>

      {/* Expense Categories */}
      {Object.keys(expenseByCategory).length > 0 && (
        <Card variant="outlined" className="mt-6">
          <CardHeader title="Expenses by Category" level="h3" />
          <div className="category-list">
            {Object.entries(expenseByCategory)
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount]) => (
                <div key={category} className="category-item">
                  <span className="category-name">{category}</span>
                  <span className="category-amount">{formatCurrency(amount)}</span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}
