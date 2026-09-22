import React, { useState, useRef } from 'react';
import './Tooltip.css';

export interface TooltipProps {
  /** The content to display in the tooltip */
  content: React.ReactNode;
  /** The trigger element that shows the tooltip on hover */
  children: React.ReactElement;
  /** Position of the tooltip relative to the trigger */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Whether to show an arrow pointing to the trigger */
  arrow?: boolean;
  /** Delay before showing tooltip (in milliseconds) */
  delay?: number;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
  /** Custom CSS class name */
  className?: string;
  /** Maximum width of the tooltip */
  maxWidth?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  arrow = true,
  delay = 300,
  disabled = false,
  className = '',
  maxWidth = '200px'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = (): void => {
    if (disabled) return;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    setTimeoutId(id);
  };

  const hideTooltip = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Escape') {
      hideTooltip();
    }
  };

  const tooltipClasses = [
    'tooltip',
    `tooltip--${position}`,
    arrow ? 'tooltip--with-arrow' : '',
    isVisible ? 'tooltip--visible' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className="tooltip-wrapper"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onKeyDown={handleKeyDown}
    >
      {children}
      <div
        ref={tooltipRef}
        className={tooltipClasses}
        role="tooltip"
        aria-hidden={!isVisible}
        style={{ maxWidth }}
      >
        <div className="tooltip__content">
          {content}
        </div>
        {arrow && <div className="tooltip__arrow" />}
      </div>
    </div>
  );
};

export default Tooltip;
