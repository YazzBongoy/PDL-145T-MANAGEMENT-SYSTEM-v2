import React, { useState, useEffect, useCallback } from 'react';
import { UserRole } from '../../types';
import type { Sprint, Task, User } from '../../types';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';
import { TaskStatusBadge } from '../ui/StatusBadge';
import '../ui/List.css';

interface SprintListProps {
  projectId: number;
  user: User;
  token: string;
}

interface SprintWithTasks extends Sprint {
  Tasks: Task[];
  _count?: { Tasks: number };
}

export function SprintList({ projectId, user, token }: SprintListProps): React.ReactElement {
  const [sprints, setSprints] = useState<SprintWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<SprintWithTasks | null>(null);
  const [form, setForm] = useState({
    Name: '',
    StartDate: '',
    EndDate: '',
    Status: 'PLANNED'
  });

  const fetchSprints = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/sprints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch sprints');
      const data = await res.json();
      setSprints(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sprints');
    } finally {
      setLoading(false);
    }
  }, [projectId, token]);

  useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${projectId}/sprints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to create sprint');
      setShowForm(false);
      setForm({ Name: '', StartDate: '', EndDate: '', Status: 'PLANNED' });
      await fetchSprints();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create sprint');
    }
  }, [form, projectId, token, fetchSprints]);

  const handleDelete = useCallback(async (id: number): Promise<void> => {
    if (!window.confirm('Delete this sprint?')) return;
    try {
      const res = await fetch(`/api/sprints/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete sprint');
      await fetchSprints();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete sprint');
    }
  }, [token, fetchSprints]);

  const canEdit = user.role === UserRole.ADMIN || user.role === UserRole.SUPERVISOR;

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ACTIVE': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (selectedSprint) {
    return (
      <SprintBoard
        sprint={selectedSprint}
        user={user}
        token={token}
        onBack={() => setSelectedSprint(null)}
      />
    );
  }

  return (
    <Card variant="outlined" className="nested-card">
      <CardHeader
        title="Sprints"
        level="h4"
        actions={
          <button
            onClick={() => setShowForm(true)}
            disabled={!canEdit}
            className="btn btn--primary"
          >
            + New Sprint
          </button>
        }
      />
      {error && <p className="error" role="alert">{error}</p>}
      {showForm && (
        <form onSubmit={handleSubmit} className="sprint-form mb-4">
          <label>Sprint Name</label>
          <input
            name="Name"
            placeholder="Sprint Name"
            value={form.Name}
            onChange={handleChange}
            required
            className="input"
          />
          <label>Start Date</label>
          <input
            name="StartDate"
            type="date"
            value={form.StartDate}
            onChange={handleChange}
            required
            className="input"
          />
          <label>End Date</label>
          <input
            name="EndDate"
            type="date"
            value={form.EndDate}
            onChange={handleChange}
            required
            className="input"
          />
          <label>Status</label>
          <select
            name="Status"
            value={form.Status}
            onChange={handleChange}
            className="select"
          >
            <option value="PLANNED">Planned</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button type="submit" className="btn btn--primary">Create</button>
          <button type="button" onClick={() => setShowForm(false)} className="btn btn--secondary">
            Cancel
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading sprints...</p>
      ) : sprints.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <div className="text-3xl mb-2">📅</div>
          <div>No sprints yet</div>
          {canEdit && <div className="text-sm">Click "+ New Sprint" to create one</div>}
        </div>
      ) : (
        <div className="space-y-2">
          {sprints.map(sprint => (
            <div
              key={sprint.SprintID}
              className="sprint-item p-3 border rounded hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedSprint(sprint)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium">{sprint.Name}</h5>
                  <div className="text-sm text-gray-500">
                    {formatDate(sprint.StartDate)} - {formatDate(sprint.EndDate)}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(sprint.Status)}`}>
                    {sprint.Status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {sprint._count?.Tasks || sprint.Tasks?.length || 0} tasks
                  </span>
                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(sprint.SprintID);
                      }}
                      className="btn btn--danger btn--sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// Sprint Board Component (Kanban view)
interface SprintBoardProps {
  sprint: SprintWithTasks;
  user: User;
  token: string;
  onBack: () => void;
}

interface BoardColumn {
  id: string;
  title: string;
  tasks: Task[];
}

function SprintBoard({ sprint, user, token, onBack }: SprintBoardProps): React.ReactElement {
  const [tasks, setTasks] = useState<Task[]>(sprint.Tasks || []);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [showTaskSelector, setShowTaskSelector] = useState(false);

  const canEdit = user.role === UserRole.ADMIN || user.role === UserRole.SUPERVISOR;

  // Fetch available tasks for this project
  useEffect(() => {
    const fetchAvailableTasks = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/projects/${sprint.ProjectID}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const allTasks = await res.json();
          // Filter tasks not in this sprint
          const unassigned = allTasks.filter((t: Task) => 
            !tasks.some(st => st.TaskID === t.TaskID)
          );
          setAvailableTasks(unassigned);
        }
      } catch (err) {
        console.error('Failed to fetch available tasks:', err);
      }
    };
    fetchAvailableTasks();
  }, [sprint.ProjectID, tasks, token]);

  const handleDragStart = (task: Task): void => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string): Promise<void> => {
    e.preventDefault();
    if (!draggedTask) return;

    try {
      const res = await fetch(`/api/tasks/${draggedTask.TaskID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ CompletionStatus: newStatus }),
      });

      if (res.ok) {
        setTasks(prev => prev.map(t => 
          t.TaskID === draggedTask.TaskID 
            ? { ...t, CompletionStatus: newStatus as Task['CompletionStatus'] }
            : t
        ));
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
    setDraggedTask(null);
  };

  const assignTaskToSprint = async (taskId: number): Promise<void> => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/sprint`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sprintId: sprint.SprintID }),
      });

      if (res.ok) {
        const task = availableTasks.find(t => t.TaskID === taskId);
        if (task) {
          setTasks(prev => [...prev, { ...task, SprintID: sprint.SprintID }]);
          setAvailableTasks(prev => prev.filter(t => t.TaskID !== taskId));
        }
      }
    } catch (err) {
      console.error('Failed to assign task:', err);
    }
  };

  const columns: BoardColumn[] = [
    {
      id: 'NotStarted',
      title: 'To Do',
      tasks: tasks.filter(t => t.CompletionStatus === 'NotStarted')
    },
    {
      id: 'InProgress',
      title: 'In Progress',
      tasks: tasks.filter(t => t.CompletionStatus === 'InProgress')
    },
    {
      id: 'Completed',
      title: 'Done',
      tasks: tasks.filter(t => t.CompletionStatus === 'Completed')
    }
  ];

  return (
    <div className="sprint-board">
      <div className="flex justify-between items-center mb-4">
        <div>
          <button onClick={onBack} className="btn btn--secondary btn--sm mb-2">
            ← Back to Sprints
          </button>
          <h3 className="text-xl font-semibold">{sprint.Name}</h3>
          <p className="text-sm text-gray-500">
            {new Date(sprint.StartDate).toLocaleDateString()} - {new Date(sprint.EndDate).toLocaleDateString()}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowTaskSelector(true)}
            className="btn btn--primary"
          >
            + Add Task
          </button>
        )}
      </div>

      {showTaskSelector && availableTasks.length > 0 && (
        <div className="task-selector mb-4 p-4 border rounded bg-gray-50">
          <h4 className="font-medium mb-2">Select tasks to add:</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {availableTasks.map(task => (
              <div
                key={task.TaskID}
                className="flex justify-between items-center p-2 hover:bg-white rounded cursor-pointer"
                onClick={() => assignTaskToSprint(task.TaskID)}
              >
                <span>{task.Description || `Task ${task.TaskID}`}</span>
                <span className="text-sm text-gray-500">{task.AssignedTo || 'Unassigned'}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowTaskSelector(false)}
            className="btn btn--secondary btn--sm mt-2"
          >
            Close
          </button>
        </div>
      )}

      <div className="kanban-board grid grid-cols-3 gap-4">
        {columns.map(column => (
          <div
            key={column.id}
            className="kanban-column bg-gray-100 rounded p-3"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <h4 className="font-medium mb-3 flex justify-between">
              {column.title}
              <span className="text-sm text-gray-500">{column.tasks.length}</span>
            </h4>
            <div className="space-y-2">
              {column.tasks.map(task => (
                <div
                  key={task.TaskID}
                  draggable={canEdit}
                  onDragStart={() => handleDragStart(task)}
                  className="kanban-card bg-white p-3 rounded shadow-sm cursor-move hover:shadow-md transition-shadow"
                >
                  <p className="text-sm">{task.Description || `Task ${task.TaskID}`}</p>
                  <div className="flex justify-between items-center mt-2">
                    <TaskStatusBadge
                      taskStatus={
                        task.CompletionStatus === 'NotStarted' ? 'not-started' :
                        task.CompletionStatus === 'InProgress' ? 'in-progress' : 'completed'
                      }
                    />
                    {task.AssignedTo && (
                      <span className="text-xs text-gray-500">{task.AssignedTo}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
