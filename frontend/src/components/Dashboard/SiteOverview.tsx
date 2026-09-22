import React from 'react';
import type { DashboardStats } from '../../types';

interface SiteOverviewProps {
  sites: DashboardStats['sites'];
  measurements: DashboardStats['measurements'];
  validations: DashboardStats['validations'];
}

const SiteOverview: React.FC<SiteOverviewProps> = ({ sites, measurements, validations }) => {
  return (
    <div className="site-overview-card">
      <h3 className="section-title">Construction Sites Overview</h3>
      <div className="site-stats-grid">
        <div className="site-stat">
          <span className="site-stat-icon">🏗️</span>
          <span className="site-stat-value">{sites.total}</span>
          <span className="site-stat-label">Total Sites</span>
        </div>
        <div className="site-stat">
          <span className="site-stat-icon">🗺️</span>
          <span className="site-stat-value">{sites.territories}</span>
          <span className="site-stat-label">Territories</span>
        </div>
        <div className="site-stat">
          <span className="site-stat-icon">📐</span>
          <span className="site-stat-value">{measurements.total}</span>
          <span className="site-stat-label">Measurements</span>
        </div>
        <div className="site-stat">
          <span className="site-stat-icon">🔍</span>
          <span className="site-stat-value">{validations.byStatus.Approved}</span>
          <span className="site-stat-label">Approved</span>
        </div>
      </div>
      {validations.byStatus.Pending > 0 && (
        <div className="pending-alert">
          <span className="alert-icon">⚠️</span>
          <span className="alert-text">
            {validations.byStatus.Pending} validation(s) pending review
          </span>
        </div>
      )}
    </div>
  );
};

export default SiteOverview;
