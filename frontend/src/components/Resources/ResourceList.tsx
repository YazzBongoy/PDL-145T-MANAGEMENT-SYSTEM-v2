import React, { useState, useEffect, useCallback } from 'react';
import { UserRole } from '../../types';
import type { Resource, ResourceForm, User } from '../../types';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';
import '../ui/List.css';
import '../../styles/mobile-utilities.css';
import { getApiUrl } from '../../api/config';

interface ResourceListProps {
  user: User;
  token: string;
}

export function ResourceList({ user, token }: ResourceListProps): React.ReactElement {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ResourceForm>({ 
    Name: '', 
    Type: 'MATERIEL', 
    Quantity: '', 
    Description: '',
    Status: 'AVAILABLE',
    Cost: '',
    Location: '',
    SerialNumber: '',
    WorkDays: ''
  });
  const [editId, setEditId] = useState<number | null>(null);

  const fetchResources = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl('/api/resources'), {
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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
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
      setForm({ 
        Name: '', 
        Type: 'MATERIEL', 
        Quantity: '', 
        Description: '',
        Status: 'AVAILABLE',
        Cost: '',
        Location: '',
        SerialNumber: '',
        WorkDays: ''
      });
      setEditId(null);
      await fetchResources();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save resource');
    }
  }, [editId, form, token, fetchResources]);

  const handleEdit = useCallback((resource: Resource): void => {
    setForm({ 
      Name: resource.Name || '',
      Type: resource.Type, 
      Quantity: resource.Quantity.toString(),
      Description: resource.Description || '',
      Status: resource.Status || 'AVAILABLE',
      Cost: resource.Cost?.toString() || '',
      Location: resource.Location || '',
      SerialNumber: resource.SerialNumber || '',
      // Pour ressources humaines, WorkDays = Quantity (Homme-jour)
      WorkDays: resource.Type === 'HUMAIN' ? resource.Quantity.toString() : ''
    });
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
        <form onSubmit={handleSubmit} className="resource-form form-mobile" id="resource-form" aria-labelledby="resource-form-title">
          <label htmlFor="resource-name">Resource Name *</label>
          <input 
            id="resource-name"
            name="Name" 
            placeholder="Ex: Excavatrice CAT 320" 
            value={form.Name} 
            onChange={handleChange} 
            required 
            className="input"
          />
          
          <label htmlFor="resource-type">Resource Type *</label>
          <select
            id="resource-type"
            name="Type" 
            value={form.Type} 
            onChange={handleChange} 
            required 
            className="input"
          >
            <option value="EQUIPEMENT">EQUIPEMENT</option>
            <option value="MATERIEL">MATERIEL</option>
            <option value="HUMAIN">HUMAIN (Homme-jour)</option>
          </select>
          
          <label htmlFor="resource-quantity">
            {form.Type === 'HUMAIN' ? 'Homme-jour (jours de travail) *' : 'Quantité *'}
          </label>
          <input 
            id="resource-quantity"
            name="Quantity" 
            type="number" 
            placeholder={form.Type === 'HUMAIN' ? "Ex: 30 jours" : "Ex: 5"} 
            value={form.Quantity} 
            onChange={handleChange} 
            required 
            className="input"
          />
          
          <label htmlFor="resource-description">Description</label>
          <input 
            id="resource-description"
            name="Description" 
            placeholder="Description détaillée" 
            value={form.Description} 
            onChange={handleChange} 
            className="input"
          />
          
          <label htmlFor="resource-status">Statut</label>
          <select
            id="resource-status"
            name="Status" 
            value={form.Status} 
            onChange={handleChange} 
            className="input"
          >
            <option value="AVAILABLE">DISPONIBLE</option>
            <option value="ASSIGNED">ASSIGNÉ</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
          </select>
          
          {form.Type !== 'HUMAIN' && (
            <>
              <label htmlFor="resource-cost">Coût unitaire</label>
              <input 
                id="resource-cost"
                name="Cost" 
                type="number" 
                placeholder="Coût en FC" 
                value={form.Cost} 
                onChange={handleChange} 
                className="input"
              />
              
              <label htmlFor="resource-location">Localisation</label>
              <input 
                id="resource-location"
                name="Location" 
                placeholder="Ex: Site Inongo" 
                value={form.Location} 
                onChange={handleChange} 
                className="input"
              />
              
              <label htmlFor="resource-serial">Numéro de série</label>
              <input 
                id="resource-serial"
                name="SerialNumber" 
                placeholder="Ex: CAT320-001" 
                value={form.SerialNumber} 
                onChange={handleChange} 
                className="input"
              />
            </>
          )}
          
          <button type="submit" className="btn btn--primary">{editId ? 'Update' : 'Create'}</button>
          <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn btn--secondary">
            Cancel
          </button>
        </form>
      )}
      <div className="list">
        {resources.map((r, index) => (
          <div key={r.ResourceID} className={`list__item list-item-mobile ${index % 2 === 0 ? 'zebra-row' : ''}`}>
            <div className="list-item-mobile__header">
              <div style={{ flex: 1 }}>
                <div className="list-item-mobile__title">{r.Name}</div>
                <div className="list-item-mobile__subtitle">
                  {r.Type === 'HUMAIN' 
                    ? `Homme-jour: ${r.Quantity} jours`
                    : `${r.Type} • Qté: ${r.Quantity}${r.Cost ? ` • ${r.Cost} FC` : ''}${r.Location ? ` • ${r.Location}` : ''}`
                  }
                </div>
              </div>
              <span className={`badge-mobile status-${r.Status?.toLowerCase() || 'available'}`}>
                {r.Status || 'AVAILABLE'}
              </span>
            </div>
            {canEdit && (
              <div className="list-item-mobile__actions">
                <button onClick={() => handleEdit(r)} className="btn btn--secondary touch-target">Modifier</button>
                <button onClick={() => handleDelete(r.ResourceID)} className="btn btn--danger touch-target">Supprimer</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
