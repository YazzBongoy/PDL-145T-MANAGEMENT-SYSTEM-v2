import { getApiUrl } from './config';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}

export interface Report {
  ReportID: number;
  Name: string;
  Type: string;
  Status: 'ready' | 'generating' | 'scheduled';
  GeneratedAt: string;
  FileUrl?: string;
  ProjectID?: number;
  ValidationID?: number;
}

export interface ReportFilters {
  type?: string;
  projectId?: number;
  validationId?: number;
  startDate?: string;
  endDate?: string;
}

export async function fetchReports(filters?: ReportFilters): Promise<Report[]> {
  const queryParams = new URLSearchParams();
  if (filters?.type) queryParams.append('type', filters.type);
  if (filters?.projectId) queryParams.append('projectId', filters.projectId.toString());
  if (filters?.validationId) queryParams.append('validationId', filters.validationId.toString());
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  const response = await fetch(getApiUrl(`/api/reports${queryString}`), {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch reports');
  }

  return response.json();
}

export async function fetchReportById(id: number): Promise<Report> {
  const response = await fetch(getApiUrl(`/api/reports/${id}`), {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch report');
  }

  return response.json();
}

export interface CreateReportData {
  Name: string;
  Type: string;
  ProjectID?: number;
  ValidationID?: number;
}

export async function createReport(data: CreateReportData): Promise<Report> {
  const response = await fetch(getApiUrl(`/api/reports`), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create report');
  }

  return response.json();
}

export async function deleteReport(id: number): Promise<void> {
  const response = await fetch(getApiUrl(`/api/reports/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete report');
  }
}

export async function downloadReport(id: number): Promise<Blob> {
  const response = await fetch(getApiUrl(`/api/reports/${id}/download`), {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to download report');
  }

  return response.blob();
}

// Metrics API
export interface ProjectMetrics {
  projectId: number;
  taskCompletionRate: number;
  budgetUtilization: number;
  scheduleVariance: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
}

export async function fetchProjectMetrics(projectId: number): Promise<ProjectMetrics> {
  const response = await fetch(getApiUrl(`/api/metrics/project/${projectId}`), {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch project metrics');
  }

  return response.json();
}

export interface DashboardMetrics {
  totalReports: number;
  reportsThisMonth: number;
  scheduledReports: number;
  generatingReports: number;
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await fetch(getApiUrl(`/api/metrics/dashboard`), {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    // Return default metrics if endpoint doesn't exist
    return {
      totalReports: 0,
      reportsThisMonth: 0,
      scheduledReports: 0,
      generatingReports: 0,
    };
  }

  return response.json();
}
