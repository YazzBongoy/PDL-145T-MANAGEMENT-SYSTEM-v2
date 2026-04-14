import React, { useState, useEffect } from 'react';
import type { Task } from '../../types';
import { fetchMyTasks, updateTaskStatus } from '../../api/construction';
import './ConstructionDashboard.css';

interface TaskListProps {
  userId: number;
}

export function TaskList({ userId }: TaskListProps): React.ReactElement {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    loadTasks();
  }, [userId]);

  async function loadTasks() {
    try {
      setLoading(true);
      const data = await fetchMyTasks();
      // Filter tasks assigned to current user
      const myTasks = data.filter(task => task.AssignedTo === userId.toString());
      setTasks(myTasks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(taskId: number, newStatus: string) {
    try {
      setUpdating(taskId);
      await updateTaskStatus(taskId, newStatus);
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'InProgress':
        return 'status-inprogress';
      default:
        return 'status-notstarted';
    }
  }

  function getNextStatus(currentStatus: string): string {
    switch (currentStatus) {
      case 'NotStarted':
        return 'InProgress';
      case 'InProgress':
        return 'Completed';
      default:
        return currentStatus;
    }
  }

  function getStatusButtonText(currentStatus: string): string {
    switch (currentStatus) {
      case 'NotStarted':
        return 'Start Task';
      case 'InProgress':
        return 'Complete';
      default:
        return 'Done';
    }
  }

  if (loading) {
    return <div className="loading-state">Loading tasks...</div>;
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Error: {error}</p>
        <button onClick={loadTasks} className="btn btn--primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="task-list">
      <div className="section-header">
        <h3>My Tasks</h3>
        <button onClick={loadTasks} className="btn btn--secondary btn--sm">Refresh</button>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks assigned to you</p>
        </div>
      ) : (
        <div className="task-grid">
          {tasks.map((task) => (
            <div key={task.TaskID} className={`task-card ${getStatusColor(task.CompletionStatus)}`}>
              <div className="task-header">
                <span className="task-id">Task #{task.TaskID}</span>
                <span className={`task-status ${getStatusColor(task.CompletionStatus)}`}>
                  {task.CompletionStatus}
                </span>
              </div>
              
              <div className="task-body">
                <p className="task-description">{task.Description}</p>
                {task.Duration && (
                  <p className="task-duration">Duration: {task.Duration} hours</p>
                )}
              </div>

              <div className="task-actions">
                {task.CompletionStatus !== 'Completed' && (
                  <button
                    onClick={() => handleStatusChange(task.TaskID, getNextStatus(task.CompletionStatus))}
                    disabled={updating === task.TaskID}
                    className="btn btn--primary"
                  >
                    {updating === task.TaskID ? 'Updating...' : getStatusButtonText(task.CompletionStatus)}
                  </button>
                )}
                {task.CompletionStatus === 'Completed' && (
                  <span className="completion-badge">✓ Completed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
