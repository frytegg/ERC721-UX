import React from 'react';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant='default', children, className='' }) => {
  const variantClass = variant === 'default' ? '' : `badge-${variant}`;
  return <span className={`badge ${variantClass} ${className}`.trim()}>{children}</span>;
};
