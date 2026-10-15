import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`ca-page-header ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="ca-page-title">{title}</h1>
          {subtitle && <p className="ca-page-subtitle">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
};
