import type { Task, Measurement, Validation, Sprint } from '../types';

import { getApiUrl } from './config';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}

// Tasks
export async function fetchMyTasks(): Promise<Task[]> {
  const response = await fetch(getApiUrl(`/api/tasks`), {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

export async function updateTaskStatus(taskId: number, status: string): Promise<Task> {
  const response = await fetch(getApiUrl(`/api/tasks/${taskId}`), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ CompletionStatus: status }),
  });
  if (!response.ok) {
    throw new Error('Failed to update task status');
  }
  return response.json();
}

// Measurements
export async function createMeasurement(taskId: number, data: Omit<Measurement, 'MeasurementID' | 'TaskID'>): Promise<Measurement> {
  const response = await fetch(getApiUrl(`/api/measurements/task/${taskId}`), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create measurement');
  }
  return response.json();
}

export async function fetchMyMeasurements(): Promise<Measurement[]> {
  const response = await fetch(getApiUrl(`/api/measurements`), {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch measurements');
  }
  return response.json();
}

export async function deleteMeasurement(measurementId: number): Promise<void> {
  const response = await fetch(getApiUrl(`/api/measurements/${measurementId}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to delete measurement');
  }
}

// Sprints
export async function fetchSprintBoard(sprintId: number): Promise<{
  sprint: Sprint;
  columns: {
    NotStarted: Task[];
    InProgress: Task[];
    Completed: Task[];
  };
}> {
  const response = await fetch(getApiUrl(`/api/sprints/${sprintId}/board`), {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch sprint board');
  }
  return response.json();
}

export async function fetchProjectSprints(projectId: number): Promise<Sprint[]> {
  const response = await fetch(getApiUrl(`/api/projects/${projectId}/sprints`), {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch sprints');
  }
  return response.json();
}

// Validations
export async function submitValidation(taskId: number, data: { notes: string }): Promise<Validation> {
  const response = await fetch(getApiUrl(`/api/validations/task/${taskId}`), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      Description: data.notes,
      ValidationDate: new Date().toISOString(),
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to submit validation');
  }
  return response.json();
}

export async function fetchTaskValidations(taskId: number): Promise<Validation[]> {
  const response = await fetch(getApiUrl(`/api/validations/task/${taskId}`), {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch validations');
  }
  return response.json();
}
