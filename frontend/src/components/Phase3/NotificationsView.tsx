import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { getApiUrl } from '../../api/config';
import type { Notification } from '../../types';
import './Phase3.css';

interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

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

function badgeClass(type: string): string {
  if (type === 'SUCCESS' || type === 'APPROVAL_GRANTED') return 'phase3-badge--success';
  if (type === 'WARNING' || type === 'APPROVAL_REQUIRED') return 'phase3-badge--warning';
  if (type === 'ERROR' || type === 'APPROVAL_REJECTED') return 'phase3-badge--danger';
  return '';
}

export function NotificationsView(): React.ReactElement {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['phase3-notifications'],
    queryFn: () => apiRequest<NotificationsResponse>('/api/notifications')
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phase3-notifications'] })
  });

  const markAllMutation = useMutation({
    mutationFn: () => apiRequest('/api/notifications/mark-all-read', { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phase3-notifications'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/notifications/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phase3-notifications'] })
  });

  if (isLoading) return <div className="phase3-loading">Loading notifications...</div>;
  if (error) return <div className="phase3-error">{error instanceof Error ? error.message : 'Failed to load notifications'}</div>;

  const notifications = data?.notifications ?? [];

  return (
    <div className="phase3-view">
      <div className="phase3-header">
        <div className="phase3-title-block">
          <h1>Notifications</h1>
          <p>{data?.unreadCount ?? 0} unread out of {data?.total ?? 0} notifications</p>
        </div>
        <button className="phase3-button" onClick={() => markAllMutation.mutate()}><CheckCheck size={16} /> Mark all as read</button>
      </div>

      <div className="phase3-grid">
        {notifications.map(notification => (
          <article className="phase3-card" key={notification.id} style={{ opacity: notification.isRead ? 0.72 : 1 }}>
            <div className="phase3-card__header">
              <div>
                <h3><Bell size={16} /> {notification.title}</h3>
                <p>{notification.message}</p>
              </div>
              <span className={`phase3-badge ${badgeClass(notification.type)}`}>{notification.type}</span>
            </div>
            <p>{new Date(notification.createdAt).toLocaleString()}</p>
            <div className="phase3-actions">
              {!notification.isRead && <button className="phase3-button phase3-button--secondary" onClick={() => markReadMutation.mutate(notification.id)}>Mark read</button>}
              <button className="phase3-button phase3-button--danger" onClick={() => deleteMutation.mutate(notification.id)}><Trash2 size={16} /> Delete</button>
            </div>
          </article>
        ))}
      </div>

      {notifications.length === 0 && <div className="phase3-empty">No notifications yet.</div>}
    </div>
  );
}
