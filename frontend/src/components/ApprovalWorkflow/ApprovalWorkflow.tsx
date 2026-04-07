import React from 'react';
import './ApprovalWorkflow.css';

interface ApprovalLevel {
  level: number;
  roleName: string;
  status?: string;
  approver?: string;
  date?: string;
  notes?: string;
}

interface ApprovalWorkflowProps {
  status: ApprovalLevel[] | undefined;
  isLoading?: boolean;
  currentLevel?: number;
  paymentBlocked?: boolean;
}

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({
  status,
  isLoading,
  currentLevel,
  paymentBlocked,
}) => {
  if (isLoading) {
    return <div className="approval-workflow loading">Loading approval status...</div>;
  }

  if (!status || status.length === 0) {
    return <div className="approval-workflow empty">No approval workflow found</div>;
  }

  return (
    <div className="approval-workflow">
      <div className="workflow-header">
        <h3>Approval Workflow Status</h3>
        {paymentBlocked && (
          <div className="payment-blocked-badge">
            💳 Payment Blocked (awaiting approval)
          </div>
        )}
      </div>

      <div className="workflow-timeline">
        {status.map((level) => (
          <div
            key={level.level}
            className={`workflow-level ${level.status?.toLowerCase() || 'pending'} ${
              level.level === currentLevel ? 'current' : ''
            }`}
          >
            <div className="level-header">
              <span className="level-number">Level {level.level}</span>
              <span className="level-role">{level.roleName}</span>
            </div>

            <div className="level-content">
              <div className="status-badge">{level.status || 'Pending'}</div>

              {level.approver && <div className="approver">By: {level.approver}</div>}

              {level.date && (
                <div className="approval-date">
                  {new Date(level.date).toLocaleDateString()} at{' '}
                  {new Date(level.date).toLocaleTimeString()}
                </div>
              )}

              {level.notes && <div className="approval-notes">Notes: {level.notes}</div>}
            </div>

            {level.level < 4 && <div className="workflow-arrow">→</div>}
          </div>
        ))}
      </div>

      <div className="workflow-footer">
        <div className="workflow-legend">
          <span className="legend-item approved">
            <span className="dot"></span> Approved
          </span>
          <span className="legend-item rejected">
            <span className="dot"></span> Rejected
          </span>
          <span className="legend-item pending">
            <span className="dot"></span> Pending
          </span>
        </div>
      </div>
    </div>
  );
};

export default ApprovalWorkflow;
