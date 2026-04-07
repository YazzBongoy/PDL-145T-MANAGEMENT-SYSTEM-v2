import React from 'react';
import './ProjectMetrics.css';

interface ProjectMetricsData {
  projectName: string;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  budgetUtilization: number;
  taskCount: number;
  completedTasks: number;
  progressPercentage: number;
  daysElapsed: number;
  estimatedDaysRemaining?: number;
}

interface ProjectMetricsProps {
  data?: ProjectMetricsData;
  isLoading?: boolean;
  error?: Error | null;
}

const ProgressBar: React.FC<{ progress: number; label: string; color?: string }> = ({
  progress,
  label,
  color = '#007bff',
}) => {
  const percentage = Math.min(100, Math.max(0, progress));
  return (
    <div className="progress-bar-container">
      <div className="progress-label">
        <span>{label}</span>
        <span className="progress-value">{percentage.toFixed(1)}%</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export const ProjectMetrics: React.FC<ProjectMetricsProps> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return <div className="project-metrics loading">Loading project metrics...</div>;
  }

  if (error || !data) {
    return (
      <div className="project-metrics error">
        {error ? `Error: ${(error as Error).message}` : 'No metrics available'}
      </div>
    );
  }

  const budgetColor =
    data.budgetUtilization < 70 ? '#28a745' : data.budgetUtilization < 90 ? '#ffc107' : '#dc3545';
  const progressColor =
    data.progressPercentage < 70 ? '#007bff' : data.progressPercentage < 90 ? '#ffc107' : '#28a745';

  return (
    <div className="project-metrics">
      <div className="metrics-header">
        <h2>{data.projectName}</h2>
      </div>

      <div className="metrics-grid">
        {/* Budget Card */}
        <div className="metric-card budget">
          <div className="card-header">
            <h3>Budget Status</h3>
          </div>
          <div className="card-content">
            <div className="big-number">${data.totalSpent.toLocaleString()}</div>
            <div className="small-text">of ${data.totalBudget.toLocaleString()}</div>
            <ProgressBar progress={data.budgetUtilization} label="Budget Used" color={budgetColor} />
            <div className="metric-detail">
              <span>Remaining: ${data.remainingBudget.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="metric-card progress">
          <div className="card-header">
            <h3>Project Progress</h3>
          </div>
          <div className="card-content">
            <div className="big-number">{data.progressPercentage.toFixed(1)}%</div>
            <div className="small-text">Complete</div>
            <ProgressBar progress={data.progressPercentage} label="Progress" color={progressColor} />
            <div className="metric-detail">
              <span>
                {data.completedTasks} of {data.taskCount} tasks done
              </span>
            </div>
          </div>
        </div>

        {/* Timeline Card */}
        <div className="metric-card timeline">
          <div className="card-header">
            <h3>Timeline</h3>
          </div>
          <div className="card-content">
            <div className="timeline-info">
              <div className="timeline-row">
                <span className="timeline-label">Days Elapsed:</span>
                <span className="timeline-value">{data.daysElapsed} days</span>
              </div>
              <div className="timeline-row">
                <span className="timeline-label">Days Remaining:</span>
                <span className="timeline-value">{data.estimatedDaysRemaining || 'N/A'} days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Card */}
        <div className="metric-card tasks">
          <div className="card-header">
            <h3>Task Summary</h3>
          </div>
          <div className="card-content">
            <div className="task-summary">
              <div className="task-stat">
                <div className="task-number">{data.completedTasks}</div>
                <div className="task-label">Completed</div>
              </div>
              <div className="task-stat">
                <div className="task-number">{data.taskCount - data.completedTasks}</div>
                <div className="task-label">Remaining</div>
              </div>
              <div className="task-stat">
                <div className="task-number">{data.taskCount}</div>
                <div className="task-label">Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectMetrics;
