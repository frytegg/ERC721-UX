import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  headerExtra?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, footer, headerExtra, children, className = '', ...rest }) => {
  return (
    <div className={`card ${className}`} {...rest}>
      {(title || subtitle || headerExtra) && (
        <div className="card-header" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px'}}>
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
          </div>
          {headerExtra && <div>{headerExtra}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};
