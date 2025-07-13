import React from 'react';
import './SectionHeader.css';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  className = '', 
  size = 'md',
  align = 'left'
}) => {
  return (
    <header className={`section-header section-header--${size} section-header--${align} ${className}`}>
      <h2 className="section-header__title">{title}</h2>
      {subtitle && (
        <p className="section-header__subtitle">{subtitle}</p>
      )}
    </header>
  );
};
