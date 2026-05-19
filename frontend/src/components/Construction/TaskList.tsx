import React, { useState, useEffect, useMemo } from 'react';
import type { Task } from '../../types';
import { fetchMyTasks, updateTaskStatus } from '../../api/construction';
import { getApiUrl } from '../../api/config';
import './ConstructionDashboard.css';

interface TaskListProps {
  userId: number;
}

export function TaskList({ userId }: TaskListProps): React.ReactElement {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<{ ProjectID: number; Name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    loadTasks();
    loadProjects();
  }, [userId]);

  async function loadTasks() {
    try {
      setLoading(true);
      const data = await fetchMyTasks();
      // Filter tasks assigned to current user and not completed
      const myTasks = data.filter(task => task.AssignedTo === userId.toString() && task.CompletionStatus !== 'Completed');
      setTasks(myTasks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  async function loadProjects() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/projects'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  }

  // Group tasks by Project (Lot) and Site
  const groupedTasks = useMemo(() => {
    const groups: Record<string, Record<string, Task[]>> = {};
    tasks.forEach(task => {
      const project = projects.find(p => p.ProjectID === task.ProjectID);
      const projectName = project ? project.Name : `Lot ${task.ProjectID}`;
      const siteKey = task.SiteID || 'No Site';
      if (!groups[projectName]) groups[projectName] = {};
      if (!groups[projectName][siteKey]) groups[projectName][siteKey] = [];
      groups[projectName][siteKey].push(task);
    });
    return groups;
  }, [tasks, projects]);

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
        <div>
          {Object.entries(groupedTasks).map(([projectName, sites]) => (
            <div key={projectName} className="task-group">
              <h4 className="task-group-title">{projectName}</h4>
              {Object.entries(sites).map(([siteKey, siteTasks]) => (
                <div key={siteKey} className="task-site-group">
                  <h5 className="task-site-title">{siteKey}</h5>
                  <div className="task-grid">
                    {siteTasks.map((task) => (
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
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
