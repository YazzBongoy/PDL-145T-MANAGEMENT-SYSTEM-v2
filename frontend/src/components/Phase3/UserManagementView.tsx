import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Shield, Trash2, UserCog } from 'lucide-react';
import { getApiUrl } from '../../api/config';
import { UserRole, UserStatus } from '../../types';
import type { ManagedUser } from '../../types';
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

export function UserManagementView(): React.ReactElement {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);

  const query = new URLSearchParams();
  if (search) query.set('search', search);
  if (role) query.set('role', role);
  if (status) query.set('status', status);

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['phase3-users', search, role, status],
    queryFn: () => apiRequest<ManagedUser[]>(`/api/users?${query.toString()}`)
  });

  const activeCount = useMemo(() => users.filter(user => user.status === UserStatus.ACTIVE).length, [users]);

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiRequest<ManagedUser>('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phase3-users'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => apiRequest<ManagedUser>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phase3-users'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phase3-users'] })
  });

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    createMutation.mutate({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role'),
      status: formData.get('status')
    });
  };

  if (isLoading) return <div className="phase3-loading">Loading users...</div>;
  if (error) return <div className="phase3-error">{error instanceof Error ? error.message : 'Failed to load users'}</div>;

  return (
    <div className="phase3-view">
      <div className="phase3-header">
        <div className="phase3-title-block">
          <h1>User Management</h1>
          <p>{users.length} users, {activeCount} active accounts</p>
        </div>
        <div className="phase3-toolbar">
          <div className="phase3-input" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={16} />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search users" style={{ border: 0, outline: 0, background: 'transparent' }} />
          </div>
          <select className="phase3-select" value={role} onChange={event => setRole(event.target.value)}>
            <option value="">All roles</option>
            {Object.values(UserRole).map(value => <option key={value} value={value}>{value}</option>)}
          </select>
          <select className="phase3-select" value={status} onChange={event => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {Object.values(UserStatus).map(value => <option key={value} value={value}>{value}</option>)}
          </select>
          <button className="phase3-button" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Add user</button>
        </div>
      </div>

      {showForm && (
        <form className="phase3-card phase3-form" onSubmit={handleCreate}>
          <label>Name<input className="phase3-input" name="name" required /></label>
          <label>Email<input className="phase3-input" name="email" type="email" required /></label>
          <label>Password<input className="phase3-input" name="password" type="password" required minLength={6} /></label>
          <label>Role<select className="phase3-select" name="role" defaultValue={UserRole.USER}>{Object.values(UserRole).map(value => <option key={value} value={value}>{value}</option>)}</select></label>
          <label>Status<select className="phase3-select" name="status" defaultValue={UserStatus.ACTIVE}>{Object.values(UserStatus).map(value => <option key={value} value={value}>{value}</option>)}</select></label>
          <button className="phase3-button" disabled={createMutation.isPending}>Create user</button>
        </form>
      )}

      <div className="phase3-grid">
        {users.map(user => (
          <article className="phase3-card" key={user.id}>
            <div className="phase3-card__header">
              <div>
                <h3>{user.name}</h3>
                <p>{user.email}</p>
              </div>
              <span className={`phase3-badge ${user.status === UserStatus.ACTIVE ? 'phase3-badge--success' : user.status === UserStatus.SUSPENDED ? 'phase3-badge--danger' : 'phase3-badge--muted'}`}>{user.status}</span>
            </div>
            <p><Shield size={14} /> {user.role}</p>
            <p>Last login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</p>
            <div className="phase3-actions">
              <select className="phase3-select" value={user.role} onChange={event => updateMutation.mutate({ id: user.id, data: { role: event.target.value } })}>
                {Object.values(UserRole).map(value => <option key={value} value={value}>{value}</option>)}
              </select>
              <select className="phase3-select" value={user.status} onChange={event => updateMutation.mutate({ id: user.id, data: { status: event.target.value } })}>
                {Object.values(UserStatus).map(value => <option key={value} value={value}>{value}</option>)}
              </select>
              <button className="phase3-button phase3-button--secondary"><UserCog size={16} /> Profile</button>
              <button className="phase3-button phase3-button--danger" onClick={() => deleteMutation.mutate(user.id)}><Trash2 size={16} /> Delete</button>
            </div>
          </article>
        ))}
      </div>

      {users.length === 0 && <div className="phase3-empty">No users found.</div>}
    </div>
  );
}
