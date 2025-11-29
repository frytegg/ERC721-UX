// src/components/Layout.tsx
import { Link, Outlet, useLocation } from "react-router-dom";
import { AddressPill } from "./AddressPill";
import { useGlobalChainInfo } from "./GlobalChainContext";

export function Layout() {
  const { address, chainId } = useGlobalChainInfo();
  const location = useLocation();

  return (
    <div className="app-shell">
      <header className="layout-header">
        <div style={{display:'flex', alignItems:'center', gap:'var(--space-6)'}}>
          <div className="brand">ERC721 UX Workshop</div>
          <nav className="nav-links">
            <Link to="/chain-info" className={location.pathname.startsWith('/chain-info') ? 'active' : ''}>Chain Info</Link>
            <Link to="/fakeBayc" className={location.pathname.startsWith('/fakeBayc') ? 'active' : ''}>Fake BAYC</Link>
            <Link to="/fakeNefturians" className={location.pathname.startsWith('/fakeNefturians') ? 'active' : ''}>Fake Nefturians</Link>
            <Link to="/fakeMeebits" className={location.pathname.startsWith('/fakeMeebits') ? 'active' : ''}>Fake Meebits</Link>
          </nav>
        </div>
        <div className="header-info">
          <span className="pill" title="Expected network">Sepolia{chainId && chainId !== 11155111 ? ` (Wrong: ${chainId})` : ''}</span>
          <AddressPill address={address} />
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
