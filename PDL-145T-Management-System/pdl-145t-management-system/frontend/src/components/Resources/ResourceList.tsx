import React, { useState, useEffect, useCallback } from 'react';
import { UserRole } from '../../types';
import type { Resource, ResourceForm, User } from '../../types';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';
import '../ui/List.css';

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
    <Card variant="outlined">
      <CardHeader 
        title="Resources" 
        actions={
          <button 
            onClick={() => { setShowForm(true); setEditId(null); }} 
            disabled={!canEdit}
            className="btn btn--primary"
            aria-expanded={showForm}
            aria-label="Add new resource"
            aria-controls="resource-form"
          >
            + New Resource
          </button>
        }
      />
      {loading && <p>Loading...</p>}
      {error && <p className="error" role="alert" aria-live="polite">{error}</p>}
      {showForm && (
        <form onSubmit={handleSubmit} className="resource-form" id="resource-form" aria-labelledby="resource-form-title">
          <label htmlFor="resource-type">Resource Type</label>
          <input 
            id="resource-type"
            name="Type" 
            placeholder="Type" 
            value={form.Type} 
            onChange={handleChange} 
            required 
            className="input"
          />
          <label htmlFor="resource-quantity">Quantity</label>
          <input 
            id="resource-quantity"
            name="Quantity" 
            type="number" 
            placeholder="Quantity" 
            value={form.Quantity} 
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
      <div className="list">
        {resources.map((r, index) => (
          <div key={r.ResourceID} className={`list__item ${index % 2 === 0 ? "zebra-row" : ""}`}>
            <b>{r.Type}</b> (Qty: {r.Quantity})
            {canEdit && (
              <>
                <button onClick={() => handleEdit(r)} className="btn btn--secondary">Edit</button>
                <button onClick={() => handleDelete(r.ResourceID)} className="btn btn--danger">Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
