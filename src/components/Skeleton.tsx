import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = '',
  style
}) => {
  return (
    <div 
      className={`skeleton-pulse ${className}`} 
      style={{ width, height, borderRadius, ...style }}
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Skeleton width="60%" height="24px" />
      <Skeleton width="40%" height="16px" />
      <Skeleton width="80%" height="16px" />
    </div>
  );
};
