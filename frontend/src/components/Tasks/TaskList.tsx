import React, { useState, useEffect, useCallback } from 'react';
import { TaskStatus, UserRole } from '../../types';
import type { Task, TaskForm, User } from '../../types';
import { ExpenseList } from '../Expenses/ExpenseList';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';
import { TaskStatusBadge, type TaskStatusType } from '../ui/StatusBadge';
import { Table, type TableColumn } from '../ui/Table';
import { Tooltip } from '../ui/Tooltip';
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
      Description: task.Description || '',
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

  // Map TaskStatus to our StatusBadge format
  const mapTaskStatus = (status: TaskStatus): TaskStatusType => {
    switch (status) {
      case TaskStatus.NOT_STARTED:
        return 'not-started';
      case TaskStatus.IN_PROGRESS:
        return 'in-progress';
      case TaskStatus.COMPLETED:
        return 'completed';
      default:
        return 'not-started';
    }
  };

  // Define table columns
  const columns: TableColumn<Task>[] = [
    {
      key: 'description',
      title: 'Description',
      dataIndex: 'Description',
      width: '30%'
    },
    {
      key: 'status',
      title: 'Status',
      width: '20%',
      align: 'center',
      render: (_, record) => (
        <TaskStatusBadge
          taskStatus={mapTaskStatus(record.CompletionStatus)}
          metadata={{
            description: `Task ${record.CompletionStatus === TaskStatus.COMPLETED ? 'completed' : 
                         record.CompletionStatus === TaskStatus.IN_PROGRESS ? 'in progress' : 'not started'}`,
            ...(record.Duration && { value: `${record.Duration} days` })
          }}
        />
      )
    },
    {
      key: 'assigned',
      title: 'Assigned To',
      width: '20%',
      render: (_, record) => (
        record.AssignedTo ? (
          <Tooltip content={`Assigned to ${record.AssignedTo}`}>
            <span className="font-medium">{record.AssignedTo}</span>
          </Tooltip>
        ) : (
          <span className="text-gray-500 italic">Unassigned</span>
        )
      )
    },
    {
      key: 'duration',
      title: 'Duration',
      width: '15%',
      align: 'center',
      render: (_, record) => record.Duration ? `${record.Duration} days` : '-'
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '15%',
      align: 'right',
      render: (_, record) => canEdit ? (
        <div className="flex gap-2">
          <button 
            onClick={() => handleEdit(record)} 
            className="btn btn--secondary btn--sm"
            title="Edit task"
          >
            Edit
          </button>
          <button 
            onClick={() => handleDelete(record.TaskID)} 
            className="btn btn--danger btn--sm"
            title="Delete task"
          >
            Delete
          </button>
        </div>
      ) : null
    }
  ];

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
      
      <Table
        dataSource={tasks}
        columns={columns}
        loading={loading}
        rowKey={(record) => record.TaskID}
        emptyState={
          <>
            <div className="text-4xl mb-4">📋</div>
            <div className="font-medium text-gray-600">No tasks found</div>
            <div className="text-sm text-gray-500 mt-2">
              {canEdit ? 'Click "+ New Task" to add your first task' : 'Tasks will appear here when added'}
            </div>
          </>
        }
        caption="Project tasks with status indicators"
      />
      
      {/* Expenses for each task - shown in expanded rows or separate section */}
      {tasks.length > 0 && (
        <div className="mt-6">
          {tasks.map((task) => (
            <div key={`expenses-${task.TaskID}`} className="mb-4">
              <ExpenseList taskId={task.TaskID} user={user} token={token} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
