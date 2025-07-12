import React, { useState, useEffect, useCallback } from 'react';
import { UserRole } from '../../types';
import type { Project, ProjectForm, User } from '../../types';
import { TaskList } from '../Tasks/TaskList';

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

  const fetchProjects = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/projects', {
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

  return (
    <div>
      <h3>Projects</h3>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <button 
        onClick={() => { setShowForm(true); setEditId(null); }} 
        disabled={!canEdit}
      >
        + New Project
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="project-form">
          <input 
            name="Name" 
            placeholder="Name" 
            value={form.Name} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="StartDate" 
            type="date" 
            placeholder="Start Date" 
            value={form.StartDate} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="EndDate" 
            type="date" 
            placeholder="End Date" 
            value={form.EndDate} 
            onChange={handleChange} 
          />
          <input 
            name="TotalBudget" 
            type="number" 
            placeholder="Total Budget" 
            value={form.TotalBudget} 
            onChange={handleChange} 
            required 
          />
          <button type="submit">{editId ? 'Update' : 'Create'}</button>
          <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}>
            Cancel
          </button>
        </form>
      )}
      <ul>
        {projects.map((p) => (
          <li key={p.ProjectID}>
            <b>{p.Name}</b> (Start: {p.StartDate?.slice(0, 10)}) Budget: {p.TotalBudget}
            {canEdit && (
              <>
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p.ProjectID)}>Delete</button>
              </>
            )}
            <TaskList projectId={p.ProjectID} user={user} token={token} />
          </li>
        ))}
      </ul>
    </div>
  );
}
