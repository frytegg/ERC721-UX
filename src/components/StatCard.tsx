import React from 'react';

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, className='' }) => {
  return (
    <div className={`stat-card ${className}`}>      
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <span className="stat-card-label">{label}</span>
        {icon && <span style={{fontSize:'1rem', lineHeight:1}}>{icon}</span>}
      </div>
      <div className="stat-card-value">{value}</div>
    </div>
  );
};
