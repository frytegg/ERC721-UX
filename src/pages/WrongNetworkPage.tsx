// src/pages/WrongNetworkPage.tsx
import { Link, useLocation } from "react-router-dom";
import { SEPOLIA_CHAIN_ID_DEC } from "../lib/ethereum";
import { PageHeader, Card, Badge } from "../components";

export function WrongNetworkPage() {
  const location = useLocation();
  const state = location.state as { currentChainId?: number } | undefined;

  return (
    <div style={{display:'flex', justifyContent:'center', alignItems:'flex-start'}}>
      <div style={{width:'100%', maxWidth:'680px'}}>
        <PageHeader title="Wrong Network" subtitle="Please switch your wallet to Sepolia" />
        <Card title="Network Mismatch" subtitle="Your wallet is on a different chain" footer={<span className="text-xs">Change network in MetaMask then reload this page.</span>}>
          <div className="stack">
            <div>
              Expected Network: <Badge variant="info">Sepolia (ChainId {SEPOLIA_CHAIN_ID_DEC})</Badge>
            </div>
            {state?.currentChainId !== undefined && (
              <div>Current ChainId: <Badge variant="danger">{state.currentChainId}</Badge></div>
            )}
            <div className="muted" style={{fontSize:'.85rem'}}>
              This dApp only supports Sepolia. Switch networks in MetaMask, then return.
            </div>
            <div>
              <Link to="/chain-info" className="btn btn-primary">Back to Chain Info</Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
