import React from 'react';
import { Badge, BadgeProps } from './Badge';
import { Tooltip } from './Tooltip';
import './StatusBadge.css';

export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown' | 'loading';
export type TaskStatusType = 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
export type TrendDirection = 'up' | 'down' | 'stable' | 'none';

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  /** The status to display */
  status: HealthStatus | TaskStatusType | string;
  /** Optional tooltip content with additional information */
  tooltip?: React.ReactNode;
  /** Trend direction indicator */
  trend?: TrendDirection;
  /** Additional metadata to show in tooltip */
  metadata?: {
    lastUpdated?: string;
    value?: string | number;
    change?: string;
    description?: string;
  };
  /** Custom label to display instead of status */
  label?: string;
  /** Whether to show trend arrow */
  showTrend?: boolean;
}

const STATUS_CONFIG = {
  // Health statuses
  healthy: { 
    variant: 'success' as const, 
    label: 'Healthy', 
    icon: '✓',
    color: 'var(--color-success)'
  },
  warning: { 
    variant: 'warning' as const, 
    label: 'Warning', 
    icon: '⚠',
    color: 'var(--color-warning)'
  },
  critical: { 
    variant: 'error' as const, 
    label: 'Critical', 
    icon: '✕',
    color: 'var(--color-error)'
  },
  unknown: { 
    variant: 'default' as const, 
    label: 'Unknown', 
    icon: '?',
    color: 'var(--color-gray-500)'
  },
  loading: { 
    variant: 'default' as const, 
    label: 'Checking...', 
    icon: '⟳',
    color: 'var(--color-info)'
  },
  
  // Task statuses
  'not-started': { 
    variant: 'default' as const, 
    label: 'Not Started', 
    icon: '○',
    color: 'var(--color-gray-500)'
  },
  'in-progress': { 
    variant: 'info' as const, 
    label: 'In Progress', 
    icon: '◐',
    color: 'var(--color-info)'
  },
  completed: { 
    variant: 'success' as const, 
    label: 'Completed', 
    icon: '●',
    color: 'var(--color-success)'
  },
  blocked: { 
    variant: 'warning' as const, 
    label: 'Blocked', 
    icon: '⬛',
    color: 'var(--color-warning)'
  },
  cancelled: { 
    variant: 'error' as const, 
    label: 'Cancelled', 
    icon: '✕',
    color: 'var(--color-error)'
  }
};

const TREND_ICONS = {
  up: '↗',
  down: '↘',
  stable: '→',
  none: ''
};

const TREND_COLORS = {
  up: 'var(--color-success)',
  down: 'var(--color-error)',
  stable: 'var(--color-gray-500)',
  none: 'transparent'
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  tooltip,
  trend = 'none',
  metadata,
  label,
  showTrend = true,
  className = '',
  ...props
}) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.unknown;
  const displayLabel = label || config.label;
  const trendIcon = showTrend && trend !== 'none' ? TREND_ICONS[trend] : '';
  
  // Build tooltip content
  let tooltipContent = tooltip;
  if (!tooltipContent && (metadata || trendIcon)) {
    tooltipContent = (
      <div className="status-tooltip">
        <div className="status-tooltip__header">
          <span className="status-tooltip__icon" style={{ color: config.color }}>
            {config.icon}
          </span>
          <span className="status-tooltip__title">{displayLabel}</span>
          {trendIcon && (
            <span 
              className="status-tooltip__trend" 
              style={{ color: TREND_COLORS[trend] }}
              title={`Trend: ${trend}`}
            >
              {trendIcon}
            </span>
          )}
        </div>
        
        {metadata && (
          <div className="status-tooltip__metadata">
            {metadata.value && (
              <div className="status-tooltip__item">
                <span className="status-tooltip__label">Value:</span>
                <span className="status-tooltip__value">{metadata.value}</span>
              </div>
            )}
            {metadata.change && (
              <div className="status-tooltip__item">
                <span className="status-tooltip__label">Change:</span>
                <span className="status-tooltip__value">{metadata.change}</span>
              </div>
            )}
            {metadata.description && (
              <div className="status-tooltip__description">
                {metadata.description}
              </div>
            )}
            {metadata.lastUpdated && (
              <div className="status-tooltip__timestamp">
                Last updated: {metadata.lastUpdated}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const badgeContent = (
    <>
      <span className="status-badge__icon" style={{ color: config.color }}>
        {config.icon}
      </span>
      <span className="status-badge__label">{displayLabel}</span>
      {trendIcon && showTrend && (
        <span 
          className="status-badge__trend" 
          style={{ color: TREND_COLORS[trend] }}
          title={`Trend: ${trend}`}
        >
          {trendIcon}
        </span>
      )}
    </>
  );

  const badge = (
    <Badge
      variant={config.variant}
      className={`status-badge status-badge--${status} ${className}`}
      loading={status === 'loading'}
      {...props}
    >
      {badgeContent}
    </Badge>
  );

  // Wrap with tooltip if tooltip content exists
  if (tooltipContent) {
    return (
      <Tooltip content={tooltipContent} position="top" className="tooltip--multiline">
        {badge}
      </Tooltip>
    );
  }

  return badge;
};

// Convenience components for specific use cases
export const HealthStatusBadge: React.FC<Omit<StatusBadgeProps, 'status'> & { 
  health: HealthStatus 
}> = ({ health, ...props }) => (
  <StatusBadge status={health} {...props} />
);

export const TaskStatusBadge: React.FC<Omit<StatusBadgeProps, 'status'> & { 
  taskStatus: TaskStatusType 
}> = ({ taskStatus, ...props }) => (
  <StatusBadge status={taskStatus} {...props} />
);

// Utility function to determine health status from various inputs
export const getHealthStatus = (value: string | number, thresholds?: {
  healthy?: number;
  warning?: number;
  critical?: number;
}): HealthStatus => {
  if (typeof value === 'string') {
    const normalizedValue = value.toLowerCase();
    if (['healthy', 'good', 'ok', 'normal', 'online', 'active'].includes(normalizedValue)) {
      return 'healthy';
    }
    if (['warning', 'degraded', 'slow', 'unstable'].includes(normalizedValue)) {
      return 'warning';
    }
    if (['critical', 'error', 'failed', 'offline', 'down', 'inactive'].includes(normalizedValue)) {
      return 'critical';
    }
    return 'unknown';
  }

  if (typeof value === 'number' && thresholds) {
    if (thresholds.critical !== undefined && value >= thresholds.critical) {
      return 'critical';
    }
    if (thresholds.warning !== undefined && value >= thresholds.warning) {
      return 'warning';
    }
    if (thresholds.healthy !== undefined && value >= thresholds.healthy) {
      return 'healthy';
    }
  }

  return 'unknown';
};

export default StatusBadge;
