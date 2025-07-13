import React from 'react';
import './Badge.css';

export interface BadgeProps {
  /** The content to display in the badge */
  children: React.ReactNode;
  /** The variant/color of the badge */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** The size of the badge */
  size?: 'sm' | 'default' | 'lg';
  /** Whether the badge is in a loading state */
  loading?: boolean;
  /** Whether the badge is interactive (clickable) */
  interactive?: boolean;
  /** Click handler for interactive badges */
  onClick?: () => void;
  /** Custom CSS class name */
  className?: string;
  /** Custom loading text to display alongside spinner */
  loadingText?: string;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** Additional HTML attributes */
  [key: string]: unknown;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'default',
  loading = false,
  interactive = false,
  onClick,
  className = '',
  loadingText,
  'aria-label': ariaLabel,
  ...props
}) => {
  const baseClass = 'badge';
  const variantClass = variant !== 'default' ? `badge--${variant}` : '';
  const sizeClass = size !== 'default' ? `badge--${size}` : '';
  const loadingClass = loading ? 'badge--loading' : '';
  const interactiveClass = interactive ? 'badge--interactive' : '';
  
  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    loadingClass,
    interactiveClass,
    className
  ].filter(Boolean).join(' ');

  const handleClick = (): void => {
    if (interactive && onClick && !loading) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (interactive && onClick && !loading && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  const content = loading ? (
    <>
      <span className="badge__spinner" aria-hidden="true" />
      {loadingText || children}
    </>
  ) : (
    children
  );

  const Component = interactive ? 'button' : 'span';

  return (
    <Component
      className={classes}
      onClick={handleClick}
      onKeyDown={interactive ? handleKeyDown : undefined}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      aria-label={ariaLabel}
      disabled={loading}
      {...props}
    >
      {content}
    </Component>
  );
};

// Export common badge configurations for convenience
export const StatusBadge: React.FC<Omit<BadgeProps, 'variant'> & { 
  status: 'healthy' | 'warning' | 'error' | 'loading' | 'info' 
}> = ({ status, children, ...props }) => {
  const variantMap: Record<string, BadgeProps['variant']> = {
    healthy: 'success',
    warning: 'warning',
    error: 'error',
    loading: 'default',
    info: 'info'
  };

  return (
    <Badge
      variant={variantMap[status]}
      loading={status === 'loading'}
      loadingText={status === 'loading' ? 'Loading...' : undefined}
      {...props}
    >
      {children || (status === 'loading' ? 'Loading...' : status)}
    </Badge>
  );
};

export const HealthBadge: React.FC<Omit<BadgeProps, 'variant' | 'children'> & { 
  health: 'healthy' | 'degraded' | 'unhealthy' | 'checking' 
}> = ({ health, ...props }) => {
  const contentMap: Record<string, { text: string; variant: BadgeProps['variant']; loading: boolean }> = {
    healthy: { text: 'Healthy', variant: 'success', loading: false },
    degraded: { text: 'Degraded', variant: 'warning', loading: false },
    unhealthy: { text: 'Unhealthy', variant: 'error', loading: false },
    checking: { text: 'Checking', variant: 'default', loading: true }
  };

  const config = contentMap[health];

  return (
    <Badge
      variant={config.variant}
      loading={config.loading}
      {...props}
    >
      {config.text}
    </Badge>
  );
};

export const TaskBadge: React.FC<Omit<BadgeProps, 'variant' | 'children'> & { 
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled' 
}> = ({ status, ...props }) => {
  const contentMap: Record<string, { text: string; variant: BadgeProps['variant']; loading: boolean }> = {
    pending: { text: 'Pending', variant: 'default', loading: false },
    'in-progress': { text: 'In Progress', variant: 'info', loading: true },
    completed: { text: 'Completed', variant: 'success', loading: false },
    failed: { text: 'Failed', variant: 'error', loading: false },
    cancelled: { text: 'Cancelled', variant: 'warning', loading: false }
  };

  const config = contentMap[status];

  return (
    <Badge
      variant={config.variant}
      loading={config.loading}
      loadingText={config.loading ? config.text : undefined}
      {...props}
    >
      {config.text}
    </Badge>
  );
};

export default Badge;
