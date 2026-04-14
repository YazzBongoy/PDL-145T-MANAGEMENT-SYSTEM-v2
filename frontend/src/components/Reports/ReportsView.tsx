import React, { useState } from 'react';
import { TrendingUp, Download, Calendar, Filter, Loader2, AlertCircle } from 'lucide-react';
import { useReports, useDashboardMetrics, useDownloadReport } from '../../hooks/useReports';
import './Reports.css';

type ReportType = 'progress' | 'financial' | 'resource' | 'quality';

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    progress: 'Progress',
    financial: 'Financial',
    resource: 'Resource',
    quality: 'Quality',
  };
  return labels[type.toLowerCase()] || type;
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    progress: 'type-progress',
    financial: 'type-financial',
    resource: 'type-resource',
    quality: 'type-quality',
  };
  return colors[type.toLowerCase()] || 'type-default';
}

export function ReportsView(): React.ReactElement {
  const [selectedType, setSelectedType] = useState<ReportType | 'all'>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');

  const { data: reports, isLoading, error } = useReports({
    type: selectedType === 'all' ? undefined : selectedType,
  });

  const { data: metrics } = useDashboardMetrics();
  const downloadMutation = useDownloadReport();

  const handleDownload = (reportId: number, reportName: string) => {
    downloadMutation.mutate({
      id: reportId,
      filename: `${reportName.replace(/\s+/g, '_')}.pdf`,
    });
  };

  return (
    <div className="reports-view" data-testid="reports-view">
      <div className="section-header">
        <div className="section-title">
          <TrendingUp className="section-icon" size={24} />
          <h2 data-testid="reports-title">Reports & Analytics</h2>
        </div>
        <button className="btn btn--primary" data-testid="reports-export-button">
          <Download size={16} />
          Export All
        </button>
      </div>

      <div className="reports-filters">
        <div className="filter-group" data-testid="reports-type-filter-group">
          <Filter size={16} />
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value as ReportType | 'all')}
            className="filter-select"
            data-testid="reports-type-filter"
          >
            <option value="all">All Types</option>
            <option value="progress">Progress</option>
            <option value="financial">Financial</option>
            <option value="resource">Resource</option>
            <option value="quality">Quality</option>
          </select>
        </div>

        <div className="filter-group" data-testid="reports-date-filter-group">
          <Calendar size={16} />
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="filter-select"
            data-testid="reports-date-filter"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="custom">Custom range</option>
          </select>
        </div>
      </div>

      <div className="reports-stats" data-testid="reports-stats">
        <div className="stat-card" data-testid="reports-total-stat">
          <span className="stat-value" data-testid="reports-total-value">{metrics?.totalReports || 0}</span>
          <span className="stat-label">Total Reports</span>
        </div>
        <div className="stat-card" data-testid="reports-month-stat">
          <span className="stat-value">{metrics?.reportsThisMonth || 0}</span>
          <span className="stat-label">This Month</span>
        </div>
        <div className="stat-card" data-testid="reports-scheduled-stat">
          <span className="stat-value">{metrics?.scheduledReports || 0}</span>
          <span className="stat-label">Scheduled</span>
        </div>
        <div className="stat-card" data-testid="reports-generating-stat">
          <span className="stat-value">{metrics?.generatingReports || 0}</span>
          <span className="stat-label">Generating</span>
        </div>
      </div>

      {isLoading && (
        <div className="loading-state" data-testid="reports-loading">
          <Loader2 className="animate-spin" size={24} />
          <p>Loading reports...</p>
        </div>
      )}

      {error && (
        <div className="error-state" data-testid="reports-error">
          <AlertCircle size={24} />
          <p>Error loading reports: {error.message}</p>
        </div>
      )}

      {!isLoading && !error && reports?.length === 0 && (
        <div className="empty-state" data-testid="reports-empty">
          <p>No reports found. Generate your first report!</p>
        </div>
      )}

      <div className="reports-list" data-testid="reports-list">
        <h3 className="list-title">Recent Reports</h3>
        {reports?.map((report) => (
          <div key={report.ReportID} className="report-item" data-testid={`report-item-${report.ReportID}`}>
            <div className="report-info">
              <span className={`report-type ${getTypeColor(report.Type)}`} data-testid="report-type">
                {getTypeLabel(report.Type)}
              </span>
              <h4 className="report-title" data-testid="report-title">{report.Name}</h4>
              <span className="report-date" data-testid="report-date">
                Generated: {report.GeneratedAt ? new Date(report.GeneratedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="report-actions">
              <span className={`report-status status-${report.Status}`} data-testid="report-status">
                {report.Status}
              </span>
              {report.Status === 'ready' && (
                <button 
                  className="btn btn--secondary btn--sm"
                  onClick={() => handleDownload(report.ReportID, report.Name)}
                  disabled={downloadMutation.isPending}
                  data-testid="report-download-button"
                >
                  <Download size={14} />
                  {downloadMutation.isPending ? 'Downloading...' : 'Download'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="quick-reports" data-testid="quick-reports">
        <h3 className="list-title">Generate Quick Report</h3>
        <div className="quick-actions">
          <button className="quick-action-btn" data-testid="quick-report-progress">
            <TrendingUp size={20} />
            <span>Progress Report</span>
          </button>
          <button className="quick-action-btn" data-testid="quick-report-weekly">
            <Calendar size={20} />
            <span>Weekly Summary</span>
          </button>
          <button className="quick-action-btn" data-testid="quick-report-custom">
            <Filter size={20} />
            <span>Custom Analysis</span>
          </button>
        </div>
      </div>
    </div>
  );
}
