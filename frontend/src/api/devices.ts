import type { Device } from '../types';

import { getApiUrl } from './config';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}

export interface CreateDeviceData {
  name: string;
  type: string;
  quantity?: number;
  description?: string;
  status?: string;
  location?: string;
  serialNumber?: string;
  purchaseDate?: string;
  cost?: number;
}

export interface UpdateDeviceData extends Partial<CreateDeviceData> {
  lastMaintenance?: string;
  nextMaintenance?: string;
}

// Get all devices with optional filtering
export async function fetchDevices(filters?: { type?: string; status?: string; location?: string; search?: string }): Promise<Device[]> {
  const queryParams = new URLSearchParams();
  if (filters?.type) queryParams.append('type', filters.type);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.location) queryParams.append('location', filters.location);
  if (filters?.search) queryParams.append('search', filters.search);
  
  const query = queryParams.toString();
  const url = getApiUrl(`/api/resources${query ? `?${query}` : ''}`);
  
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error('Failed to fetch devices');
  }
  return response.json();
}

// Get device by ID
export async function fetchDeviceById(id: number): Promise<Device> {
  const response = await fetch(getApiUrl(`/api/resources/${id}`), { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error('Failed to fetch device');
  }
  return response.json();
}

// Create new device
export async function createDevice(data: CreateDeviceData): Promise<Device> {
  const response = await fetch(getApiUrl(`/api/resources`), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create device');
  }
  return response.json();
}

// Update device
export async function updateDevice(id: number, data: UpdateDeviceData): Promise<Device> {
  const response = await fetch(getApiUrl(`/api/resources/${id}`), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update device');
  }
  return response.json();
}

// Delete device
export async function deleteDevice(id: number): Promise<void> {
  const response = await fetch(getApiUrl(`/api/resources/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to delete device');
  }
}

// Get devices by type
export async function fetchDevicesByType(type: string): Promise<Device[]> {
  const response = await fetch(getApiUrl(`/api/resources/type/${type}`), { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error('Failed to fetch devices by type');
  }
  return response.json();
}
