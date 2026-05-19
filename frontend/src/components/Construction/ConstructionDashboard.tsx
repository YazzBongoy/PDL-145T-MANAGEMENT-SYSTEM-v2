import React, { useState } from 'react';
import type { User } from '../../types';
import { MeasurementForm } from './MeasurementForm';
import { MeasurementList } from './MeasurementList';
import { SprintBoardView } from './SprintBoardView';
import { ValidationSubmission } from './ValidationSubmission';
import './ConstructionDashboard.css';

interface ConstructionDashboardProps {
  user: User;
  onLogout: () => void;
}

type TabId = 'overview' | 'measurements' | 'sprint' | 'validation';

export function ConstructionDashboard({ user, onLogout }: ConstructionDashboardProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [measurementRefresh, setMeasurementRefresh] = useState(0);

  function handleMeasurementCreated() {
    setMeasurementRefresh(prev => prev + 1);
  }

  const tabs = [
    { id: 'overview' as TabId, label: 'Vue d\'ensemble', icon: '�' },
    { id: 'measurements' as TabId, label: 'Measurements', icon: '📏' },
    { id: 'sprint' as TabId, label: 'Sprint Board', icon: '�' },
    { id: 'validation' as TabId, label: 'Validation', icon: '✓' },
  ];

  return (
    <div className="construction-dashboard">
      <div className="dashboard-header">
        <h2>Construction Dashboard</h2>
        <p>Welcome, {user.name} | Role: {user.role}</p>
      </div>

      <nav className="tab-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h3>Vue d'ensemble du projet</h3>
            <p>Statistiques générales et indicateurs clés de performance.</p>
          </div>
        )}

        {activeTab === 'measurements' && (
          <div className="measurements-section">
            <MeasurementForm
              userId={user.id}
              onMeasurementCreated={handleMeasurementCreated}
            />
            <div style={{ marginTop: '2rem' }}>
              <MeasurementList refresh={measurementRefresh} />
            </div>
          </div>
        )}

        {activeTab === 'sprint' && (
          <SprintBoardView projectId={1} />
        )}

        {activeTab === 'validation' && (
          <ValidationSubmission userId={user.id} />
        )}
      </div>

      <div className="dashboard-actions" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
        <button onClick={onLogout} className="btn btn--secondary">
          Logout
        </button>
      </div>
    </div>
  );
}
