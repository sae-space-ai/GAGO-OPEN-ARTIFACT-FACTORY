import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  headerAction,
}) => {
  return (
    <div className={`ca-card ${className}`}>
      {title && (
        <div className="ca-card-header">
          <h3 className="ca-card-title">{title}</h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="ca-card-content">{children}</div>
    </div>
  );
};
