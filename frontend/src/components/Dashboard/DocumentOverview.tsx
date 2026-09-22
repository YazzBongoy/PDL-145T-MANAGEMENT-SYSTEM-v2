import React from 'react';
import type { DashboardStats } from '../../types';

interface DocumentOverviewProps {
  documents: DashboardStats['documents'];
}

const DocumentOverview: React.FC<DocumentOverviewProps> = ({ documents }) => {
  const categoryConfig: Record<string, { color: string; label: string }> = {
    JURIDIQUE: { color: '#7c3aed', label: 'Juridique' },
    FINANCE: { color: '#10b981', label: 'Finance' },
    SUIVI: { color: '#3b82f6', label: 'Suivi' },
    TECHNIQUE: { color: '#f59e0b', label: 'Technique' },
    ADMIN: { color: '#64748b', label: 'Admin' },
  };

  const maxCount = Math.max(...Object.values(documents.byCategory), 1);

  return (
    <div className="document-overview-card">
      <h3 className="section-title">Documents by Category</h3>
      <div className="doc-total">
        <span className="doc-total-value">{documents.total}</span>
        <span className="doc-total-label">total documents</span>
      </div>
      <div className="doc-bars">
        {Object.entries(documents.byCategory).map(([category, count]) => {
          const config = categoryConfig[category] || { color: '#94a3b8', label: category };
          return (
            <div key={category} className="doc-bar-row">
              <span className="doc-bar-label">{config.label}</span>
              <div className="doc-bar-track">
                <div
                  className="doc-bar-fill"
                  style={{
                    width: `${(count / maxCount) * 100}%`,
                    backgroundColor: config.color,
                  }}
                />
              </div>
              <span className="doc-bar-count">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentOverview;
