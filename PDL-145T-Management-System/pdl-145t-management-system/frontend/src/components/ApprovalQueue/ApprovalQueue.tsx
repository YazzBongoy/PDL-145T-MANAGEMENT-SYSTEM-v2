import React, { useState } from 'react';
import { usePendingApprovals, useSubmitApproval } from '../../hooks/useApprovalWorkflow';
import './ApprovalQueue.css';

interface ApprovalQueueProps {
  userRole?: string;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ userRole }) => {
  const { data: approvalsData, isLoading, error, refetch } = usePendingApprovals();
  const submitApproval = useSubmitApproval();
  const [selectedExpense, setSelectedExpense] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState<'approve' | 'reject'>('approve');

  const approvals = approvalsData?.data || [];

  const handleSubmitApproval = async (expenseId: number) => {
    if (!notes.trim()) {
      alert('Please provide justification notes');
      return;
    }

    // Determine level based on current workflow
    const approval = approvals.find((a) => a.expenseId === expenseId);
    const level = approval?.id % 4 || 1; // Simplified level detection

    submitApproval.mutate(
      { expenseId, level, action, notes },
      {
        onSuccess: () => {
          setSelectedExpense(null);
          setNotes('');
          refetch();
        },
        onError: (error) => {
          alert(`Error: ${(error as Error).message}`);
        },
      }
    );
  };

  if (isLoading) {
    return <div className="approval-queue loading">Loading approvals...</div>;
  }

  if (error) {
    return <div className="approval-queue error">Error loading approvals: {(error as Error).message}</div>;
  }

  if (approvals.length === 0) {
    return <div className="approval-queue empty">No pending approvals</div>;
  }

  return (
    <div className="approval-queue">
      <h2>Approval Queue</h2>

      <div className="queue-filters">
        <span className="queue-count">
          {approvals.length} pending approval{approvals.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="queue-list">
        {approvals.map((approval) => (
          <div
            key={approval.expenseId}
            className={`queue-item ${selectedExpense === approval.expenseId ? 'selected' : ''}`}
            onClick={() => setSelectedExpense(approval.expenseId)}
          >
            <div className="item-header">
              <div className="item-id">Expense #{approval.expenseId}</div>
              <div className="item-amount">${approval.expense.Cost?.toFixed(2) || '0.00'}</div>
            </div>

            <div className="item-details">
              <div className="detail-row">
                <span className="detail-label">Task:</span>
                <span className="detail-value">{approval.expense.task?.Title || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">
                  {new Date(approval.expense.Date).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{approval.expense.Description || 'N/A'}</span>
              </div>
            </div>

            {selectedExpense === approval.expenseId && (
              <div className="item-actions">
                <div className="action-section">
                  <label>Decision</label>
                  <div className="action-buttons">
                    <button
                      className={`btn-action approve ${action === 'approve' ? 'active' : ''}`}
                      onClick={() => setAction('approve')}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className={`btn-action reject ${action === 'reject' ? 'active' : ''}`}
                      onClick={() => setAction('reject')}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>

                <div className="action-section">
                  <label>Justification (Required) *</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide detailed justification for your decision..."
                    maxLength={500}
                    rows={4}
                  />
                  <div className="char-count">{notes.length}/500</div>
                </div>

                <div className="action-buttons-final">
                  <button
                    className="btn-submit"
                    onClick={() => handleSubmitApproval(approval.expenseId)}
                    disabled={submitApproval.isPending}
                  >
                    {submitApproval.isPending ? 'Submitting...' : 'Submit Decision'}
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setSelectedExpense(null);
                      setNotes('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApprovalQueue;
