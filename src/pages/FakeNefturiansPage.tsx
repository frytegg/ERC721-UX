// src/pages/FakeNefturiansPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, StatCard, Card, Button, Alert, Spinner, InputField } from "../components";
import { useGlobalChainInfo } from "../components/GlobalChainContext";
import {
  getBrowserProvider,
  requestAccounts,
  SEPOLIA_CHAIN_ID_DEC,
} from "../lib/ethereum";
import { getFakeNefturiansContract } from "../lib/fakeNefturians";
import { formatEther } from "ethers";

export function FakeNefturiansPage() {
  const [priceWei, setPriceWei] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [userAddressInput, setUserAddressInput] = useState("");
  const [navError, setNavError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadPrice() {
      setLoading(true);
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
        const userAddress = await signer.getAddress();
        if (!cancelled) {
          setAddress(userAddress);
        }

        const contract = getFakeNefturiansContract(provider);

        const price: bigint = await contract.tokenPrice();

        if (!cancelled) {
          setPriceWei(price);
        }
      } catch (e: any) {
        if (!cancelled) {
          if (e?.code === 4001) {
            setError("User rejected wallet connection request.");
          } else {
            setError(e?.message || "Failed to load Fake Nefturians price.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPrice();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleBuy() {
    if (priceWei === null) {
      setError("Price not loaded yet.");
      return;
    }

    setBuying(true);
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
      const contract = getFakeNefturiansContract(signer);

      // Requirement: msg.value must be strictly greater than tokenPrice
      const valueToSend = priceWei + 1n;

      const tx = await contract.buyAToken({
        value: valueToSend,
      });

      await tx.wait();

      setSuccess("Successfully bought a Fake Nefturian token.");
    } catch (e: any) {
      if (e?.code === 4001) {
        setError("User rejected the transaction.");
      } else if (e?.shortMessage || e?.reason) {
        setError(e.shortMessage || e.reason);
      } else {
        setError(e?.message || "Failed to buy a Fake Nefturian token.");
      }
    } finally {
      setBuying(false);
    }
  }

  const priceEth =
    priceWei !== null ? formatEther(priceWei) : null;

  function handleGoToUser() {
    setNavError(null);
    const raw = userAddressInput.trim();
    if (raw === "") {
      setNavError("Please enter a user address.");
      return;
    }
    // Basic Ethereum address format check (0x + 40 hex chars)
    if (!/^0x[0-9a-fA-F]{40}$/.test(raw)) {
      setNavError("Invalid Ethereum address format.");
      return;
    }
    navigate(`/fakeNefturians/${raw}`);
  }

  const { setChainInfo } = useGlobalChainInfo();
  useEffect(() => { if (address) setChainInfo({ address }); }, [address, setChainInfo]);

  return (
    <div>
      <PageHeader title="Fake Nefturians" subtitle="Payable mint with minimum price constraint" />

      {loading && (
        <Card title="Loading" subtitle="Fetching price">
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}><Spinner /><span className="muted">Loading minimum token price...</span></div>
        </Card>
      )}

      {error && <Alert variant="error" title="Error">{error}</Alert>}
      {success && <Alert variant="success" title="Success">{success}</Alert>}

      {!loading && !error && (
        <div className="stack">
          <div className="grid grid-3">
            <StatCard label="Connected Address" value={address ?? '(not loaded)'} />
            <StatCard label="Minimum Price" value={priceEth !== null ? `${priceEth} ETH` : '(unknown)'} />
            <StatCard label="Payable Hint" value={<span style={{fontSize:'.7rem'}}>&gt; priceWei must be sent</span>} />
          </div>

          <Card title="Buy a Fake Nefturian" subtitle="Sends a payable transaction" footer={<span className="text-xs">Requires sending strictly more than minimum price.</span>}>
            <Button variant="primary" onClick={handleBuy} loading={buying} disabled={buying || priceWei === null}>
              {buying ? 'Buying…' : 'Buy a Fake Nefturian'}
            </Button>
          </Card>

          <Card title="View User Tokens" subtitle="Lookup tokens owned by an address">
            <div className="stack">
              <InputField
                label="User Address"
                placeholder="0x..."
                value={userAddressInput}
                onChange={(e) => setUserAddressInput(e.target.value)}
                error={navError}
              />
              <Button variant="secondary" onClick={handleGoToUser} disabled={userAddressInput.trim()==='' || !!navError}>Go to User</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
