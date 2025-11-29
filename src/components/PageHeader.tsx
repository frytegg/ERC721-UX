import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, breadcrumb }) => {
  return (
    <div className="page-header">
      <div className="page-title-wrap">
        {breadcrumb && <div className="text-xs" style={{opacity:.75}}>{breadcrumb}</div>}
        <h1 style={{margin:0}}>{title}</h1>
        {subtitle && <div className="page-subtitle">{subtitle}</div>}
      </div>
      {actions && <div style={{marginTop:'var(--space-4)'}}>{actions}</div>}
    </div>
  );
};
