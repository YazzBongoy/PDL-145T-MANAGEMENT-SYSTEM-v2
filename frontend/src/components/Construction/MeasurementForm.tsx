import React, { useState, useEffect } from 'react';
import type { Task } from '../../types';
import { fetchMyTasks, createMeasurement } from '../../api/construction';
import './ConstructionDashboard.css';

interface MeasurementFormProps {
  userId: number;
  onMeasurementCreated?: () => void;
}

const MEASUREMENT_TYPES = [
  { value: 'Distance', label: 'Distance', defaultUnit: 'meters' },
  { value: 'Area', label: 'Area', defaultUnit: 'sq_meters' },
  { value: 'Volume', label: 'Volume', defaultUnit: 'cubic_meters' },
  { value: 'Weight', label: 'Weight', defaultUnit: 'kg' },
  { value: 'Time', label: 'Time', defaultUnit: 'hours' },
];

export function MeasurementForm({ userId, onMeasurementCreated }: MeasurementFormProps): React.ReactElement {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    taskId: '',
    siteId: '',
    measurementType: 'Distance',
    value: '',
    unit: 'meters',
    notes: '',
  });

  useEffect(() => {
    loadTasks();
  }, [userId]);

  async function loadTasks() {
    try {
      setLoading(true);
      const data = await fetchMyTasks();
      const myTasks = data.filter(task => task.AssignedTo === userId.toString());
      setTasks(myTasks);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  function handleTypeChange(type: string) {
    const typeInfo = MEASUREMENT_TYPES.find(t => t.value === type);
    setFormData(prev => ({
      ...prev,
      measurementType: type,
      unit: typeInfo?.defaultUnit || '',
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.taskId || !formData.siteId || !formData.value) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      await createMeasurement(parseInt(formData.taskId), {
        SiteID: formData.siteId,
        MeasurementType: formData.measurementType,
        Value: parseFloat(formData.value),
        Unit: formData.unit,
        Notes: formData.notes,
      });

      setSuccess('Measurement recorded successfully!');
      setFormData({
        taskId: '',
        siteId: '',
        measurementType: 'Distance',
        value: '',
        unit: 'meters',
        notes: '',
      });
      
      onMeasurementCreated?.();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create measurement');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="measurement-form">
      <h3>Record Measurement</h3>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="taskId">Related Task *</label>
          <select
            id="taskId"
            value={formData.taskId}
            onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
            required
            disabled={loading}
          >
            <option value="">Select a task...</option>
            {tasks.map((task) => (
              <option key={task.TaskID} value={task.TaskID}>
                #{task.TaskID} - {task.Description?.substring(0, 50) || 'No description'}...
              </option>
            ))}
          </select>
          {loading && <span className="loading-text"> Loading tasks...</span>}
        </div>

        <div className="form-group">
          <label htmlFor="siteId">Site ID *</label>
          <input
            type="text"
            id="siteId"
            value={formData.siteId}
            onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
            placeholder="e.g., SITE001"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="measurementType">Type *</label>
            <select
              id="measurementType"
              value={formData.measurementType}
              onChange={(e) => handleTypeChange(e.target.value)}
              required
            >
              {MEASUREMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="value">Value *</label>
            <input
              type="number"
              id="value"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="unit">Unit *</label>
            <input
              type="text"
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional details about this measurement..."
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Record Measurement'}
          </button>
        </div>
      </form>
    </div>
  );
}
