import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string | null;
  containerClassName?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, hint, error, containerClassName='', className='', ...rest }) => {
  return (
    <div className={containerClassName} style={{display:'flex', flexDirection:'column'}}>
      {label && <label>{label}</label>}
      <input className={className} {...rest} />
      {hint && !error && <div className="text-xs" style={{marginTop:'4px', color:'var(--color-text-muted)'}}>{hint}</div>}
      {error && <div className="text-xs" style={{marginTop:'4px', color:'var(--color-danger)'}}>{error}</div>}
    </div>
  );
};
