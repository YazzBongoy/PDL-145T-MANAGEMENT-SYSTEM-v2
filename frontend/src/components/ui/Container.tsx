import React from 'react';
import './Container.css';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  className = '', 
  maxWidth = 'xl' 
}) => {
  return (
    <div className={`container container--${maxWidth} ${className}`}>
      {children}
    </div>
  );
};
