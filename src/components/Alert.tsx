import React from 'react';

type AlertVariant = 'error' | 'success' | 'info' | 'warning';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ variant, title, children, className='' }) => {
  return (
    <div className={`alert alert-${variant} ${className}`.trim()} role="alert">
      <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
        {title && <strong style={{fontSize:'0.8rem'}}>{title}</strong>}
        {children && <div>{children}</div>}
      </div>
    </div>
  );
};
