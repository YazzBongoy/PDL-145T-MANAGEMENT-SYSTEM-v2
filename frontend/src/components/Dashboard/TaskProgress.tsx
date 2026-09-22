import React from 'react';
import type { DashboardStats } from '../../types';

interface TaskProgressProps {
  tasks: DashboardStats['tasks'];
}

const TaskProgress: React.FC<TaskProgressProps> = ({ tasks }) => {
  const { byStatus, total, completionRate } = tasks;

  const segments = [
    { label: 'Completed', count: byStatus.Completed, color: '#10b981' },
    { label: 'In Progress', count: byStatus.InProgress, color: '#3b82f6' },
    { label: 'Not Started', count: byStatus.NotStarted, color: '#94a3b8' },
  ];

  return (
    <div className="task-progress-card">
      <h3 className="section-title">Task Progress</h3>
      <div className="progress-overview">
        <div className="progress-circle">
          <svg viewBox="0 0 36 36" className="circular-chart">
            <path
              className="circle-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="circle"
              strokeDasharray={`${completionRate}, 100`}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" className="percentage">
              {completionRate}%
            </text>
          </svg>
        </div>
        <div className="progress-legend">
          {segments.map((seg) => (
            <div key={seg.label} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: seg.color }} />
              <span className="legend-label">{seg.label}</span>
              <span className="legend-count">{seg.count}</span>
            </div>
          ))}
          <div className="legend-item legend-total">
            <span className="legend-label">Total</span>
            <span className="legend-count">{total}</span>
          </div>
        </div>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className="progress-segment"
              style={{
                width: total > 0 ? `${(seg.count / total) * 100}%` : '0%',
                backgroundColor: seg.color,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskProgress;
