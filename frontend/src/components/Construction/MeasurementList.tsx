import React, { useState, useEffect } from 'react';
import type { Measurement } from '../../types';
import { fetchMyMeasurements, deleteMeasurement } from '../../api/construction';
import './ConstructionDashboard.css';

interface MeasurementListProps {
  refresh?: number;
}

export function MeasurementList({ refresh }: MeasurementListProps): React.ReactElement {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [filter, setFilter] = useState({
    type: '',
    siteId: '',
  });

  useEffect(() => {
    loadMeasurements();
  }, [refresh]);

  async function loadMeasurements() {
    try {
      setLoading(true);
      const data = await fetchMyMeasurements();
      setMeasurements(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load measurements');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(measurementId: number | undefined) {
    if (!measurementId) return;
    
    if (!confirm('Are you sure you want to delete this measurement?')) {
      return;
    }

    try {
      setDeleting(measurementId);
      await deleteMeasurement(measurementId);
      await loadMeasurements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete measurement');
    } finally {
      setDeleting(null);
    }
  }

  const filteredMeasurements = measurements.filter((m) => {
    if (filter.type && m.MeasurementType !== filter.type) return false;
    if (filter.siteId && !m.SiteID.toLowerCase().includes(filter.siteId.toLowerCase())) return false;
    return true;
  });

  const measurementTypes = [...new Set(measurements.map((m) => m.MeasurementType))];

  if (loading) {
    return <div className="loading-state">Loading measurements...</div>;
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Error: {error}</p>
        <button onClick={loadMeasurements} className="btn btn--primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="measurement-list">
      <div className="section-header">
        <h3>My Measurements</h3>
        <button onClick={loadMeasurements} className="btn btn--secondary btn--sm">Refresh</button>
      </div>

      <div className="filters">
        <div className="form-group">
          <label>Filter by Type:</label>
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          >
            <option value="">All Types</option>
            {measurementTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Filter by Site:</label>
          <input
            type="text"
            value={filter.siteId}
            onChange={(e) => setFilter({ ...filter, siteId: e.target.value })}
            placeholder="Site ID..."
          />
        </div>

        <button
          onClick={() => setFilter({ type: '', siteId: '' })}
          className="btn btn--secondary btn--sm"
        >
          Clear Filters
        </button>
      </div>

      {filteredMeasurements.length === 0 ? (
        <div className="empty-state">
          <p>No measurements found</p>
        </div>
      ) : (
        <div className="measurement-table-wrapper">
          <table className="measurement-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Site</th>
                <th>Type</th>
                <th>Value</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMeasurements.map((measurement) => (
                <tr key={measurement.MeasurementID}>
                  <td>#{measurement.MeasurementID}</td>
                  <td>{measurement.SiteID}</td>
                  <td>{measurement.MeasurementType}</td>
                  <td>
                    {measurement.Value} {measurement.Unit}
                  </td>
                  <td>
                    {measurement.Date
                      ? new Date(measurement.Date).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(measurement.MeasurementID)}
                      disabled={deleting === measurement.MeasurementID}
                      className="btn btn--danger btn--sm"
                    >
                      {deleting === measurement.MeasurementID ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="measurement-count">
        Showing {filteredMeasurements.length} of {measurements.length} measurements
      </div>
    </div>
  );
}
