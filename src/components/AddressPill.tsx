import React from 'react';

export interface AddressPillProps {
  address?: string | null;
  showCopy?: boolean;
  className?: string;
}

function shorten(addr: string) {
  return addr.length > 10 ? `${addr.slice(0,6)}…${addr.slice(-4)}` : addr;
}

export const AddressPill: React.FC<AddressPillProps> = ({ address, showCopy=true, className='' }) => {
  if (!address) return <span className={`pill ${className}`}>Not connected</span>;
  const display = shorten(address);
  const copy = () => {
    if (showCopy) navigator.clipboard?.writeText(address).catch(() => {});
  };
  return (
    <button type="button" onClick={copy} className={`pill ${className}`} style={{cursor: showCopy ? 'pointer':'default'}} title={showCopy ? 'Copy full address':'Ethereum address'}>
      <span>{display}</span>
      {showCopy && <span style={{opacity:.6}}>⧉</span>}
    </button>
  );
};
