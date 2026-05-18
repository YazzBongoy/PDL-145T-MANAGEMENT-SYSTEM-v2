import React, { useState, useEffect } from 'react';
import type { Task, Validation } from '../../types';
import { fetchMyTasks, submitValidation, fetchTaskValidations } from '../../api/construction';
import './ConstructionDashboard.css';

interface ValidationSubmissionProps {
  userId: number;
}

export function ValidationSubmission({ userId }: ValidationSubmissionProps): React.ReactElement {
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | ''>('');
  const [taskValidations, setTaskValidations] = useState<Validation[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [userId]);

  useEffect(() => {
    if (selectedTaskId) {
      loadTaskValidations();
    }
  }, [selectedTaskId]);

  async function loadTasks() {
    try {
      setLoading(true);
      const data = await fetchMyTasks();
      const myTasks = data.filter(task => task.AssignedTo === userId.toString());
      
      // Filter to only completed tasks
      const completed = myTasks.filter(task => task.CompletionStatus === 'Completed');
      setCompletedTasks(completed);
      
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  async function loadTaskValidations() {
    if (!selectedTaskId) return;
    
    try {
      const validations = await fetchTaskValidations(selectedTaskId);
      setTaskValidations(validations);
    } catch (err) {
      // Silently fail - task may not have validations yet
      setTaskValidations([]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedTaskId) {
      setError('Please select a completed task');
      return;
    }

    if (!notes.trim()) {
      setError('Please provide validation notes');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      await submitValidation(selectedTaskId, { notes });
      
      setSuccess('Validation submitted successfully! It will be reviewed by RL → RC → CQ → CFEF.');
      setNotes('');
      
      await loadTaskValidations();
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit validation');
    } finally {
      setSubmitting(false);
    }
  }

  function getValidationStatusBadge(validation: Validation): React.ReactNode {
    if (validation.CFEF_Approval) {
      return <span className="badge badge--success">✓ CFEF Approved</span>;
    } else if (validation.CQ_Approval) {
      return <span className="badge badge--warning">⏳ CFEF Review</span>;
    } else if (validation.RC_Approval) {
      return <span className="badge badge--warning">⏳ CQ Review</span>;
    } else if (validation.RL_Approval) {
      return <span className="badge badge--warning">⏳ RC Review</span>;
    } else {
      return <span className="badge badge--info">⏳ RL Review</span>;
    }
  }

  return (
    <div className="validation-submission">
      <h3>Submit Work for Validation</h3>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      <div className="workflow-info">
        <p>
          <strong>Approval Workflow:</strong> RL → RC → CQ → CFEF
        </p>
        <p className="text-sm text-muted">
          Submit your completed work for validation. It will progress through the 4-level approval chain.
        </p>
      </div>

      {completedTasks.length === 0 ? (
        <div className="empty-state">
          <p>No completed tasks available for validation</p>
          <p className="text-sm">Complete a task first, then submit it here for approval.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task">Select Completed Task *</label>
            <select
              id="task"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value ? parseInt(e.target.value) : '')}
              required
              disabled={loading || submitting}
            >
              <option value="">Choose a completed task...</option>
              {completedTasks.map((task) => (
                <option key={task.TaskID} value={task.TaskID}>
                  #{task.TaskID} - {task.Description?.substring(0, 50) || 'No description'}...
                </option>
              ))}
            </select>
          </div>

          {selectedTaskId && taskValidations.length > 0 && (
            <div className="existing-validations">
              <h4>Existing Validations for This Task</h4>
              {taskValidations.map((validation) => (
                <div key={validation.ValidationID} className="validation-item">
                  <div className="validation-status">
                    {getValidationStatusBadge(validation)}
                  </div>
                  <p className="validation-notes">{validation.Notes}</p>
                  <p className="validation-date">
                    Submitted: {validation.SubmittedAt
                      ? new Date(validation.SubmittedAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="notes">Validation Notes *</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the work completed, quality checks performed, and any notes for reviewers..."
              rows={5}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label>Supporting Documents (Optional)</label>
            <div className="file-upload-placeholder">
              <p>📎 File upload feature coming soon</p>
              <p className="text-sm">For now, include relevant details in the notes above.</p>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting || !selectedTaskId}
            >
              {submitting ? 'Submitting...' : 'Submit for Validation'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
