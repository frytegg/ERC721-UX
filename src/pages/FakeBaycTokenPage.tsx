// src/pages/FakeBaycTokenPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { PageHeader, Card, Spinner, Alert, Badge } from "../components";
import {
  getBrowserProvider,
  requestAccounts,
  SEPOLIA_CHAIN_ID_DEC,
} from "../lib/ethereum";
import { getFakeBaycContract } from "../lib/fakeBayc";
import { fetchJsonFromTokenUri, resolveImageUri, inferPreferredGatewayFromTokenUri } from "../lib/metadata";

type MetadataAttribute = {
  trait_type?: string;
  value?: string | number;
  [key: string]: any;
};

type TokenMetadata = {
  name?: string;
  description?: string;
  image?: string;
  attributes?: MetadataAttribute[];
  [key: string]: any;
};

export function FakeBaycTokenPage() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [tokenUri, setTokenUri] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);

  useEffect(() => {
    if (!tokenId) {
      setError("No tokenId provided in the URL.");
      return;
    }

    let cancelled = false;

    async function loadToken() {
      setLoading(true);
      setError(null);
      setNotFound(false);
      setMetadata(null);
      setTokenUri(null);

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

        const contract = getFakeBaycContract(provider);

        let uri: string;
        try {
          // ethers v6 accepts string or bigint for uint256
          uri = await contract.tokenURI(tokenId);
        } catch (err: any) {
          // Most likely: token does not exist (ERC721 revert)
          if (!cancelled) {
            setNotFound(true);
            setError(null); // we'll show a specific message instead
          }
          return;
        }

        if (cancelled) return;

        setTokenUri(uri);

        try {
          const json = await fetchJsonFromTokenUri(uri);
          if (!cancelled) {
            setMetadata(json);
          }
        } catch (err: any) {
          if (!cancelled) {
            setError(
              err?.message ||
                "Failed to fetch or parse metadata referenced by tokenURI.",
            );
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          if (e?.code === 4001) {
            setError("User rejected wallet connection request.");
          } else {
            setError(e?.message || "Failed to load token data.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadToken();

    return () => {
      cancelled = true;
    };
  }, [tokenId, navigate]);

  const parsedTokenId = tokenId ?? "(unknown)";

  return (
    <div>
      <PageHeader
        title={`Fake BAYC Token #${parsedTokenId}`}
        subtitle={<Link to="/fakeBayc" style={{color:'var(--color-primary)'}}>Back to collection</Link> as any}
      />

      {loading && (
        <Card title="Loading" subtitle={`Fetching metadata for #${parsedTokenId}`}> <Spinner /> </Card>
      )}

      {notFound && !loading && (
        <Alert variant="error" title="Token not found">
          Token #{parsedTokenId} does not exist on Fake BAYC. <Link to="/fakeBayc" style={{color:'var(--color-primary)'}}>Return to collection</Link>.
        </Alert>
      )}

      {error && !loading && (
        <Alert variant="error" title="Error loading token">{error}</Alert>
      )}

      {!loading && !notFound && !error && (
        <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))'}}>
          <Card title={`Token #${parsedTokenId}`} subtitle="NFT Image">
            {metadata?.image ? (
              <img
                className="nft-image"
                src={resolveImageUri(metadata.image, tokenUri ? inferPreferredGatewayFromTokenUri(tokenUri) : undefined)}
                alt={metadata.name || `Fake BAYC #${parsedTokenId}`}
              />
            ) : (
              <div className="empty-state"><h3>No Image</h3>Metadata image field missing.</div>
            )}
          </Card>
          <Card title="Metadata" subtitle="Token details & attributes" footer={tokenUri && <span style={{wordBreak:'break-all'}}><strong>tokenURI:</strong> {tokenUri}</span>}>
            {metadata && (
              <div className="stack">
                {metadata.name && <div><strong>Name:</strong> {metadata.name}</div>}
                {metadata.description && <div style={{whiteSpace:'pre-wrap'}}><strong>Description:</strong> {metadata.description}</div>}
                {Array.isArray(metadata.attributes) && metadata.attributes.length > 0 && (
                  <div className="stack">
                    <strong>Attributes</strong>
                    <div className="flex gap-2" style={{flexWrap:'wrap'}}>
                      {metadata.attributes.map((attr, idx) => (
                        <Badge key={idx} variant="info">{(attr.trait_type ?? 'Trait')+': '+String(attr.value ?? '')}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
