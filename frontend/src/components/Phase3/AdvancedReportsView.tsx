import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileBarChart, Plus, Trash2 } from 'lucide-react';
import { getApiUrl } from '../../api/config';
import type { ReportTemplate } from '../../types';
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

export function AdvancedReportsView(): React.ReactElement {
  const queryClient = useQueryClient();
  const [moduleFilter, setModuleFilter] = useState('');

  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: ['phase3-report-templates', moduleFilter],
    queryFn: () => apiRequest<ReportTemplate[]>(`/api/report-templates${moduleFilter ? `?module=${encodeURIComponent(moduleFilter)}` : ''}`)
  });

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiRequest<ReportTemplate>('/api/report-templates', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phase3-report-templates'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/report-templates/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phase3-report-templates'] })
  });

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let config: Record<string, unknown> = {};
    try {
      config = JSON.parse((formData.get('config') as string) || '{}');
    } catch {
      config = { fields: [], filters: {} };
    }
    createMutation.mutate({
      name: formData.get('name'),
      module: formData.get('module'),
      description: formData.get('description'),
      isPublic: formData.get('isPublic') === 'on',
      config
    });
    event.currentTarget.reset();
  };

  if (isLoading) return <div className="phase3-loading">Loading report templates...</div>;
  if (error) return <div className="phase3-error">{error instanceof Error ? error.message : 'Failed to load templates'}</div>;

  const modules = Array.from(new Set(templates.map(template => template.module)));

  return (
    <div className="phase3-view">
      <div className="phase3-header">
        <div className="phase3-title-block">
          <h1>Advanced Reports</h1>
          <p>Create reusable report templates for programs, projects, finance, and construction.</p>
        </div>
        <select className="phase3-select" value={moduleFilter} onChange={event => setModuleFilter(event.target.value)}>
          <option value="">All modules</option>
          {modules.map(module => <option key={module} value={module}>{module}</option>)}
        </select>
      </div>

      <form className="phase3-card phase3-form" onSubmit={handleCreate}>
        <label>Name<input className="phase3-input" name="name" required /></label>
        <label>Module<input className="phase3-input" name="module" placeholder="projects" required /></label>
        <label>Description<input className="phase3-input" name="description" /></label>
        <label>Config JSON<textarea className="phase3-textarea" name="config" defaultValue={'{"fields":[],"filters":{}}'} /></label>
        <label style={{ flexDirection: 'row', alignItems: 'center' }}><input name="isPublic" type="checkbox" /> Public</label>
        <button className="phase3-button" disabled={createMutation.isPending}><Plus size={16} /> Add template</button>
      </form>

      <div className="phase3-grid">
        {templates.map(template => (
          <article className="phase3-card" key={template.id}>
            <div className="phase3-card__header">
              <div>
                <h3><FileBarChart size={16} /> {template.name}</h3>
                <p>{template.description || 'No description'}</p>
              </div>
              <span className={`phase3-badge ${template.isPublic ? 'phase3-badge--success' : 'phase3-badge--muted'}`}>{template.isPublic ? 'Public' : 'Private'}</span>
            </div>
            <p>Module: {template.module}</p>
            <p>Created: {new Date(template.createdAt).toLocaleDateString()}</p>
            <div className="phase3-actions">
              <button className="phase3-button phase3-button--danger" onClick={() => deleteMutation.mutate(template.id)}><Trash2 size={16} /> Delete</button>
            </div>
          </article>
        ))}
      </div>

      {templates.length === 0 && <div className="phase3-empty">No report templates found.</div>}
    </div>
  );
}
