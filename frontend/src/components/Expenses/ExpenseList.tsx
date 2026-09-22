import React, { useState, useEffect, useCallback } from 'react';
import { UserRole } from '../../types';
import type { Expense, ExpenseForm, User } from '../../types';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';
import { Table, type TableColumn } from '../ui/Table';
import { useCrudForm } from '../../hooks/useCrudForm';

interface ExpenseListProps {
  taskId: number;
  user: User;
  token: string;
}

export function ExpenseList({ taskId, user, token }: ExpenseListProps): React.ReactElement {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${taskId}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch expenses');
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, [taskId, token]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const { showForm, setShowForm, form, editId, handleChange, handleSubmit, handleEdit, handleDelete, resetForm } =
    useCrudForm<ExpenseForm>({
      initialForm: { Description: '', Cost: '', Date: '' },
      listUrl: `/api/tasks/${taskId}/expenses`,
      token,
    });

  const handleFormSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    await handleSubmit(e);
    await fetchExpenses();
  }, [handleSubmit, fetchExpenses]);

  const handleFormEdit = useCallback((expense: Expense): void => {
    handleEdit(expense as unknown as Record<string, unknown>, (item) => ({
      Description: (item.Description as string) || '',
      Cost: String(item.Cost ?? ''),
      Date: item.Date ? String(item.Date).slice(0, 10) : '',
    }));
  }, [handleEdit]);

  const handleFormDelete = useCallback(async (id: number): Promise<void> => {
    await handleDelete(id, `/api/expenses/${id}`);
    await fetchExpenses();
  }, [handleDelete, fetchExpenses]);

  const canEdit = user.role === UserRole.ADMIN || user.role === UserRole.SUPERVISOR;

  const columns: TableColumn<Expense>[] = [
    {
      key: 'description',
      title: 'Description',
      render: (_: unknown, record: Expense) => record.Description || 'Expense',
    },
    {
      key: 'cost',
      title: 'Cost',
      dataIndex: 'Cost',
      align: 'right',
    },
    {
      key: 'date',
      title: 'Date',
      render: (_: unknown, record: Expense) => record.Date?.slice(0, 10) ?? '',
    },
    ...(canEdit
      ? [
          {
            key: 'actions',
            title: 'Actions',
            render: (_: unknown, record: Expense) => (
              <>
                <button onClick={() => handleFormEdit(record)} className="btn btn--secondary">
                  Edit
                </button>
                <button onClick={() => handleFormDelete(record.ExpenseID)} className="btn btn--danger">
                  Delete
                </button>
              </>
            ),
          },
        ]
      : []),
  ];

  return (
    <Card variant="outlined" className="deeply-nested-card">
      <CardHeader
        title="Expenses"
        level="h5"
        actions={
          <button
            onClick={() => { setShowForm(true); }}
            disabled={!canEdit}
            className="btn btn--primary"
          >
            + New Expense
          </button>
        }
      />
      {error && <p className="error" role="alert" aria-live="polite">{error}</p>}
      {showForm && (
        <form onSubmit={handleFormSubmit} className="expense-form">
          <label htmlFor="expense-description">Description</label>
          <input
            id="expense-description"
            name="Description"
            placeholder="Description"
            value={form.Description}
            onChange={handleChange}
            className="input"
          />
          <label htmlFor="expense-cost">Cost</label>
          <input
            id="expense-cost"
            name="Cost"
            type="number"
            placeholder="Cost"
            value={form.Cost}
            onChange={handleChange}
            required
            className="input"
          />
          <label htmlFor="expense-date">Date</label>
          <input
            id="expense-date"
            name="Date"
            type="date"
            placeholder="Date"
            value={form.Date}
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
        dataSource={expenses}
        columns={columns}
        loading={loading}
        rowKey={(record) => record.ExpenseID}
        emptyState={
          <>
            <div className="enhanced-table__empty-icon">💸</div>
            <div className="enhanced-table__empty-text">No expenses yet</div>
            <div className="enhanced-table__empty-hint">Click + New Expense to add your first expense</div>
          </>
        }
        caption="List of expenses for this task"
      />
    </Card>
  );
}
