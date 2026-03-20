import React, { useState } from 'react';
import './ExportDialog.css';

interface ExportDialogProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  onExport?: (format: string, options: Record<string, boolean>) => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ projectId, isOpen, onClose, onExport }) => {
  const [format, setFormat] = useState<'json' | 'excel' | 'pdf'>('json');
  const [includeAudit, setIncludeAudit] = useState(true);
  const [includeApprovals, setIncludeApprovals] = useState(true);
  const [includeReconciliation, setIncludeReconciliation] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const options = {
        includeAuditTrail: includeAudit,
        includeApprovals,
        includeReconciliation,
      };

      if (onExport) {
        onExport(format, options);
      } else {
        // Default export logic
        const queryParams = new URLSearchParams();
        queryParams.append('includeAuditTrail', includeAudit.toString());
        queryParams.append('includeApprovals', includeApprovals.toString());
        queryParams.append('includeReconciliation', includeReconciliation.toString());

        const url = `/api/export/report/${projectId}/${format}?${queryParams.toString()}`;
        window.open(url, '_blank');
      }

      onClose();
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="export-dialog-overlay" onClick={onClose}>
      <div className="export-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Export Project Report</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="dialog-content">
          <div className="form-group">
            <label>Export Format</label>
            <div className="format-options">
              <label className="format-option">
                <input
                  type="radio"
                  value="json"
                  checked={format === 'json'}
                  onChange={(e) => setFormat(e.target.value as 'json')}
                />
                <span>JSON</span>
              </label>
              <label className="format-option">
                <input
                  type="radio"
                  value="excel"
                  checked={format === 'excel'}
                  onChange={(e) => setFormat(e.target.value as 'excel')}
                />
                <span>Excel (XLSX)</span>
              </label>
              <label className="format-option">
                <input
                  type="radio"
                  value="pdf"
                  checked={format === 'pdf'}
                  onChange={(e) => setFormat(e.target.value as 'pdf')}
                />
                <span>PDF</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Include in Report</label>
            <div className="checkbox-options">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={includeAudit}
                  onChange={(e) => setIncludeAudit(e.target.checked)}
                />
                <span>Audit Trail</span>
              </label>
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={includeApprovals}
                  onChange={(e) => setIncludeApprovals(e.target.checked)}
                />
                <span>Approval Workflow</span>
              </label>
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={includeReconciliation}
                  onChange={(e) => setIncludeReconciliation(e.target.checked)}
                />
                <span>Reconciliation Data</span>
              </label>
            </div>
          </div>

          <div className="dialog-info">
            <p>
              <strong>Note:</strong> The report will include project metrics, budget analysis, and task details.
              {format === 'pdf' && ' PDF export may take a moment to generate.'}
            </p>
          </div>
        </div>

        <div className="dialog-actions">
          <button className="btn-cancel" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button className="btn-export" onClick={handleExport} disabled={isLoading}>
            {isLoading ? 'Exporting...' : `Export as ${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;
