import React from 'react';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'blocked';

interface StatusIndicatorProps {
  status: StatusType;
  label: string;
  className?: string;
}

const statusClasses: Record<StatusType, string> = {
  success: 'ca-status-success',
  warning: 'ca-status-warning',
  error: 'ca-status-error',
  info: 'ca-status-info',
  blocked: 'ca-status-blocked',
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  className = '',
}) => {
  return (
    <span className={`ca-status-indicator ${statusClasses[status]} ${className}`}>
      <span className="w-2 h-2 rounded-full bg-current"></span>
      <span>{label}</span>
    </span>
  );
};
