import React, { useState, useEffect, useCallback } from 'react';
import { UserRole } from '../../types';
import type { Project, ProjectForm, User, Task } from '../../types';
import { TaskList } from '../Tasks/TaskList';
import { GanttChart } from './Gantt';
import { SprintList } from './SprintList';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';
import { HealthStatusBadge } from '../ui/StatusBadge';
import { Table, type TableColumn } from '../ui/Table';
import { Tooltip } from '../ui/Tooltip';
import '../ui/List.css';
import { getApiUrl } from '../../api/config';

interface ProjectListProps {
  user: User;
  token: string;
}

export function ProjectList({ user, token }: ProjectListProps): React.ReactElement {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProjectForm>({ 
    Name: '', 
    StartDate: '', 
    EndDate: '', 
    TotalBudget: '' 
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');
  const [projectTasks, setProjectTasks] = useState<Record<number, Task[]>>({});

  const fetchProjectTasks = useCallback(async (projectId: number): Promise<void> => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setProjectTasks(prev => ({ ...prev, [projectId]: data }));
    } catch (err) {
      console.error('Failed to fetch tasks for Gantt:', err);
    }
  }, [token]);

  const handleViewModeChange = useCallback((mode: 'list' | 'gantt'): void => {
    setViewMode(mode);
    if (mode === 'gantt') {
      // Fetch tasks for all projects when switching to Gantt view
      projects.forEach(p => {
        if (!projectTasks[p.ProjectID]) {
          fetchProjectTasks(p.ProjectID);
        }
      });
    }
  }, [projects, projectTasks, fetchProjectTasks]);

  const fetchProjects = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl('/api/projects'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/projects/${editId}` : '/api/projects';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save project');
      setShowForm(false);
      setForm({ Name: '', StartDate: '', EndDate: '', TotalBudget: '' });
      setEditId(null);
      await fetchProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save project');
    }
  }, [editId, form, token, fetchProjects]);

  const handleEdit = useCallback((project: Project): void => {
    setForm({
      Name: project.Name,
      StartDate: project.StartDate ? project.StartDate.slice(0, 10) : '',
      EndDate: project.EndDate ? project.EndDate.slice(0, 10) : '',
      TotalBudget: project.TotalBudget.toString(),
    });
    setEditId(project.ProjectID);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(async (id: number): Promise<void> => {
    if (!window.confirm('Delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete project');
      await fetchProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project');
    }
  }, [token, fetchProjects]);

  const canEdit = user.role === UserRole.ADMIN || user.role === UserRole.SUPERVISOR;

  // Helper functions for project status
  const getProjectStatus = (project: Project): 'healthy' | 'warning' | 'critical' => {
    const today = new Date();
    const startDate = new Date(project.StartDate);
    const endDate = project.EndDate ? new Date(project.EndDate) : null;
    
    // If project hasn't started yet
    if (startDate > today) {
      return 'healthy';
    }
    
    // If project has an end date and is past due
    if (endDate && today > endDate) {
      return 'critical';
    }
    
    // If project is nearing end date (within 2 weeks)
    if (endDate) {
      const twoWeeksFromNow = new Date(today);
      twoWeeksFromNow.setDate(today.getDate() + 14);
      if (endDate <= twoWeeksFromNow) {
        return 'warning';
      }
    }
    
    return 'healthy';
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string | null): string => {
    if (!endDate) return 'No deadline';
    
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    return `${diffDays} days remaining`;
  };

  // Define table columns
  const columns: TableColumn<Project>[] = [
    {
      key: 'name',
      title: 'Project Name',
      dataIndex: 'Name',
      width: '25%',
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-900">{record.Name}</div>
          <div className="text-sm text-gray-500">
            Started {formatDate(record.StartDate)}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      width: '15%',
      align: 'center',
      render: (_, record) => (
        <HealthStatusBadge
          health={getProjectStatus(record)}
          metadata={{
            description: (() => {
              const status = getProjectStatus(record);
              if (status === 'critical') return 'Project is overdue or at risk';
              if (status === 'warning') return 'Project deadline approaching';
              return 'Project is on track';
            })(),
            value: getDaysRemaining(record.EndDate || null),
            lastUpdated: 'Just now'
          }}
        />
      )
    },
    {
      key: 'dates',
      title: 'Timeline',
      width: '20%',
      render: (_, record) => (
        <div className="text-sm">
          <div>
            <span className="font-medium">Start:</span> {formatDate(record.StartDate)}
          </div>
          {record.EndDate && (
            <div className="text-gray-600">
              <span className="font-medium">End:</span> {formatDate(record.EndDate)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'budget',
      title: 'Budget',
      width: '15%',
      align: 'right',
      render: (_, record) => (
        <Tooltip content={`Total project budget: ${formatCurrency(record.TotalBudget)}`}>
          <span className="font-medium text-green-600">
            {formatCurrency(record.TotalBudget)}
          </span>
        </Tooltip>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '15%',
      align: 'right',
      render: (_, record) => canEdit ? (
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => handleEdit(record)} 
            className="btn btn--secondary btn--sm"
            title="Edit project"
          >
            Edit
          </button>
          <button 
            onClick={() => handleDelete(record.ProjectID)} 
            className="btn btn--danger btn--sm"
            title="Delete project"
          >
            Delete
          </button>
        </div>
      ) : null
    }
  ];

  return (
    <Card variant="outlined">
      <CardHeader 
        title="Projects" 
        actions={
          <div className="flex gap-2">
            <div className="view-toggle">
              <button
                onClick={() => handleViewModeChange('list')}
                className={`btn btn--sm ${viewMode === 'list' ? 'btn--primary' : 'btn--secondary'}`}
                aria-pressed={viewMode === 'list'}
              >
                List
              </button>
              <button
                onClick={() => handleViewModeChange('gantt')}
                className={`btn btn--sm ${viewMode === 'gantt' ? 'btn--primary' : 'btn--secondary'}`}
                aria-pressed={viewMode === 'gantt'}
              >
                Timeline
              </button>
            </div>
            <button 
              onClick={() => { setShowForm(true); setEditId(null); }} 
              disabled={!canEdit}
              className="btn btn--primary"
              aria-expanded={showForm}
              aria-label="Add new project"
              aria-controls="project-form"
            >
              + New Project
            </button>
          </div>
        }
      />
      {error && <p className="error" role="alert" aria-live="polite">{error}</p>}
      {showForm && (
        <form onSubmit={handleSubmit} className="project-form" id="project-form" aria-labelledby="project-form-title">
          <label htmlFor="project-name">Project Name</label>
          <input 
            id="project-name"
            name="Name" 
            placeholder="Name" 
            value={form.Name} 
            onChange={handleChange} 
            required 
            className="input"
          />
          <label htmlFor="project-start-date">Start Date</label>
          <input 
            id="project-start-date"
            name="StartDate" 
            type="date" 
            placeholder="Start Date" 
            value={form.StartDate} 
            onChange={handleChange} 
            required 
            className="input"
          />
          <label htmlFor="project-end-date">End Date</label>
          <input 
            id="project-end-date"
            name="EndDate" 
            type="date" 
            placeholder="End Date" 
            value={form.EndDate} 
            onChange={handleChange} 
            className="input"
          />
          <label htmlFor="project-budget">Total Budget</label>
          <input 
            id="project-budget"
            name="TotalBudget" 
            type="number" 
            placeholder="Total Budget" 
            value={form.TotalBudget} 
            onChange={handleChange} 
            required 
            className="input"
          />
          <button type="submit" className="btn btn--primary">{editId ? 'Update' : 'Create'}</button>
          <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn btn--secondary">
            Cancel
          </button>
        </form>
      )}
      
      {viewMode === 'list' ? (
        <Table
          dataSource={projects}
          columns={columns}
          loading={loading}
          rowKey={(record) => record.ProjectID}
          emptyState={
            <>
              <div className="text-4xl mb-4">📁</div>
              <div className="font-medium text-gray-600">No projects found</div>
              <div className="text-sm text-gray-500 mt-2">
                {canEdit ? 'Click "+ New Project" to create your first project' : 'Projects will appear here when created'}
              </div>
            </>
          }
          caption="Active projects with status and budget tracking"
        />
      ) : (
        <div className="gantt-view">
          {projects.map(project => (
            <GanttChart
              key={project.ProjectID}
              projectName={project.Name}
              projectStart={project.StartDate}
              projectEnd={project.EndDate}
              tasks={projectTasks[project.ProjectID] || []}
            />
          ))}
          {projects.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📁</div>
              <div>No projects to display in timeline view</div>
            </div>
          )}
        </div>
      )}
      
      {viewMode === 'list' && projects.length > 0 && (
        <div className="mt-8 space-y-6">
          {projects.map((project) => (
            <div key={`tasks-${project.ProjectID}`}>
              <div className="border-t pt-6">
                <TaskList projectId={project.ProjectID} user={user} token={token} />
              </div>
              <div className="border-t pt-6 mt-6">
                <SprintList projectId={project.ProjectID} user={user} token={token} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
