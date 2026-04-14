import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReports, fetchReportById, createReport, deleteReport, downloadReport, fetchDashboardMetrics, type ReportFilters } from '../api/reports';

const REPORTS_KEY = 'reports';
const DASHBOARD_METRICS_KEY = 'dashboardMetrics';

export function useReports(filters?: ReportFilters) {
  return useQuery({
    queryKey: [REPORTS_KEY, filters],
    queryFn: () => fetchReports(filters),
  });
}

export function useReport(id: number) {
  return useQuery({
    queryKey: [REPORTS_KEY, id],
    queryFn: () => fetchReportById(id),
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REPORTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_METRICS_KEY] });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REPORTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_METRICS_KEY] });
    },
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: async ({ id, filename }: { id: number; filename: string }) => {
      const blob = await downloadReport(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: [DASHBOARD_METRICS_KEY],
    queryFn: fetchDashboardMetrics,
  });
}
