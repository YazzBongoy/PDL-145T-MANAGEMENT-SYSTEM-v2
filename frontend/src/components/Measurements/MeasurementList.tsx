import React, { useState, useEffect, useCallback } from 'react';
import { UserRole } from '../../types';
import type { Measurement, MeasurementForm, User } from '../../types';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';
import { Table, type TableColumn } from '../ui/Table';
import { useCrudForm } from '../../hooks/useCrudForm';

interface MeasurementListProps {
  taskId?: number;
  user: User;
  token: string;
}

export function MeasurementList({ taskId, user, token }: MeasurementListProps): React.ReactElement {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const listUrl = taskId ? `/api/measurements/task/${taskId}` : '/api/measurements';

  const fetchMeasurements = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(listUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch measurements');
      const data = await res.json();
      setMeasurements(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch measurements');
    } finally {
      setLoading(false);
    }
  }, [listUrl, token]);

  useEffect(() => {
    fetchMeasurements();
  }, [fetchMeasurements]);

  const { showForm, setShowForm, form, editId, handleChange, handleSubmit, handleEdit, handleDelete, resetForm } =
    useCrudForm<MeasurementForm>({
      initialForm: { TaskID: '', SiteID: '', MeasurementType: '', Value: '', Date: '' },
      listUrl: '/api/measurements',
      token,
    });

  const handleFormSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    const body: Record<string, unknown> = {
      MeasurementType: form.MeasurementType,
      Value: Number(form.Value),
      Date: form.Date,
    };
    if (editId) {
      await handleSubmit(e);
    } else {
      await handleSubmit(e, body);
    }
    await fetchMeasurements();
  }, [handleSubmit, fetchMeasurements, form, editId]);

  const handleFormEdit = useCallback((m: Measurement): void => {
    handleEdit(m as unknown as Record<string, unknown>, (item) => ({
      TaskID: String(item.TaskID ?? ''),
      SiteID: (item.SiteID as string) || '',
      MeasurementType: (item.MeasurementType as string) || '',
      Value: String(item.Value ?? ''),
      Date: item.Date ? String(item.Date).slice(0, 10) : '',
    }));
  }, [handleEdit]);

  const handleFormDelete = useCallback(async (id: number): Promise<void> => {
    await handleDelete(id);
    await fetchMeasurements();
  }, [handleDelete, fetchMeasurements]);

  const canEdit = user.role === UserRole.ADMIN || user.role === UserRole.SUPERVISOR || user.role === UserRole.CONSTRUCTION;

  const columns: TableColumn<Measurement>[] = [
    {
      key: 'type',
      title: 'Type',
      dataIndex: 'MeasurementType',
    },
    {
      key: 'value',
      title: 'Value',
      dataIndex: 'Value',
      align: 'right',
    },
    {
      key: 'site',
      title: 'Site',
      render: (_: unknown, record: Measurement) => record.Site?.Name ?? record.SiteID,
    },
    {
      key: 'date',
      title: 'Date',
      render: (_: unknown, record: Measurement) => record.Date?.slice(0, 10) ?? '',
    },
    ...(canEdit
      ? [
          {
            key: 'actions',
            title: 'Actions',
            render: (_: unknown, record: Measurement) => (
              <>
                <button onClick={() => handleFormEdit(record)} className="btn btn--secondary">Edit</button>
                <button onClick={() => handleFormDelete(record.MeasurementID)} className="btn btn--danger">Delete</button>
              </>
            ),
          },
        ]
      : []),
  ];

  return (
    <Card variant="outlined">
      <CardHeader
        title="Measurements"
        actions={
          <button
            onClick={() => setShowForm(true)}
            disabled={!canEdit}
            className="btn btn--primary"
          >
            + New Measurement
          </button>
        }
      />
      {error && <p className="error" role="alert" aria-live="polite">{error}</p>}
      {showForm && (
        <form onSubmit={handleFormSubmit} className="measurement-form">
          {!editId && (
            <>
              <label htmlFor="m-task-id">Task ID</label>
              <input id="m-task-id" name="TaskID" type="number" placeholder="Task ID" value={form.TaskID} onChange={handleChange} required className="input" />
            </>
          )}
          <label htmlFor="m-site-id">Site ID</label>
          <input id="m-site-id" name="SiteID" placeholder="Site ID" value={form.SiteID} onChange={handleChange} required className="input" />
          <label htmlFor="m-type">Measurement Type</label>
          <input id="m-type" name="MeasurementType" placeholder="Type" value={form.MeasurementType} onChange={handleChange} required className="input" />
          <label htmlFor="m-value">Value</label>
          <input id="m-value" name="Value" type="number" step="any" placeholder="Value" value={form.Value} onChange={handleChange} required className="input" />
          <label htmlFor="m-date">Date</label>
          <input id="m-date" name="Date" type="date" value={form.Date} onChange={handleChange} required className="input" />
          <button type="submit" className="btn btn--primary">{editId ? 'Update' : 'Create'}</button>
          <button type="button" onClick={resetForm} className="btn btn--secondary">Cancel</button>
        </form>
      )}
      <Table
        dataSource={measurements}
        columns={columns}
        loading={loading}
        rowKey={(r) => r.MeasurementID}
        emptyState={
          <>
            <div className="enhanced-table__empty-icon">📏</div>
            <div className="enhanced-table__empty-text">No measurements yet</div>
          </>
        }
        caption="Construction site measurements"
      />
    </Card>
  );
}
