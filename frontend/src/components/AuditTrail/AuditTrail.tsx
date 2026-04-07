import React from 'react';
import { useAuditTrail, useExpenseHistory } from '../../hooks/useApprovalWorkflow';
import './AuditTrail.css';

interface AuditTrailProps {
  entityType?: string;
  entityId: number;
  expenseId?: number;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({
  entityType = 'Expense',
  entityId,
  expenseId,
}) => {
  const { data: auditData, isLoading: auditLoading } = useAuditTrail(entityType, entityId);
  const { data: historyData, isLoading: historyLoading } = useExpenseHistory(expenseId || entityId);

  const auditLogs = auditData?.data || [];
  const history = historyData?.data || [];

  const isLoading = auditLoading || historyLoading;

  if (isLoading) {
    return <div className="audit-trail loading">Loading audit history...</div>;
  }

  const allEvents = [
    ...auditLogs.map((log: any) => ({
      type: 'audit',
      timestamp: log.timestamp,
      user: log.user.name,
      action: log.action,
      entity: log.entityType,
      changes: log.changes,
      reason: log.reason,
    })),
    ...history.map((h: any) => ({
      type: 'history',
      timestamp: h.changedAt,
      user: h.changedBy,
      action: 'FIELD_CHANGED',
      field: h.fieldName,
      oldValue: h.oldValue,
      newValue: h.newValue,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (allEvents.length === 0) {
    return <div className="audit-trail empty">No audit history available</div>;
  }

  return (
    <div className="audit-trail">
      <div className="audit-header">
        <h3>Audit Trail History</h3>
        <span className="event-count">{allEvents.length} events</span>
      </div>

      <div className="audit-timeline">
        {allEvents.map((event, index) => (
          <div key={index} className={`timeline-item ${event.action?.toLowerCase() || 'event'}`}>
            <div className="timeline-marker"></div>

            <div className="timeline-content">
              <div className="event-header">
                <span className="event-action">{event.action}</span>
                <span className="event-timestamp">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="event-details">
                <div className="detail-row">
                  <span className="detail-label">User:</span>
                  <span className="detail-value">{event.user}</span>
                </div>

                {event.entity && (
                  <div className="detail-row">
                    <span className="detail-label">Entity:</span>
                    <span className="detail-value">{event.entity}</span>
                  </div>
                )}

                {event.field && (
                  <div className="detail-row">
                    <span className="detail-label">Field:</span>
                    <span className="detail-value">{event.field}</span>
                  </div>
                )}

                {event.oldValue !== undefined && event.newValue !== undefined && (
                  <div className="detail-row change">
                    <span className="old-value">
                      <span className="label">From:</span> {String(event.oldValue)}
                    </span>
                    <span className="arrow">→</span>
                    <span className="new-value">
                      <span className="label">To:</span> {String(event.newValue)}
                    </span>
                  </div>
                )}

                {event.reason && (
                  <div className="detail-row">
                    <span className="detail-label">Reason:</span>
                    <span className="detail-value reason">{event.reason}</span>
                  </div>
                )}

                {event.changes && typeof event.changes === 'object' && (
                  <div className="detail-row">
                    <span className="detail-label">Changes:</span>
                    <div className="changes-block">
                      <pre>{JSON.stringify(event.changes, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditTrail;
