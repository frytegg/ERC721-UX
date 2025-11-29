// src/pages/FakeNefturiansUserPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { PageHeader, Card, Spinner, Alert, Badge, AddressPill } from "../components";
import {
  getBrowserProvider,
  requestAccounts,
  SEPOLIA_CHAIN_ID_DEC,
} from "../lib/ethereum";
import { getFakeNefturiansContract } from "../lib/fakeNefturians";
import { fetchJsonFromTokenUri } from "../lib/metadata";
import { isAddress } from "ethers";

type NefturianMetadata = {
  name?: string;
  description?: string;
  [key: string]: any;
};

type OwnedToken = {
  tokenId: bigint;
  uri: string;
  metadata: NefturianMetadata | null;
};

export function FakeNefturiansUserPage() {
  const { userAddress } = useParams<{ userAddress: string }>();
  const navigate = useNavigate();

  const [tokens, setTokens] = useState<OwnedToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userAddress) {
      setError("No userAddress provided in the URL.");
      return;
    }

    if (!isAddress(userAddress)) {
      setError(`Invalid Ethereum address: ${userAddress}`);
      return;
    }

    let cancelled = false;

    async function loadTokens() {
      setLoading(true);
      setError(null);
      setTokens([]);

      try {
        const provider = getBrowserProvider();
        await requestAccounts(); // just to ensure we have permission to use the provider

        const network = await provider.getNetwork();
        const chainId = Number(network.chainId.toString());
        if (chainId !== SEPOLIA_CHAIN_ID_DEC) {
          navigate("/wrong-network", {
            replace: true,
            state: { currentChainId: chainId },
          });
          return;
        }

        const contract = getFakeNefturiansContract(provider);

        // 1) How many tokens does this address own?
        const balance: bigint = await contract.balanceOf(userAddress);

        if (balance === 0n) {
          if (!cancelled) {
            setTokens([]);
          }
          return;
        }

        const balanceNum = Number(balance); // safe in practice for test collections

        // 2) Get token IDs using ERC721Enumerable
        const tokenIdPromises: Promise<bigint>[] = [];
        for (let i = 0; i < balanceNum; i++) {
          tokenIdPromises.push(
            contract.tokenOfOwnerByIndex(userAddress, i) as Promise<bigint>,
          );
        }

        const tokenIds = await Promise.all(tokenIdPromises);

        // 3) For each tokenId, fetch tokenURI + metadata
        const tokenDataPromises: Promise<OwnedToken>[] = tokenIds.map(
          async (tokenId) => {
            let uri: string;
            try {
              uri = await contract.tokenURI(tokenId);
            } catch (err) {
              // If tokenURI fails for some reason, still record the tokenId
              return {
                tokenId,
                uri: "(failed to load tokenURI)",
                metadata: null,
              };
            }

            let metadata: NefturianMetadata | null = null;
            try {
              const json = await fetchJsonFromTokenUri(uri);
              metadata = json as NefturianMetadata;
            } catch (err) {
              metadata = null;
            }

            return { tokenId, uri, metadata };
          },
        );

        const ownedTokens = await Promise.all(tokenDataPromises);

        if (!cancelled) {
          setTokens(ownedTokens);
        }
      } catch (e: any) {
        if (!cancelled) {
          if (e?.code === 4001) {
            setError("User rejected wallet connection request.");
          } else {
            setError(e?.message || "Failed to load Fake Nefturians for user.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadTokens();

    return () => {
      cancelled = true;
    };
  }, [userAddress, navigate]);

  return (
    <div>
      <PageHeader
        title="User's Fake Nefturians"
        subtitle={<Link to="/fakeNefturians" style={{color:'var(--color-primary)'}}>Back to main page</Link> as any}
        actions={<AddressPill address={userAddress} />}
      />

      {loading && (
        <Card title="Loading" subtitle="Querying tokens for user"><Spinner /></Card>
      )}

      {error && <Alert variant="error" title="Error">{error}</Alert>}

      {!loading && !error && tokens.length === 0 && (
        <Card title="No Tokens" subtitle="Empty state">
          <div className="empty-state">
            <h3>No Fake Nefturians</h3>
            <p>No Fake Nefturians found for this address.</p>
          </div>
        </Card>
      )}

      {!loading && !error && tokens.length > 0 && (
        <div className="grid grid-2">
          {tokens.map((t) => {
            const name = t.metadata?.name ?? `Fake Nefturian #${t.tokenId.toString()}`;
            const description = t.metadata?.description ?? '(no description)';
            return (
              <Card
                key={t.tokenId.toString()}
                title={name}
                subtitle={`Token ID ${t.tokenId.toString()}`}
                footer={<small style={{wordBreak:'break-all'}}>tokenURI: {t.uri}</small>}
              >
                <div className="stack">
                  <div style={{fontSize:'.8rem'}}>{description}</div>
                  <div><Badge variant="info">Owned</Badge></div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
