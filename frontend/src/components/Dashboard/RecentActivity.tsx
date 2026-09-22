import React from 'react';
import type { DashboardStats } from '../../types';

interface RecentActivityProps {
  measurements: DashboardStats['measurements'];
  projects: DashboardStats['projects'];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ measurements, projects }) => {
  return (
    <div className="recent-activity-card">
      <h3 className="section-title">Recent Activity</h3>
      <div className="activity-columns">
        {measurements.recent.length > 0 && (
          <div className="activity-section">
            <h4 className="subsection-title">Latest Measurements</h4>
            <ul className="recent-list">
              {measurements.recent.map((m) => (
                <li key={m.MeasurementID} className="recent-item">
                  <span className="activity-icon" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>📐</span>
                  <span className="item-info">
                    <span className="item-primary">{m.MeasurementType}: {m.Value}</span>
                    <span className="item-secondary">{m.Site.Name}</span>
                  </span>
                  <span className="item-date">
                    {new Date(m.Date).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {projects.recent.length > 0 && (
          <div className="activity-section">
            <h4 className="subsection-title">Recent Projects</h4>
            <ul className="recent-list">
              {projects.recent.map((p) => (
                <li key={p.ProjectID} className="recent-item">
                  <span className="activity-icon" style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}>📁</span>
                  <span className="item-info">
                    <span className="item-primary">{p.Name}</span>
                    <span className="item-secondary">{p._count.Tasks} tasks</span>
                  </span>
                  <span className="item-date">
                    {new Date(p.StartDate).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
