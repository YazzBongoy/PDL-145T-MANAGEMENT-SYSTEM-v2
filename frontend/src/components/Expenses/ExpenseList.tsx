import React, { useState, useEffect, useCallback } from 'react';
import { UserRole } from '../../types';
import type { Expense, ExpenseForm, User } from '../../types';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';
import '../ui/List.css';

interface ExpenseListProps {
  taskId: number;
  user: User;
  token: string;
}

export function ExpenseList({ taskId, user, token }: ExpenseListProps): React.ReactElement {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ExpenseForm>({ Description: '', Cost: '', Date: '' });
  const [editId, setEditId] = useState<number | null>(null);

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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/expenses/${editId}` : `/api/tasks/${taskId}/expenses`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save expense');
      setShowForm(false);
      setForm({ Description: '', Cost: '', Date: '' });
      setEditId(null);
      await fetchExpenses();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save expense');
    }
  }, [editId, form, taskId, token, fetchExpenses]);

  const handleEdit = useCallback((expense: Expense): void => {
    setForm({
      Description: expense.Description || '',
      Cost: expense.Cost.toString(),
      Date: expense.Date ? expense.Date.slice(0, 10) : '',
    });
    setEditId(expense.ExpenseID);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(async (id: number): Promise<void> => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete expense');
      await fetchExpenses();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete expense');
    }
  }, [token, fetchExpenses]);

  const canEdit = user.role === UserRole.ADMIN || user.role === UserRole.SUPERVISOR;

  return (
    <Card variant="outlined" className="deeply-nested-card">
      <CardHeader 
        title="Expenses" 
        level="h5"
        actions={
          <button 
            onClick={() => { setShowForm(true); setEditId(null); }} 
            disabled={!canEdit}
            className="btn btn--primary"
          >
            + New Expense
          </button>
        }
      />
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {showForm && (
        <form onSubmit={handleSubmit} className="expense-form">
          <input 
            name="Description" 
            placeholder="Description" 
            value={form.Description} 
            onChange={handleChange} 
            className="input"
          />
          <input 
            name="Cost" 
            type="number" 
            placeholder="Cost" 
            value={form.Cost} 
            onChange={handleChange} 
            required 
            className="input"
          />
          <input 
            name="Date" 
            type="date" 
            placeholder="Date" 
            value={form.Date} 
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
        {expenses.map((e, index) => (
          <div key={e.ExpenseID} className={`list__item ${index % 2 === 0 ? 'zebra-row' : ''}`}>
            <b>{e.Description || 'Expense'}</b> - {e.Cost} on {e.Date?.slice(0, 10)}
            {canEdit && (
              <>
                <button onClick={() => handleEdit(e)} className="btn btn--secondary">Edit</button>
                <button onClick={() => handleDelete(e.ExpenseID)} className="btn btn--danger">Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
