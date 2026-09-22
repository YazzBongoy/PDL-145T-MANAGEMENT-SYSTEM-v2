import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
}

export function Logo({ className = '', size = 'md', variant = 'full' }: LogoProps): React.ReactElement {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  const logoIcon = (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClasses[size]} ${className}`}
      aria-label="PDL-145T Management System Logo"
    >
      {/* Modern geometric logo representing construction/management */}
      <rect x="4" y="4" width="40" height="40" rx="8" fill="url(#gradient1)" />
      <rect x="8" y="12" width="32" height="24" rx="4" fill="white" fillOpacity="0.2" />
      
      {/* Grid pattern representing organization/management */}
      <g stroke="white" strokeWidth="2" strokeOpacity="0.6">
        <line x1="16" y1="16" x2="16" y2="32" />
        <line x1="24" y1="16" x2="24" y2="32" />
        <line x1="32" y1="16" x2="32" y2="32" />
        <line x1="12" y1="20" x2="36" y2="20" />
        <line x1="12" y1="28" x2="36" y2="28" />
      </g>
      
      {/* Central diamond representing precision/quality */}
      <rect x="22" y="22" width="4" height="4" rx="1" fill="white" />
      
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-secondary)" />
        </linearGradient>
      </defs>
    </svg>
  );

  if (variant === 'icon') {
    return logoIcon;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {logoIcon}
      <div className="flex flex-col">
        <span className="text-title-medium text-primary font-semibold leading-none">
          PDL-145T
        </span>
        <span className="text-label-small text-secondary leading-none">
          Management System
        </span>
      </div>
    </div>
  );
}
