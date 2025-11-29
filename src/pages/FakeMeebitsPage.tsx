// src/pages/FakeMeebitsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, StatCard, Card, Button, Alert, Spinner, InputField, Badge } from "../components";
import { useGlobalChainInfo } from "../components/GlobalChainContext";
import {
  getBrowserProvider,
  requestAccounts,
  SEPOLIA_CHAIN_ID_DEC,
} from "../lib/ethereum";
import { getFakeMeebitsContract } from "../lib/fakeMeebits";
import { getFakeMeebitsClaimerContract } from "../lib/fakeMeebitsClaimer";
import signaturesJson from "../data/fakeMeebitsSignatures.json";

type SignaturesMap = Record<string, string>; 

const signaturesArray = signaturesJson as { tokenNumber: number; signature: string }[];
const signatures: SignaturesMap = Object.fromEntries(
  signaturesArray.map((s) => [String(s.tokenNumber), s.signature])
);

type MeebitsInfo = {
  name?: string;
  totalSupply?: bigint;
  maxSupply?: bigint;
};

type TokenStatus =
  | "idle"
  | "checking"
  | "available"
  | "minted"
  | "error";

export function FakeMeebitsPage() {
  const [collectionInfo, setCollectionInfo] = useState<MeebitsInfo>({});
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  const [tokenIdInput, setTokenIdInput] = useState<string>("");
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("idle");
  const [tokenOwner, setTokenOwner] = useState<string | null>(null);

  const [loadingCollection, setLoadingCollection] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoadingCollection(true);
      setError(null);
      setSuccess(null);

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
        const addr = await signer.getAddress();
        if (!cancelled) {
          setConnectedAddress(addr);
        }

        const contract = getFakeMeebitsContract(provider);

        const [name, totalSupply] = await Promise.all([
          contract.name(),
          contract.totalSupply(),
        ]);

        if (!cancelled) {
          setCollectionInfo({
            name,
            totalSupply,
          });
        }
      } catch (e: any) {
        if (!cancelled) {
          if (e?.code === 4001) {
            setError("User rejected wallet connection request.");
          } else {
            setError(e?.message || "Failed to load Fake Meebits collection info.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingCollection(false);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function checkTokenStatus(tokenIdStr: string) {
    setError(null);
    setSuccess(null);
    setTokenOwner(null);

    const parsed = tokenIdStr.trim();
    if (!parsed) {
      setTokenStatus("idle");
      return;
    }

    let tokenIdBigInt: bigint;
    try {
      tokenIdBigInt = BigInt(parsed);
    } catch {
      setTokenStatus("error");
      setError("Token ID must be a valid integer.");
      return;
    }

    setTokenStatus("checking");

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

      const contract = getFakeMeebitsContract(provider);

      try {
        const owner: string = await contract.ownerOf(tokenIdBigInt);
        setTokenOwner(owner);
        setTokenStatus("minted");
      } catch {
        setTokenOwner(null);
        setTokenStatus("available");
      }
    } catch (e: any) {
      setTokenStatus("error");
      if (e?.code === 4001) {
        setError("User rejected wallet connection request.");
      } else {
        setError(e?.message || "Failed to check token status.");
      }
    }
  }

  function onTokenIdChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTokenIdInput(e.target.value);
    setTokenStatus("idle");
    setTokenOwner(null);
    setError(null);
    setSuccess(null);
  }

  async function handleCheckClick() {
    await checkTokenStatus(tokenIdInput);
  }

  async function handleClaim() {
    setError(null);
    setSuccess(null);

    const parsed = tokenIdInput.trim();
    if (!parsed) {
      setError("Please enter a token ID.");
      return;
    }

    let tokenIdBigInt: bigint;
    try {
      tokenIdBigInt = BigInt(parsed);
    } catch {
      setError("Token ID must be a valid integer.");
      return;
    }

    // Ensure we believe it's available before sending tx
    if (tokenStatus !== "available") {
      setError("Token is not marked as available. Check status first.");
      return;
    }

    // Lookup signature for this tokenId
    const sig = signatures[parsed];
    if (!sig) {
      setError(`No signature found for token ID ${parsed}.`);
      return;
    }

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
      const claimer = getFakeMeebitsClaimerContract(signer);

      const tx = await claimer.claimAToken(tokenIdBigInt, sig);

      await tx.wait();

      setSuccess(`Successfully claimed Fake Meebit token #${parsed}.`);

      await checkTokenStatus(parsed);
    } catch (e: any) {
      if (e?.code === 4001) {
        setError("User rejected the transaction.");
      } else if (e?.shortMessage || e?.reason) {
        setError(e.shortMessage || e.reason);
      } else {
        setError(e?.message || "Failed to claim Fake Meebit token.");
      }
    } finally {
      setClaiming(false);
    }
  }

  const { setChainInfo } = useGlobalChainInfo();
  useEffect(() => { if (connectedAddress) setChainInfo({ address: connectedAddress }); }, [connectedAddress, setChainInfo]);

  const statusBadge = () => {
    switch (tokenStatus) {
      case 'checking': return <Badge variant="info">Checking…</Badge>;
      case 'available': return <Badge variant="success">Available</Badge>;
      case 'minted': return <Badge variant="danger">Minted</Badge>;
      case 'error': return <Badge variant="danger">Error</Badge>;
      default: return <Badge>Idle</Badge>;
    }
  };

  return (
    <div>
      <PageHeader title="Fake Meebits" subtitle="Signature-based claim for specific token IDs" />

      {loadingCollection && (
        <Card title="Loading" subtitle="Fetching collection stats"><Spinner /></Card>
      )}
      {error && <Alert variant="error" title="Error">{error}</Alert>}
      {success && <Alert variant="success" title="Success">{success}</Alert>}

      {!loadingCollection && !error && (
        <div className="stack">
          <div className="grid grid-3">
            <StatCard label="Connected Address" value={connectedAddress ?? '(not loaded)'} />
            {collectionInfo.name && <StatCard label="Collection Name" value={collectionInfo.name} />}
            {collectionInfo.totalSupply !== undefined && <StatCard label="Total Supply" value={collectionInfo.totalSupply.toString()} />}
          </div>
          {collectionInfo.maxSupply !== undefined && (
            <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))'}}>
              <StatCard label="Max Supply" value={collectionInfo.maxSupply.toString()} />
            </div>
          )}

          <Card title="Claim by Token ID" subtitle="Check availability then claim if signed" footer={<span className="text-xs">Requires a valid pre-generated signature for selected token ID.</span>}>
            <div className="stack">
              <InputField
                label="Token ID"
                type="number"
                min={0}
                value={tokenIdInput}
                onChange={onTokenIdChange}
                error={tokenStatus === 'error' ? error : null}
                hint="Enter a non-negative integer"
              />
              <div className="flex gap-3" style={{alignItems:'center'}}>
                <Button variant="secondary" onClick={handleCheckClick} disabled={!tokenIdInput.trim() || tokenStatus==='checking'} loading={tokenStatus==='checking'}>
                  {tokenStatus==='checking' ? 'Checking…' : 'Check Availability'}
                </Button>
                {statusBadge()}
                {tokenStatus === 'minted' && tokenOwner && <span className="text-xs" style={{color:'var(--color-text-muted)'}}>Owner: {tokenOwner}</span>}
              </div>
              <Button
                variant="primary"
                onClick={handleClaim}
                disabled={claiming || tokenStatus !== 'available'}
                loading={claiming}
              >
                {claiming ? 'Claiming…' : 'Claim this Token'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
