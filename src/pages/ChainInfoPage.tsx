// src/pages/ChainInfoPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, StatCard, Spinner, Alert } from "../components";
import { useGlobalChainInfo } from "../components/GlobalChainContext";
import {
  getBrowserProvider,
  requestAccounts,
  SEPOLIA_CHAIN_ID_DEC,
} from "../lib/ethereum";

type ChainInfoState = {
  chainId?: number;
  blockNumber?: number;
  address?: string;
};

export function ChainInfoPage() {
  const [info, setInfo] = useState<ChainInfoState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setChainInfo } = useGlobalChainInfo();

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError(null);

      try {
        const provider = getBrowserProvider(); // will throw if window.ethereum missing

        // Ask user to connect
        await requestAccounts();

        const network = await provider.getNetwork();
        const chainId = Number(network.chainId.toString());

        if (chainId !== SEPOLIA_CHAIN_ID_DEC) {
          navigate("/wrong-network", {
            replace: true,
            state: { currentChainId: chainId },
          });
          return;
        }

        const blockNumber = await provider.getBlockNumber();
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        if (!cancelled) {
          const data = { chainId, blockNumber, address };
          setInfo(data);
          setChainInfo({ chainId, address });
        }
      } catch (e: any) {
        if (!cancelled) {
          if (e?.code === 4001) {
            setError("User rejected wallet connection request.");
          } else if (
            typeof e?.message === "string" &&
            e.message.includes("MetaMask / window.ethereum not found")
          ) {
            setError(
              "No Ethereum provider detected. Ensure MetaMask is installed and no other wallet extension overrides it.",
            );
          } else {
            setError(e?.message || "Failed to load chain info.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div>
      <PageHeader
        title="Chain Info"
        subtitle="Live connection details for your current Sepolia session"
      />

      {loading && (
        <div className="card" style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <Spinner /> <span className="muted">Loading chain info from MetaMask...</span>
        </div>
      )}

      {error && (
        <Alert variant="error" title="Error loading chain info">
          {error}
        </Alert>
      )}

      {!loading && !error && info.chainId !== undefined && (
        <div className="grid grid-3">
          <StatCard label="Chain ID" value={info.chainId} />
          <StatCard label="Latest Block" value={info.blockNumber?.toString() ?? '—'} />
          <StatCard label="Your Address" value={info.address ?? '—'} />
        </div>
      )}
    </div>
  );
}
