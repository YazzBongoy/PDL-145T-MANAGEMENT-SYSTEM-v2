const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}

export interface UserSettings {
  id: number;
  userId: number;
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: string;
  notifications: Record<string, boolean>;
  emailNotifications: {
    taskUpdates?: boolean;
    approvals?: boolean;
    dailySummary?: boolean;
    maintenanceAlerts?: boolean;
  };
  pushNotifications: {
    taskUpdates?: boolean;
    approvals?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsData {
  theme?: string;
  language?: string;
  dateFormat?: string;
  notifications?: Record<string, boolean>;
}

export interface UpdateNotificationsData {
  emailNotifications?: {
    taskUpdates?: boolean;
    approvals?: boolean;
    dailySummary?: boolean;
    maintenanceAlerts?: boolean;
  };
  pushNotifications?: {
    taskUpdates?: boolean;
    approvals?: boolean;
  };
}

// Get user settings
export async function fetchSettings(): Promise<UserSettings> {
  const response = await fetch(`${API_BASE}/settings`, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }
  return response.json();
}

// Update user settings
export async function updateSettings(data: UpdateSettingsData): Promise<UserSettings> {
  const response = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update settings');
  }
  return response.json();
}

// Update notification preferences
export async function updateNotifications(data: UpdateNotificationsData): Promise<UserSettings> {
  const response = await fetch(`${API_BASE}/settings/notifications`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update notifications');
  }
  return response.json();
}
