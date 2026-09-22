import React, { useState, useEffect, useCallback } from 'react';
import { UserRole } from '../../types';
import type { Resource, ResourceForm, User } from '../../types';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';
import { Table, type TableColumn } from '../ui/Table';
import { useCrudForm } from '../../hooks/useCrudForm';

interface ResourceListProps {
  user: User;
  token: string;
}

export function ResourceList({ user, token }: ResourceListProps): React.ReactElement {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const { showForm, setShowForm, form, editId, handleChange, handleSubmit, handleEdit, handleDelete, resetForm } =
    useCrudForm<ResourceForm>({
      initialForm: { Type: '', Quantity: '' },
      listUrl: '/api/resources',
      token,
    });

  const handleFormSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    await handleSubmit(e);
    await fetchResources();
  }, [handleSubmit, fetchResources]);

  const handleFormEdit = useCallback((resource: Resource): void => {
    handleEdit(resource as unknown as Record<string, unknown>, (item) => ({
      Type: (item.Type as string) || '',
      Quantity: String(item.Quantity ?? ''),
    }));
  }, [handleEdit]);

  const handleFormDelete = useCallback(async (id: number): Promise<void> => {
    await handleDelete(id);
    await fetchResources();
  }, [handleDelete, fetchResources]);

  const canEdit = user.role === UserRole.ADMIN || user.role === UserRole.SUPERVISOR;

  const columns: TableColumn<Resource>[] = [
    {
      key: 'type',
      title: 'Type',
      dataIndex: 'Type',
    },
    {
      key: 'quantity',
      title: 'Quantity',
      dataIndex: 'Quantity',
    },
    ...(canEdit
      ? [
          {
            key: 'actions',
            title: 'Actions',
            render: (_: unknown, record: Resource) => (
              <>
                <button onClick={() => handleFormEdit(record)} className="btn btn--secondary">
                  Edit
                </button>
                <button onClick={() => handleFormDelete(record.ResourceID)} className="btn btn--danger">
                  Delete
                </button>
              </>
            ),
          },
        ]
      : []),
  ];

  return (
    <Card variant="outlined">
      <CardHeader
        title="Resources"
        actions={
          <button
            onClick={() => { setShowForm(true); }}
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
      {error && <p className="error" role="alert" aria-live="polite">{error}</p>}
      {showForm && (
        <form onSubmit={handleFormSubmit} className="resource-form" id="resource-form" aria-labelledby="resource-form-title">
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
          <button type="button" onClick={resetForm} className="btn btn--secondary">
            Cancel
          </button>
        </form>
      )}
      <Table
        dataSource={resources}
        columns={columns}
        loading={loading}
        rowKey={(record) => record.ResourceID}
        emptyState={
          <>
            <div className="enhanced-table__empty-icon">📦</div>
            <div className="enhanced-table__empty-text">No resources yet</div>
            <div className="enhanced-table__empty-hint">Click + New Resource to add your first resource</div>
          </>
        }
        caption="List of available resources"
      />
    </Card>
  );
}
