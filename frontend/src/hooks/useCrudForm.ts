import { useState, useCallback } from 'react';

interface UseCrudFormOptions<TForm> {
  initialForm: TForm;
  listUrl: string;
  token: string;
}

interface UseCrudFormReturn<TForm> {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  form: TForm;
  setForm: React.Dispatch<React.SetStateAction<TForm>>;
  editId: number | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent, extraBody?: Record<string, unknown>) => Promise<void>;
  handleEdit: (item: Record<string, unknown>, fieldMap: (item: Record<string, unknown>) => TForm) => void;
  handleDelete: (id: number, deleteUrl?: string) => Promise<void>;
  resetForm: () => void;
}

export function useCrudForm<TForm extends Record<string, unknown>>({
  initialForm,
  listUrl,
  token,
}: UseCrudFormOptions<TForm>): UseCrudFormReturn<TForm> {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TForm>(initialForm);
  const [editId, setEditId] = useState<number | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const resetForm = useCallback((): void => {
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
  }, [initialForm]);

  const handleSubmit = useCallback(async (e: React.FormEvent, extraBody?: Record<string, unknown>): Promise<void> => {
    e.preventDefault();
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `${listUrl}/${editId}` : listUrl;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, ...extraBody }),
      });
      if (!res.ok) throw new Error('Failed to save');
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    }
  }, [editId, form, token, listUrl, resetForm]);

  const handleEdit = useCallback((item: Record<string, unknown>, fieldMap: (item: Record<string, unknown>) => TForm): void => {
    setForm(fieldMap(item));
    setEditId(item.id as number);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(async (id: number, deleteUrl?: string): Promise<void> => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const url = deleteUrl || `${listUrl}/${id}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  }, [token, listUrl]);

  return {
    showForm,
    setShowForm,
    form,
    setForm,
    editId,
    handleChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
  };
}
