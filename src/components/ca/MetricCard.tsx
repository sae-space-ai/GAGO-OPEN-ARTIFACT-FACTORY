import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  trend,
  icon,
  className = '',
}) => {
  return (
    <div className={`ca-metric-card ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="ca-metric-label">{label}</div>
          <div className="ca-metric-value">{value}</div>
        </div>
        {icon && (
          <div className="text-[var(--ca-color-accent-primary)] opacity-50">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={`ca-metric-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {trend.isPositive ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            )}
          </svg>
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
  );
};
