import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Plus, Trash2 } from 'lucide-react';
import { getApiUrl } from '../../api/config';
import type { Permission } from '../../types';
import './Phase3.css';

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const response = await fetch(getApiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

export function PermissionsView(): React.ReactElement {
  const queryClient = useQueryClient();
  const [moduleFilter, setModuleFilter] = useState('');

  const { data: permissions = [], isLoading, error } = useQuery({
    queryKey: ['phase3-permissions', moduleFilter],
    queryFn: () => apiRequest<Permission[]>(`/api/permissions${moduleFilter ? `?module=${encodeURIComponent(moduleFilter)}` : ''}`)
  });

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiRequest<Permission>('/api/permissions', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phase3-permissions'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/permissions/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phase3-permissions'] })
  });

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    createMutation.mutate({
      name: formData.get('name'),
      module: formData.get('module'),
      action: formData.get('action'),
      description: formData.get('description')
    });
    event.currentTarget.reset();
  };

  if (isLoading) return <div className="phase3-loading">Loading permissions...</div>;
  if (error) return <div className="phase3-error">{error instanceof Error ? error.message : 'Failed to load permissions'}</div>;

  const modules = Array.from(new Set(permissions.map(permission => permission.module)));

  return (
    <div className="phase3-view">
      <div className="phase3-header">
        <div className="phase3-title-block">
          <h1>Permissions</h1>
          <p>Manage granular access rights by module and action.</p>
        </div>
        <select className="phase3-select" value={moduleFilter} onChange={event => setModuleFilter(event.target.value)}>
          <option value="">All modules</option>
          {modules.map(module => <option key={module} value={module}>{module}</option>)}
        </select>
      </div>

      <form className="phase3-card phase3-form" onSubmit={handleCreate}>
        <label>Name<input className="phase3-input" name="name" placeholder="projects.create" required /></label>
        <label>Module<input className="phase3-input" name="module" placeholder="projects" required /></label>
        <label>Action<input className="phase3-input" name="action" placeholder="create" required /></label>
        <label>Description<input className="phase3-input" name="description" placeholder="Optional description" /></label>
        <button className="phase3-button" disabled={createMutation.isPending}><Plus size={16} /> Add permission</button>
      </form>

      <div className="phase3-grid">
        {permissions.map(permission => (
          <article className="phase3-card" key={permission.id}>
            <div className="phase3-card__header">
              <div>
                <h3><KeyRound size={16} /> {permission.name}</h3>
                <p>{permission.description || 'No description'}</p>
              </div>
              <span className="phase3-badge">{permission.module}</span>
            </div>
            <p>Action: {permission.action}</p>
            <div className="phase3-actions">
              <button className="phase3-button phase3-button--danger" onClick={() => deleteMutation.mutate(permission.id)}><Trash2 size={16} /> Delete</button>
            </div>
          </article>
        ))}
      </div>

      {permissions.length === 0 && <div className="phase3-empty">No permissions found.</div>}
    </div>
  );
}
