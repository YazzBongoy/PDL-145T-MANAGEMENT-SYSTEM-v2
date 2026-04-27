import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, CheckCircle, Clock, AlertCircle, Loader2, Edit2, Trash2, Calendar, User } from 'lucide-react';
import './Tasks.css';

interface Task {
  TaskID: number;
  ProjectID: number;
  Name: string;
  Description: string | null;
  Duration: number | null;
  AssignedTo: string | null;
  CompletionStatus: string;
  CreatedAt: string;
  UpdatedAt: string;
}

interface Project {
  ProjectID: number;
  Name: string;
}

interface UserType {
  id: number;
  name: string;
  email: string;
}

const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch('/api/tasks', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
};

const fetchProjects = async (): Promise<Project[]> => {
  const response = await fetch('/api/projects', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
};

const fetchUsers = async (): Promise<UserType[]> => {
  const response = await fetch('/api/users', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

const createTask = async (data: Omit<Task, 'TaskID' | 'CreatedAt' | 'UpdatedAt'>): Promise<Task> => {
  const response = await fetch(`/api/projects/${data.ProjectID}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create task');
  }
  return response.json();
};

const updateTask = async ({ id, data }: { id: number; data: Partial<Task> }): Promise<Task> => {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update task');
  }
  return response.json();
};

const deleteTask = async (id: number): Promise<void> => {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete task');
  }
};

const statusColors: Record<string, string> = {
  'NotStarted': 'status-not-started',
  'InProgress': 'status-in-progress',
  'Completed': 'status-completed',
  'Blocked': 'status-blocked',
  'NOT_STARTED': 'status-not-started',
  'IN_PROGRESS': 'status-in-progress',
  'COMPLETED': 'status-completed',
  'BLOCKED': 'status-blocked'
};

const statusLabels: Record<string, string> = {
  'NotStarted': 'Not Started',
  'InProgress': 'In Progress',
  'Completed': 'Completed',
  'Blocked': 'Blocked',
  'NOT_STARTED': 'Not Started',
  'IN_PROGRESS': 'In Progress',
  'COMPLETED': 'Completed',
  'BLOCKED': 'Blocked'
};

export function TasksView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsModalOpen(false);
      setEditingTask(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const filteredTasks = tasks?.filter(t => {
    const matchesSearch = t.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.Description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || t.CompletionStatus === statusFilter;
    const matchesProject = !projectFilter || t.ProjectID === Number(projectFilter);
    return matchesSearch && matchesStatus && matchesProject;
  }) || [];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      Name: formData.get('name') as string,
      Description: formData.get('description') as string || null,
      Duration: formData.get('duration') ? Number(formData.get('duration')) : null,
      AssignedTo: formData.get('assignedTo') as string || null,
      CompletionStatus: formData.get('status') as string,
      ProjectID: Number(formData.get('projectId'))
    };

    if (editingTask) {
      updateMutation.mutate({ id: editingTask.TaskID, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = (task: Task) => {
    if (confirm(`Are you sure you want to delete "${task.Name}"?`)) {
      deleteMutation.mutate(task.TaskID);
    }
  };

  const getProjectName = (projectId: number) => {
    return projects?.find(p => p.ProjectID === projectId)?.Name || `Project ${projectId}`;
  };

  return (
    <div className="tasks-view">
      <div className="section-header">
        <div className="section-title">
          <CheckCircle className="section-icon" size={24} />
          <h2>Tasks</h2>
        </div>
        <div className="section-actions">
          <div className="filters-row">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="filter-select" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="NotStarted">Not Started</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Blocked">Blocked</option>
            </select>
            <select 
              className="filter-select"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects?.map(p => (
                <option key={p.ProjectID} value={p.ProjectID}>{p.Name}</option>
              ))}
            </select>
          </div>
          <button className="btn btn--primary" onClick={() => { setEditingTask(null); setIsModalOpen(true); }}>
            <Plus size={16} />
            Add Task
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="loading-state">
          <Loader2 className="animate-spin" size={24} />
          <p>Loading tasks...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <AlertCircle size={24} />
          <p>Error loading tasks: {error.message}</p>
        </div>
      )}

      {!isLoading && !error && filteredTasks.length === 0 && (
        <div className="empty-state">
          <p>No tasks found. Create your first task!</p>
        </div>
      )}

      <div className="tasks-list">
        {filteredTasks.map((task) => (
          <div key={task.TaskID} className="task-card">
            <div className="task-header">
              <div className="task-info">
                <h3 className="task-name">{task.Name}</h3>
                <span className={`task-status ${statusColors[task.CompletionStatus] || 'status-default'}`}>
                  {statusLabels[task.CompletionStatus] || task.CompletionStatus}
                </span>
              </div>
              <div className="task-actions">
                <button className="btn btn--secondary btn--sm" onClick={() => handleEdit(task)}>
                  <Edit2 size={14} />
                </button>
                <button className="btn btn--danger btn--sm" onClick={() => handleDelete(task)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            {task.Description && (
              <p className="task-description">{task.Description}</p>
            )}
            
            <div className="task-meta">
              <div className="meta-item">
                <Calendar size={14} />
                <span>{getProjectName(task.ProjectID)}</span>
              </div>
              {task.Duration && (
                <div className="meta-item">
                  <Clock size={14} />
                  <span>{task.Duration} days</span>
                </div>
              )}
              {task.AssignedTo && (
                <div className="meta-item">
                  <User size={14} />
                  <span>{task.AssignedTo}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input name="name" defaultValue={editingTask?.Name} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" defaultValue={editingTask?.Description || ''} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Project *</label>
                  <select name="projectId" defaultValue={editingTask?.ProjectID} required>
                    <option value="">Select Project</option>
                    {projects?.map(p => (
                      <option key={p.ProjectID} value={p.ProjectID}>{p.Name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" defaultValue={editingTask?.CompletionStatus || 'NotStarted'}>
                    <option value="NotStarted">Not Started</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Duration (days)</label>
                  <input name="duration" type="number" defaultValue={editingTask?.Duration || ''} />
                </div>
                <div className="form-group">
                  <label>Assigned To</label>
                  <select name="assignedTo" defaultValue={editingTask?.AssignedTo || ''}>
                    <option value="">Unassigned</option>
                    {users?.map(u => (
                      <option key={u.id} value={u.email}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn--secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn--primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
