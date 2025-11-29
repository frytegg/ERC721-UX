// src/pages/FakeBaycPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, StatCard, Spinner, Alert, Button, Card, InputField } from "../components";
import { useGlobalChainInfo } from "../components/GlobalChainContext";
import {
  SEPOLIA_CHAIN_ID_DEC,
  requestAccounts,
  getBrowserProvider,
} from "../lib/ethereum";
import { getFakeBaycContract } from "../lib/fakeBayc";

type FakeBaycInfo = {
  name?: string;
  totalSupply?: bigint;
};

export function FakeBaycPage() {
  const [info, setInfo] = useState<FakeBaycInfo>({});
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [tokenIdInput, setTokenIdInput] = useState("");
  const [navError, setNavError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Load collection info on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const provider = getBrowserProvider();

        // Ensure wallet is connected
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

        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        if (!cancelled) {
          setAddress(userAddress);
        }

        const contract = getFakeBaycContract(provider);

        const [name, totalSupply] = await Promise.all([
          contract.name(),
          contract.totalSupply(), // BigInt in ethers v6
        ]);

        if (!cancelled) {
          setInfo({ name, totalSupply });
        }
      } catch (e: any) {
        if (!cancelled) {
          if (e?.code === 4001) {
            setError("User rejected wallet connection request.");
          } else {
            setError(e?.message || "Failed to load Fake BAYC info.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Claim/mint handler
  async function handleClaim() {
    setError(null);
    setClaiming(true);
    try {
      const provider = getBrowserProvider();
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

      const signer = await provider.getSigner();
      const contract = getFakeBaycContract(signer);

      const tx = await contract.claimAToken();

      // Wait for mining
      await tx.wait();

      // Refresh totalSupply after mint
      const refreshedTotalSupply = await contract.totalSupply();
      setInfo((prev) => ({
        ...prev,
        totalSupply: refreshedTotalSupply,
      }));
    } catch (e: any) {
      if (e?.code === 4001) {
        setError("User rejected the transaction.");
      } else if (e?.shortMessage || e?.reason) {
        setError(e.shortMessage || e.reason);
      } else {
        setError(e?.message || "Failed to claim a Fake BAYC token.");
      }
    } finally {
      setClaiming(false);
    }
  }

  function handleGoToToken() {
    setNavError(null);
    const raw = tokenIdInput.trim();
    if (raw === "") {
      setNavError("Please enter a token ID.");
      return;
    }
    // Allow decimal only
    if (!/^\d+$/.test(raw)) {
      setNavError("Token ID must be a non-negative integer.");
      return;
    }
    navigate(`/fakeBayc/${raw}`);
  }

  const { setChainInfo } = useGlobalChainInfo();

  // push address into context when loaded
  useEffect(() => {
    if (address) setChainInfo({ address });
  }, [address, setChainInfo]);

  return (
    <div>
      <PageHeader
        title="Fake BAYC"
        subtitle="Simple ERC721 collection you can claim from"
      />

      {loading && (
        <div className="card" style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <Spinner /> <span className="muted">Loading Fake BAYC info...</span>
        </div>
      )}

      {error && (
        <Alert variant="error" title="Error loading collection">{error}</Alert>
      )}

      {!loading && !error && (
        <div className="stack">
          <div className="grid grid-3">
            <StatCard label="Collection Name" value={info.name ?? '(unknown)'} />
            <StatCard label="Total Supply" value={info.totalSupply !== undefined ? info.totalSupply.toString() : '(unknown)'} />
            <StatCard label="Connected Address" value={address ?? '(not loaded)'} />
          </div>

            <Card
              title="Claim a Token"
              subtitle="Mint yourself a new Fake BAYC NFT"
              footer={<span>Claiming sends a transaction that mints a new token to your address.</span>}
            >
              <div className="stack">
                <Button variant="primary" onClick={handleClaim} loading={claiming} disabled={claiming}>
                  {claiming ? 'Claiming…' : 'Claim a Fake BAYC Token'}
                </Button>
                <div className="muted text-xs">A successful claim increases the total supply above.</div>
              </div>
            </Card>

            <Card title="View Token Metadata" subtitle="Jump directly to a token details page">
              <div className="stack">
                <InputField
                  label="Token ID"
                  placeholder="e.g. 0"
                  value={tokenIdInput}
                  onChange={(e) => setTokenIdInput(e.target.value)}
                  error={navError}
                />
                <Button variant="secondary" onClick={handleGoToToken} disabled={tokenIdInput.trim()==='' || !!navError}>Go to Token</Button>
              </div>
            </Card>
        </div>
      )}
    </div>
  );
}
