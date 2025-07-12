import React, { useState, useEffect, useCallback } from 'react';
import { UserRole } from '../../types';
import type { Resource, ResourceForm, User } from '../../types';

interface ResourceListProps {
  user: User;
  token: string;
}

export function ResourceList({ user, token }: ResourceListProps): React.ReactElement {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ResourceForm>({ Type: '', Quantity: '' });
  const [editId, setEditId] = useState<number | null>(null);

  const fetchResources = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/resources', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch resources');
      const data = await res.json();
      setResources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/resources/${editId}` : '/api/resources';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save resource');
      setShowForm(false);
      setForm({ Type: '', Quantity: '' });
      setEditId(null);
      await fetchResources();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save resource');
    }
  }, [editId, form, token, fetchResources]);

  const handleEdit = useCallback((resource: Resource): void => {
    setForm({ Type: resource.Type, Quantity: resource.Quantity.toString() });
    setEditId(resource.ResourceID);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(async (id: number): Promise<void> => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete resource');
      await fetchResources();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete resource');
    }
  }, [token, fetchResources]);

  const canEdit = user.role === UserRole.ADMIN || user.role === UserRole.SUPERVISOR;

  return (
    <div>
      <h3>Resources</h3>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <button 
        onClick={() => { setShowForm(true); setEditId(null); }} 
        disabled={!canEdit}
      >
        + New Resource
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="resource-form">
          <input 
            name="Type" 
            placeholder="Type" 
            value={form.Type} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="Quantity" 
            type="number" 
            placeholder="Quantity" 
            value={form.Quantity} 
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
        {resources.map((r) => (
          <li key={r.ResourceID}>
            <b>{r.Type}</b> (Qty: {r.Quantity})
            {canEdit && (
              <>
                <button onClick={() => handleEdit(r)}>Edit</button>
                <button onClick={() => handleDelete(r.ResourceID)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
