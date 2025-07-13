import React, { useState, useEffect, useCallback } from 'react';
import { TaskStatus, UserRole } from '../../types';
import type { Task, TaskForm, User } from '../../types';
import { ExpenseList } from '../Expenses/ExpenseList';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';
import '../ui/List.css';

interface TaskListProps {
  projectId: number;
  user: User;
  token: string;
}

export function TaskList({ projectId, user, token }: TaskListProps): React.ReactElement {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TaskForm>({ 
    Description: '', 
    Duration: '', 
    AssignedTo: '', 
    CompletionStatus: TaskStatus.NOT_STARTED 
  });
  const [editId, setEditId] = useState<number | null>(null);

  const fetchTasks = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId, token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/tasks/${editId}` : `/api/projects/${projectId}/tasks`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save task');
      setShowForm(false);
      setForm({ Description: '', Duration: '', AssignedTo: '', CompletionStatus: TaskStatus.NOT_STARTED });
      setEditId(null);
      await fetchTasks();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save task');
    }
  }, [editId, form, projectId, token, fetchTasks]);

  const handleEdit = useCallback((task: Task): void => {
    setForm({
      Description: task.Description,
      Duration: task.Duration?.toString() || '',
      AssignedTo: task.AssignedTo || '',
      CompletionStatus: task.CompletionStatus || TaskStatus.NOT_STARTED,
    });
    setEditId(task.TaskID);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(async (id: number): Promise<void> => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete task');
      await fetchTasks();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete task');
    }
  }, [token, fetchTasks]);

  const canEdit = user.role === UserRole.ADMIN || user.role === UserRole.SUPERVISOR;

  return (
    <Card variant="outlined" className="nested-card">
      <CardHeader 
        title="Tasks" 
        level="h4"
        actions={
          <button 
            onClick={() => { setShowForm(true); setEditId(null); }} 
            disabled={!canEdit}
            className="btn btn--primary"
            aria-expanded={showForm}
            aria-label="Add new task"
            aria-controls="task-form"
          >
            + New Task
          </button>
        }
      />
      {loading && <p>Loading...</p>}
      {error && <p className="error" role="alert" aria-live="polite">{error}</p>}
      {showForm && (
        <form onSubmit={handleSubmit} className="task-form" id="task-form" aria-labelledby="task-form-title">
          <label htmlFor="task-description">Description</label>
          <input 
            id="task-description"
            name="Description" 
            placeholder="Description" 
            value={form.Description} 
            onChange={handleChange} 
            required 
            className="input"
          />
          <label htmlFor="task-duration">Duration (days)</label>
          <input 
            id="task-duration"
            name="Duration" 
            type="number" 
            placeholder="Duration (days)" 
            value={form.Duration} 
            onChange={handleChange} 
            className="input"
          />
          <label htmlFor="task-assigned-to">Assigned To</label>
          <input 
            id="task-assigned-to"
            name="AssignedTo" 
            placeholder="Assigned To" 
            value={form.AssignedTo} 
            onChange={handleChange} 
            className="input"
          />
          <label htmlFor="task-status">Completion Status</label>
          <select 
            id="task-status"
            name="CompletionStatus" 
            value={form.CompletionStatus} 
            onChange={handleChange}
            className="select"
          >
            <option value={TaskStatus.NOT_STARTED}>Not Started</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.COMPLETED}>Completed</option>
          </select>
          <button type="submit" className="btn btn--primary">{editId ? 'Update' : 'Create'}</button>
          <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn btn--secondary">
            Cancel
          </button>
        </form>
      )}
      <div className="list">
        {tasks.map((t, index) => (
          <div key={t.TaskID} className={`list__item ${index % 2 === 0 ? 'zebra-row' : ''}`}>
            <b>{t.Description}</b> (Status: {t.CompletionStatus}) Assigned: {t.AssignedTo || 'Unassigned'}
            {canEdit && (
              <>
                <button onClick={() => handleEdit(t)} className="btn btn--secondary">Edit</button>
                <button onClick={() => handleDelete(t.TaskID)} className="btn btn--danger">Delete</button>
              </>
            )}
            <ExpenseList taskId={t.TaskID} user={user} token={token} />
          </div>
        ))}
      </div>
    </Card>
  );
}
