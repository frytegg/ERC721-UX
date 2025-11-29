import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  leftIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant='ghost', loading=false, leftIcon, children, className='', ...rest }) => {
  return (
    <button className={`btn btn-${variant} ${className}`} disabled={loading || rest.disabled} {...rest}>
      {loading && <span className="spinner" style={{width:14,height:14,borderWidth:2}} />}
      {!loading && leftIcon}
      <span>{children}</span>
    </button>
  );
};
