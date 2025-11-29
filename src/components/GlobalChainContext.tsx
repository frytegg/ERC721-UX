import React, { createContext, useContext, useState } from 'react';

export interface ChainInfoContextValue {
  address?: string;
  chainId?: number;
  setChainInfo: (info: { address?: string; chainId?: number }) => void;
}

const GlobalChainContext = createContext<ChainInfoContextValue | undefined>(undefined);

export const GlobalChainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();

  const setChainInfo = (info: { address?: string; chainId?: number }) => {
    if (info.address !== undefined) setAddress(info.address);
    if (info.chainId !== undefined) setChainId(info.chainId);
  };

  return (
    <GlobalChainContext.Provider value={{ address, chainId, setChainInfo }}>
      {children}
    </GlobalChainContext.Provider>
  );
};

export function useGlobalChainInfo(): ChainInfoContextValue {
  const ctx = useContext(GlobalChainContext);
  if (!ctx) throw new Error('useGlobalChainInfo must be used within GlobalChainProvider');
  return ctx;
}
