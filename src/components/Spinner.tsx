import React from 'react';

export const Spinner: React.FC<{ size?: number }> = ({ size=20 }) => {
  return <span className="spinner" style={{ width:size, height:size, borderWidth: size/6 }} />;
};
