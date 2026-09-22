import React from 'react';
import type { DashboardStats } from '../../types';

interface ValidationStatusProps {
  validations: DashboardStats['validations'];
}

const ValidationStatus: React.FC<ValidationStatusProps> = ({ validations }) => {
  const { byStatus, recent } = validations;

  const statusConfig = {
    Pending: { color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
    Approved: { color: '#10b981', bg: '#d1fae5', icon: '✅' },
    Rejected: { color: '#ef4444', bg: '#fee2e2', icon: '❌' },
  };

  return (
    <div className="validation-status-card">
      <h3 className="section-title">Validation Status</h3>
      <div className="status-summary">
        {(Object.entries(byStatus) as [keyof typeof statusConfig, number][]).map(([status, count]) => (
          <div
            key={status}
            className="status-badge-large"
            style={{ backgroundColor: statusConfig[status].bg, color: statusConfig[status].color }}
          >
            <span className="status-icon">{statusConfig[status].icon}</span>
            <span className="status-count">{count}</span>
            <span className="status-label">{status}</span>
          </div>
        ))}
      </div>
      {recent.length > 0 && (
        <div className="recent-validations">
          <h4 className="subsection-title">Recent Validations</h4>
          <ul className="recent-list">
            {recent.map((v) => (
              <li key={v.ValidationID} className="recent-item">
                <span
                  className="status-dot"
                  style={{ backgroundColor: statusConfig[v.Status as keyof typeof statusConfig]?.color || '#94a3b8' }}
                />
                <span className="item-info">
                  <span className="item-primary">{v.Site.Name}</span>
                  <span className="item-secondary">{v.GeneratedBy}</span>
                </span>
                <span className="item-date">
                  {new Date(v.Timestamp).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ValidationStatus;
