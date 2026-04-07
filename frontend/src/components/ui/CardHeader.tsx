import React from 'react';
import './CardHeader.css';

interface CardHeaderProps {
  title: string;
  actions?: React.ReactNode;
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  title, 
  actions, 
  level = 'h3',
  className = ''
}) => {
  const HeaderTag = level;
  
  return (
    <div className={`card-header ${className}`}>
      <HeaderTag className="card-header__title">{title}</HeaderTag>
      {actions && (
        <div className="card-header__actions">
          {actions}
        </div>
      )}
    </div>
  );
};
